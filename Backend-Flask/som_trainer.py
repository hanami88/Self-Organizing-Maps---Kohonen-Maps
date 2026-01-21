import numpy as np
from minisom import MiniSom
class SOMTrainer:
    def __init__(self, data, grid_size=(50, 50), learning_rate=0.5):
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

        # Random init weights
        self.som.random_weights_init(data)

    def train_with_history(self, total_epochs, snapshot_interval=10):
        """
        Training và lưu lại history để frontend hiển thị
        Returns:
            List of snapshots: [{epoch, weights, error}, ...]
        """
        history = []

        for epoch in range(0, total_epochs, snapshot_interval):
            # Train một đợt
            self.som.train_random(self.data, snapshot_interval)

            # Tính error
            error = self.calculate_error()

            # Lưu snapshot
            history.append({
                'epoch': epoch + snapshot_interval,
                'weights': self.som.get_weights().tolist(),
                'error': float(error)
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