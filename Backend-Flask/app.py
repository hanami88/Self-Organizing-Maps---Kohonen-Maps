from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from som_trainer import SOMTrainer
import pandas as pd
app = Flask(__name__)
CORS(app)

som_trainer = None

# Biến toàn cục để lưu min/max (để debug hoặc dùng lại nếu cần)
data_min = None
data_max = None


@app.route('/api/upload', methods=['POST'])
def upload_data():
    try:
        file = request.files['file']

        # --- CÁCH MỚI: DÙNG PANDAS (Dễ và Chuẩn nhất) ---
        # Pandas tự động tách Header và Data
        df = pd.read_csv(file)

        # 1. Lấy danh sách tên cột (Headers)
        headers = df.columns.tolist()  # Ví dụ: ['Age', 'Income', 'CreditScore']

        # 2. Lấy dữ liệu số (Data body)
        raw_data = df.values  # Chuyển về dạng numpy array

        print(f"Headers detected: {headers}")
        print(f"Raw Data shape: {raw_data.shape}")

        # --- CÁC BƯỚC SAU GIỮ NGUYÊN ---

        # 3. Chuẩn hóa (Min-Max)
        global data_min, data_max
        data_min = np.min(raw_data, axis=0)
        data_max = np.max(raw_data, axis=0)

        denominator = data_max - data_min
        denominator[denominator == 0] = 1.0
        normalized_data = (raw_data - data_min) / denominator

        # 4. Khởi tạo SOM
        grid_x = int(request.form.get('grid_x', 10))
        grid_y = int(request.form.get('grid_y', 10))
        learning_rate = float(request.form.get('learning_rate', 0.5))

        global som_trainer
        som_trainer = SOMTrainer(
            data=normalized_data,
            grid_size=(grid_x, grid_y),
            learning_rate=learning_rate
        )

        initial_weights = som_trainer.get_current_weights()

        return jsonify({
            'success': True,
            'message': 'Data uploaded successfully',
            'data_shape': list(raw_data.shape),

            # --- THÊM DÒNG NÀY ĐỂ GỬI VỀ CLIENT ---
            'columns': headers,

            'min_values': data_min.tolist(),
            'max_values': data_max.tolist(),
            'weights': initial_weights.tolist()
        })

    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/train', methods=['POST'])
def train():
    try:
        epochs = int(request.json.get('epochs', 100))

        if som_trainer is None:
            return jsonify({'error': 'No data uploaded'}), 400

        print(f"Starting training for {epochs} epochs...")

        # Logic tính interval thông minh như đã bàn
        # Luôn đảm bảo lấy khoảng 50 frames để vẽ đồ thị cho đẹp
        interval = max(1, int(epochs / 20))

        results = som_trainer.train_with_history(epochs, interval)

        print(f"Training complete! Results: {len(results)} snapshots")

        return jsonify({
            'success': True,
            'results': results
        })

    except Exception as e:
        print(f"Training error: {str(e)}")
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5001)