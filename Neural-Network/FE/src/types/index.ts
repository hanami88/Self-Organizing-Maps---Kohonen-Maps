export interface NeuronPosition {
  neuron_idx: number;
  som_x: number;
  som_y: number;
  weight_norm: number;
}

export interface LayerSOM {
  layer_idx: number;
  layer_name: string;
  n_neurons: number;
  n_weights: number;
  som_size: number;
  neuron_positions: NeuronPosition[];
  u_matrix: number[][];
  activation_map: number[][];
}

export interface TrainingConfig {
  epochs: number;
  hidden_sizes: number[];
  lr: number;
  batch_size: number;
  som_interval: number;
}

export interface TrainingStatus {
  running: boolean;
  epoch: number;
  total_epochs: number;
  loss: number;
  accuracy: number;
  layer_names: string[];
  has_results: boolean;
}

export interface EpochUpdate {
  type: "epoch_update" | "training_started" | "training_complete" | "init";
  epoch?: number;
  total_epochs?: number;
  loss?: number;
  accuracy?: number;
  layer_soms?: LayerSOM[];
  config?: TrainingConfig;
  status?: TrainingStatus;
  results?: LayerSOM[];
}
