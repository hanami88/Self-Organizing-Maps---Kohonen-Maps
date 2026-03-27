from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from som_trainer import SOMTrainer

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Thêm resources


@app.route('/api/train', methods=['POST'])
def train():
    try:
        data = request.get_json()
        # Lấy weights từ neurons
        raw_data = np.array([n['weights'] for n in data.get('neurons')], dtype=float)

        iterations = int(data.get('iterations'))
        grid_x = data.get('X')
        grid_y = data.get('Y')
        learning_rate = float(data.get('learningRate'))
        # Validate
        if iterations == 0:
            return jsonify({'error': 'iterations không được bằng 0'}), 400
        if learning_rate == 0:
            return jsonify({'error': 'learningRate không được bằng 0'}), 400
        # Normalize
        data_min = np.min(raw_data, axis=0)
        data_max = np.max(raw_data, axis=0)
        denominator = data_max - data_min
        denominator[denominator == 0] = 1.0
        normalized_data = (raw_data - data_min) / denominator

        som_trainer = SOMTrainer(
            data=normalized_data,
            grid_size=(grid_x, grid_y),
            learning_rate=learning_rate
        )
        results = som_trainer.train_with_history(iterations, 10)

        return jsonify({'success': True, 'results': results})

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5002)