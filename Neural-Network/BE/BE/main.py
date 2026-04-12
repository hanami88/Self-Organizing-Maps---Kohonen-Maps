import threading
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from minisom import MiniSom

app = Flask(__name__)
app.config["SECRET_KEY"] = "som-viz-secret"
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# ── Neural Network ─────────────────────────────────────────────────────────
class MNISTNet(nn.Module):
    def __init__(self, hidden_sizes: list):
        super().__init__()
        layers = []
        in_size = 784
        for h in hidden_sizes:
            layers += [nn.Linear(in_size, h), nn.ReLU()]
            in_size = h
        layers.append(nn.Linear(in_size, 10))
        self.net = nn.Sequential(*layers)
        self.hidden_sizes = hidden_sizes

    def forward(self, x):
        return self.net(x.view(-1, 784))

    def get_layer_weights(self):
        weights = []
        for module in self.net:
            if isinstance(module, nn.Linear):
                weights.append(module.weight.detach().cpu().numpy())
        return weights[:-1]  # bỏ lớp output


# ── SOM helper ─────────────────────────────────────────────────────────────
def train_som_on_weights(weight_matrix: np.ndarray, som_size: int = 8) -> dict:
    """
    weight_matrix: (n_neurons, n_weights)
    Mỗi hàng = vector trọng số của 1 neuron trong hidden layer.
    """
    n_neurons, n_dims = weight_matrix.shape
    som = MiniSom(som_size, som_size, n_dims,
                  sigma=1.5, learning_rate=0.5,
                  neighborhood_function="gaussian", random_seed=42)
    som.random_weights_init(weight_matrix)
    som.train(weight_matrix, num_iteration=500, verbose=False)

    neuron_positions = []
    for i, w in enumerate(weight_matrix):
        bmu = som.winner(w)
        neuron_positions.append({
            "neuron_idx": int(i),
            "som_x":      int(bmu[0]),
            "som_y":      int(bmu[1]),
            "weight_norm": float(np.linalg.norm(w)),
        })

    u_matrix = som.distance_map().tolist()

    activation_map = np.zeros((som_size, som_size))
    for w in weight_matrix:
        bmu = som.winner(w)
        activation_map[bmu] += 1
    mx = activation_map.max()
    activation_map = (activation_map / mx if mx > 0 else activation_map).tolist()

    return {
        "som_size":        som_size,
        "neuron_positions": neuron_positions,
        "u_matrix":        u_matrix,
        "activation_map":  activation_map,
    }


# ── Global training state ──────────────────────────────────────────────────
state = {
    "running":      False,
    "stop_flag":    False,
    "epoch":        0,
    "total_epochs": 0,
    "loss":         0.0,
    "accuracy":     0.0,
    "layer_soms":   [],
    "layer_names":  [],
}


# ── REST API ───────────────────────────────────────────────────────────────
@app.route("/status")
def get_status():
    return jsonify({
        "running":      state["running"],
        "epoch":        state["epoch"],
        "total_epochs": state["total_epochs"],
        "loss":         state["loss"],
        "accuracy":     state["accuracy"],
        "layer_names":  state["layer_names"],
        "has_results":  len(state["layer_soms"]) > 0,
    })


@app.route("/results")
def get_results():
    return jsonify({
        "layer_soms":  state["layer_soms"],
        "layer_names": state["layer_names"],
        "epoch":       state["epoch"],
        "loss":        state["loss"],
        "accuracy":    state["accuracy"],
    })


@app.route("/stop", methods=["POST"])
def stop_training():
    state["stop_flag"] = True
    return jsonify({"message": "Stop signal sent"})


@app.route("/train", methods=["POST"])
def start_training():
    if state["running"]:
        return jsonify({"error": "Already training"}), 400

    cfg          = request.get_json() or {}
    epochs       = int(cfg.get("epochs", 5))
    hidden_sizes = cfg.get("hidden_sizes", [128, 64])
    lr           = float(cfg.get("lr", 0.001))
    batch_size   = int(cfg.get("batch_size", 256))
    som_interval = int(cfg.get("som_interval", 1))

    threading.Thread(
        target=_training_thread,
        args=(epochs, hidden_sizes, lr, batch_size, som_interval),
        daemon=True,
    ).start()

    return jsonify({"message": "Training started", "config": cfg})


# ── Training thread ────────────────────────────────────────────────────────
def _training_thread(epochs, hidden_sizes, lr, batch_size, som_interval):
    state.update({
        "running": True, "stop_flag": False,
        "epoch": 0, "total_epochs": epochs,
        "layer_soms": [], "loss": 0.0, "accuracy": 0.0,
    })
    state["layer_names"] = [
        f"Hidden {i+1} ({h} neurons)" for i, h in enumerate(hidden_sizes)
    ]

    socketio.emit("training_started", {
        "config": {
            "epochs": epochs, "hidden_sizes": hidden_sizes,
            "lr": lr, "batch_size": batch_size,
        }
    })

    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,)),
    ])
    train_ds     = datasets.MNIST("./data", train=True,  download=True, transform=transform)
    test_ds      = datasets.MNIST("./data", train=False, download=True, transform=transform)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,  num_workers=0)
    test_loader  = DataLoader(test_ds,  batch_size=1000,       shuffle=False, num_workers=0)

    model     = MNISTNet(hidden_sizes)
    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(1, epochs + 1):
        if state["stop_flag"]:
            break

        model.train()
        total_loss = 0.0
        for bx, by in train_loader:
            if state["stop_flag"]:
                break
            optimizer.zero_grad()
            loss = criterion(model(bx), by)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        # Đánh giá trên test set
        model.eval()
        correct = total = 0
        with torch.no_grad():
            for bx, by in test_loader:
                pred = model(bx).argmax(dim=1)
                correct += (pred == by).sum().item()
                total   += by.size(0)

        state["epoch"]    = epoch
        state["loss"]     = round(total_loss / len(train_loader), 4)
        state["accuracy"] = round(correct / total, 4)

        # Train SOM trên weight mỗi hidden layer
        if epoch % som_interval == 0 or epoch == epochs:
            layer_soms = []
            for i, W in enumerate(model.get_layer_weights()):
                result = train_som_on_weights(W, som_size=8)
                result.update({
                    "layer_idx":  i,
                    "layer_name": state["layer_names"][i],
                    "n_neurons":  int(W.shape[0]),
                    "n_weights":  int(W.shape[1]),
                })
                layer_soms.append(result)
            state["layer_soms"] = layer_soms

        socketio.emit("epoch_update", {
            "epoch":        state["epoch"],
            "total_epochs": epochs,
            "loss":         state["loss"],
            "accuracy":     state["accuracy"],
            "layer_soms":   state["layer_soms"],
        })

    state["running"] = False
    socketio.emit("training_complete", {
        "epoch":    state["epoch"],
        "accuracy": state["accuracy"],
    })


# ── Socket.IO events ───────────────────────────────────────────────────────
@socketio.on("connect")
def on_connect():
    emit("init", {
        "status": {
            "running":      state["running"],
            "epoch":        state["epoch"],
            "total_epochs": state["total_epochs"],
            "loss":         state["loss"],
            "accuracy":     state["accuracy"],
            "layer_names":  state["layer_names"],
        },
        "results": state["layer_soms"],
    })


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8000, debug=False, allow_unsafe_werkzeug=True)