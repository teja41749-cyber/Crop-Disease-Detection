import tensorflow as tf
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess

model = tf.keras.models.load_model('plant_disease_model.keras')
with open('class_names.json') as f:
    import json
    class_names = json.load(f)

# Create a more realistic leaf-like image
# Green with some texture
leaf = np.zeros((1, 128, 128, 3), dtype=np.float32)
leaf[0, :, :, 1] = 0.6  # Green
leaf[0, :, :, 0] = 0.2  # Some red
leaf[0, :, :, 2] = 0.1  # Some blue
# Add some noise/texture
np.random.seed(42)
leaf += np.random.normal(0, 0.05, leaf.shape)
leaf = np.clip(leaf, 0, 1)

print("=== Test 1: Input 0-1 (current app.py) ===")
preds = model.predict(leaf, verbose=0)
print(f"Max: {np.max(preds[0]):.4f} ({class_names[np.argmax(preds[0])]})")
print(f"Top 3: {[(class_names[i], f'{preds[0][i]*100:.2f}%') for i in np.argsort(preds[0])[-3:][::-1]]}")

print("\n=== Test 2: Input 0-255 (raw uint8 as float) ===")
leaf_255 = (leaf * 255).astype(np.float32)
preds = model.predict(leaf_255, verbose=0)
print(f"Max: {np.max(preds[0]):.4f} ({class_names[np.argmax(preds[0])]})")
print(f"Top 3: {[(class_names[i], f'{preds[0][i]*100:.2f}%') for i in np.argsort(preds[0])[-3:][::-1]]}")

print("\n=== Test 3: MobileNetV2 preprocess_input (scales to [-1,1]) ===")
leaf_mn = mobilenet_preprocess((leaf * 255).astype(np.float32))
preds = model.predict(leaf_mn, verbose=0)
print(f"Max: {np.max(preds[0]):.4f} ({class_names[np.argmax(preds[0])]})")
print(f"Top 3: {[(class_names[i], f'{preds[0][i]*100:.2f}%') for i in np.argsort(preds[0])[-3:][::-1]]}")

print("\n=== Test 4: Simple [-1, 1] scaling ===")
leaf_scaled = leaf * 2.0 - 1.0
preds = model.predict(leaf_scaled, verbose=0)
print(f"Max: {np.max(preds[0]):.4f} ({class_names[np.argmax(preds[0])]})")
print(f"Top 3: {[(class_names[i], f'{preds[0][i]*100:.2f}%') for i in np.argsort(preds[0])[-3:][::-1]]}")

print("\n=== Test 5: ImageNet mean/std normalization ===")
# ImageNet mean: [0.485, 0.456, 0.406], std: [0.229, 0.224, 0.225]
imagenet_mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
imagenet_std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
leaf_imagenet = (leaf - imagenet_mean) / imagenet_std
preds = model.predict(leaf_imagenet, verbose=0)
print(f"Max: {np.max(preds[0]):.4f} ({class_names[np.argmax(preds[0])]})")
print(f"Top 3: {[(class_names[i], f'{preds[0][i]*100:.2f}%') for i in np.argsort(preds[0])[-3:][::-1]]}")

print("\n=== Test 6: Centered 0-1 (subtract 0.5) ===")
leaf_centered = leaf - 0.5
preds = model.predict(leaf_centered, verbose=0)
print(f"Max: {np.max(preds[0]):.4f} ({class_names[np.argmax(preds[0])]})")
print(f"Top 3: {[(class_names[i], f'{preds[0][i]*100:.2f}%') for i in np.argsort(preds[0])[-3:][::-1]]}")

print("\n=== Test 7: Just divide by 255 but input is 0-255 uint8 ===")
# This is what app.py does: PIL -> numpy (0-255) -> / 255.0
leaf_uint8 = (leaf * 255).astype(np.uint8)
leaf_from_app = leaf_uint8.astype(np.float32) / 255.0
preds = model.predict(leaf_from_app, verbose=0)
print(f"Max: {np.max(preds[0]):.4f} ({class_names[np.argmax(preds[0])]})")
print(f"Top 3: {[(class_names[i], f'{preds[0][i]*100:.2f}%') for i in np.argsort(preds[0])[-3:][::-1]]}")

# Let's also check what the model's first conv layer weights look like
# to understand expected input range
print("\n=== First Conv Layer Weights ===")
mobilenet = model.layers[2]
first_conv = mobilenet.layers[1]  # Conv1
weights = first_conv.get_weights()[0]
print(f"Weight shape: {weights.shape}")
print(f"Weight range: {weights.min():.4f} to {weights.max():.4f}")
print(f"Weight mean: {weights.mean():.4f}")