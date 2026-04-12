import numpy as np
from minisom import MiniSom
class SOMTrainer:
    def __init__(self, data, grid_size=(10, 10), learning_rate=0.5):
        self.data = data
        self.grid_x, self.grid_y = grid_size
        # Khởi tạo SOM
        self.som = MiniSom(
            x=self.grid_x,
            y=self.grid_y,
            input_len=data.shape[1],
            sigma=1.0,
            learning_rate=learning_rate
        )
        self.som.pca_weights_init(data)
    def train_with_history(self, total_iterations, snapshot_interval=10):
        history = []
        for iteration in range(0, total_iterations, snapshot_interval):
            # Train một đợt
            self.som.train_random(self.data, snapshot_interval)
            # Tính error
            error = self.calculate_error()
            u_matrix = self.get_u_matrix()
            # Lưu snapshot
            history.append({
                'iteration': iteration + snapshot_interval,
                'error': float(error),
                'u_matrix': u_matrix
            })
        return history

    def calculate_error(self):
        """Tính  error"""
        error = 0
        for x in self.data:
            bmu = self.som.winner(x)
            bmu_weights = self.som.get_weights()[bmu]
            error += np.linalg.norm(x - bmu_weights)
        return error / len(self.data)

    def get_current_weights(self):
        """Lấy weights hiện tại"""
        return self.som.get_weights()
    def get_u_matrix(self):
        # Hàm distance_map() của MiniSom tự động tính U-Matrix
        # Nó trả về mảng 2 chiều chứa khoảng cách
        return self.som.distance_map().tolist()