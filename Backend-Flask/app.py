from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from som_trainer import SOMTrainer

app = Flask(__name__)
CORS(app)

som_trainer = None

@app.route('/')
def home():
    return "<h1>Xin chào! Đây là Flask chạy trên PyCharm.</h1>"

@app.route('/api/upload', methods=['POST'])
def upload_data():
    try:
        file = request.files['file']

        # Đọc CSV - BỎ QUA HEADER
        data = np.loadtxt(file, delimiter=',', skiprows=1)

        print(f"Data loaded: {data.shape}")  # DEBUG
        print(f"First 3 rows:\n{data[:3]}")  # DEBUG

        grid_x = int(request.form.get('grid_x', 10))
        grid_y = int(request.form.get('grid_y', 10))
        learning_rate = float(request.form.get('learning_rate', 0.5))

        global som_trainer
        som_trainer = SOMTrainer(
            data=data,
            grid_size=(grid_x, grid_y),
            learning_rate=learning_rate
        )

        # LẤY WEIGHTS BAN ĐẦU
        initial_weights = som_trainer.get_current_weights()

        return jsonify({
            'success': True,
            'data_shape': list(data.shape),
            'message': 'Data uploaded successfully',
            'weights': initial_weights.tolist()  # ← THÊM NÀY
        })

    except Exception as e:
        print(f"Upload error: {str(e)}")  # DEBUG
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/train', methods=['POST'])
def train():
    try:
        epochs = int(request.json.get('epochs', 100))

        if som_trainer is None:
            return jsonify({'error': 'No data uploaded'}), 400

        print(f"Starting training for {epochs} epochs...")  # DEBUG

        # Training
        results = som_trainer.train_with_history(epochs, snapshot_interval=10)

        print(f"Training complete! Results: {len(results)} snapshots")  # DEBUG

        # DEBUG: In ra 1 snapshot để kiểm tra
        if len(results) > 0:
            print(f"First snapshot keys: {results[0].keys()}")
            print(f"Weights shape: {np.array(results[0]['weights']).shape}")

        return jsonify({
            'success': True,
            'results': results
        })

    except Exception as e:
        print(f"Training error: {str(e)}")  # DEBUG
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5001)