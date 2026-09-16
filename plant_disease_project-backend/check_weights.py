import tensorflow as tf
import numpy as np

model = tf.keras.models.load_model('plant_disease_model.keras')

# Check MobileNetV2 weights - are they pre-trained?
mobilenet = model.layers[2]

# Check a few layers
print("=== MobileNetV2 Layer Weights ===")
for i, layer in enumerate(mobilenet.layers[:10]):
    weights = layer.get_weights()
    if weights:
        w = weights[0]
        print(f"Layer {i} ({layer.name}): shape={w.shape}, range=[{w.min():.4f}, {w.max():.4f}], mean={w.mean():.4f}")

# Check the dense layers
print("\n=== Dense Layers ===")
for layer in model.layers[3:]:
    weights = layer.get_weights()
    if weights:
        w = weights[0]
        print(f"{layer.name}: shape={w.shape}, range=[{w.min():.4f}, {w.max():.4f}], mean={w.mean():.4f}")

# Compare with a fresh MobileNetV2
print("\n=== Fresh MobileNetV2 (ImageNet) for comparison ===")
from tensorflow.keras.applications import MobileNetV2
fresh_mn = MobileNetV2(input_shape=(128, 128, 3), include_top=False, weights='imagenet')
for i, layer in enumerate(fresh_mn.layers[:10]):
    weights = layer.get_weights()
    if weights:
        w = weights[0]
        print(f"Layer {i} ({layer.name}): shape={w.shape}, range=[{w.min():.4f}, {w.max():.4f}], mean={w.mean():.4f}")