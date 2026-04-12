"""
Mock server — chạy thay main.py để test FE mà không cần train thật.
Gửi fake epoch_update mỗi 2 giây với dữ liệu SOM ngẫu nhiên.
"""
import time
import random
import math
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading

app = Flask(__name__)
app.config["SECRET_KEY"] = "mock"
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# ── Fake SOM data generator ────────────────────────────────────────────────
def make_fake_som(layer_idx: int, n_neurons: int, som_size: int = 8, epoch: int = 1) -> dict:
    """
    Sinh SOM data giả trông giống thật:
    - U-matrix: blob pattern (cụm tối ở giữa, sáng ở rìa)
    - activation_map: vài ô đông, phần lớn ô thưa
    - neuron_positions: phân bố ngẫu nhiên có xu hướng cụm
    """
    rng = np.random.default_rng(seed=layer_idx * 100 + epoch)

    # U-matrix — gaussian blobs tạo cảm giác cụm thật
    u = np.zeros((som_size, som_size))
    n_blobs = 3 + layer_idx
    for _ in range(n_blobs):
        cx = rng.uniform(1, som_size - 2)
        cy = rng.uniform(1, som_size - 2)
        for r in range(som_size):
            for c in range(som_size):
                d = math.sqrt((r - cx)**2 + (c - cy)**2)
                u[r][c] += math.exp(-d**2 / (2 * (1.5 + epoch * 0.1)**2))
    u = (u - u.min()) / (u.max() - u.min() + 1e-9)
    # Invert: vùng cụm tối, rìa sáng
    u = 1.0 - u

    # Activation map — sparse, vài ô hot
    activation = np.zeros((som_size, som_size))
    n_hot = max(4, n_neurons // 12)
    hot_cells = [(rng.integers(0, som_size), rng.integers(0, som_size)) for _ in range(n_hot)]
    for r, c in hot_cells:
        activation[r][c] = rng.uniform(0.5, 1.0)
    # Scatter nhẹ xung quanh
    for r in range(som_size):
        for c in range(som_size):
            activation[r][c] += rng.uniform(0, 0.15)
    activation = (activation / activation.max()).tolist()

    # Neuron positions — random nhưng có xu hướng kéo về cụm
    neuron_positions = []
    centers = [(rng.integers(1, som_size-1), rng.integers(1, som_size-1)) for _ in range(n_blobs)]
    for i in range(n_neurons):
        cx, cy = centers[i % n_blobs]
        sx = int(np.clip(rng.normal(cx, 1.8), 0, som_size - 1))
        sy = int(np.clip(rng.normal(cy, 1.8), 0, som_size - 1))
        norm = float(rng.uniform(0.3, 2.5))
        # Norm tăng dần theo epoch (mô phỏng weights hội tụ)
        norm = norm * (0.7 + epoch * 0.04)
        neuron_positions.append({
            "neuron_idx": i,
            "som_x": sx,
            "som_y": sy,
            "weight_norm": round(norm, 4),
        })

    return {
        "som_size": som_size,
        "neuron_positions": neuron_positions,
        "u_matrix": u.tolist(),
        "activation_map": activation,
    }


def make_epoch_data(epoch: int, total_epochs: int, hidden_sizes: list) -> dict:
    progress = epoch / total_epochs
    # Loss giảm dần, accuracy tăng dần (có noise)
    loss     = round(2.3 * math.exp(-3 * progress) + random.uniform(-0.02, 0.02), 4)
    accuracy = round(min(0.99, 0.1 + 0.88 * (1 - math.exp(-4 * progress)) + random.uniform(-0.005, 0.005)), 4)

    layer_soms = []
    layer_names = [f"Hidden {i+1} ({h} neurons)" for i, h in enumerate(hidden_sizes)]
    for i, h in enumerate(hidden_sizes):
        result = make_fake_som(layer_idx=i, n_neurons=h, som_size=8, epoch=epoch)
        result.update({
            "layer_idx":  i,
            "layer_name": layer_names[i],
            "n_neurons":  h,
            "n_weights":  hidden_sizes[i - 1] if i > 0 else 784,
        })
        layer_soms.append(result)

    return {
        "epoch":        epoch,
        "total_epochs": total_epochs,
        "loss":         loss,
        "accuracy":     accuracy,
        "layer_soms":   layer_soms,
    }


# ── State ──────────────────────────────────────────────────────────────────
state = {
    "running": False, "stop_flag": False,
    "epoch": 0, "total_epochs": 0,
    "loss": 0.0, "accuracy": 0.0,
    "layer_soms": [], "layer_names": [],
    "hidden_sizes": [128, 64],
}


# ── REST ───────────────────────────────────────────────────────────────────
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
def stop():
    state["stop_flag"] = True
    return jsonify({"message": "stopped"})

@app.route("/train", methods=["POST"])
def train():
    if state["running"]:
        return jsonify({"error": "already running"}), 400
    cfg = request.get_json() or {}
    epochs       = int(cfg.get("epochs", 8))
    hidden_sizes = cfg.get("hidden_sizes", [128, 64])
    threading.Thread(target=_mock_train, args=(epochs, hidden_sizes), daemon=True).start()
    return jsonify({"message": "mock training started"})


# ── Mock training loop ─────────────────────────────────────────────────────
def _mock_train(epochs: int, hidden_sizes: list):
    state.update({
        "running": True, "stop_flag": False,
        "epoch": 0, "total_epochs": epochs,
        "hidden_sizes": hidden_sizes,
        "layer_names": [f"Hidden {i+1} ({h} neurons)" for i, h in enumerate(hidden_sizes)],
    })

    socketio.emit("training_started", {
        "config": {"epochs": epochs, "hidden_sizes": hidden_sizes, "lr": 0.001, "batch_size": 256}
    })

    for epoch in range(1, epochs + 1):
        if state["stop_flag"]:
            break
        time.sleep(1.5)   # giả lập thời gian train 1 epoch

        data = make_epoch_data(epoch, epochs, hidden_sizes)
        state.update({
            "epoch":      epoch,
            "loss":       data["loss"],
            "accuracy":   data["accuracy"],
            "layer_soms": data["layer_soms"],
        })
        socketio.emit("epoch_update", data)
        print(f"[mock] epoch {epoch}/{epochs}  loss={data['loss']}  acc={data['accuracy']:.1%}")

    state["running"] = False
    socketio.emit("training_complete", {"epoch": state["epoch"], "accuracy": state["accuracy"]})
    print("[mock] done")


# ── Socket connect ─────────────────────────────────────────────────────────
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
    print(f"[mock] client connected")


if __name__ == "__main__":
    print("Mock server running on http://localhost:8000")
    print("Không cần PyTorch hay MNIST — dữ liệu hoàn toàn giả lập")
    socketio.run(app, host="0.0.0.0", port=8000, debug=False, allow_unsafe_werkzeug=True)