import tensorflow as tf
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess

model = tf.keras.models.load_model('plant_disease_model.keras')
with open('class_names.json') as f:
    import json
    class_names = json.load(f)

# Test with a very specific pattern that should trigger strong features
# Create an image with strong edges/textures like a diseased leaf
img = np.zeros((1, 128, 128, 3), dtype=np.float32)
# Add vertical stripes (like leaf veins)
img[0, :, ::4, 1] = 1.0
img[0, :, 1::4, 1] = 0.3
img[0, :, :, 0] = 0.2
img[0, :, :, 2] = 0.1

print("=== Striped pattern (leaf-like) ===")
for name, preprocess in [
    ("app.py /255", lambda x: x),
    ("MobileNetV2 preprocess", lambda x: mobilenet_preprocess(x * 255)),
    ("[-1,1] scaling", lambda x: x * 2 - 1),
    ("raw 0-255", lambda x: x * 255),
]:
    processed = preprocess(img.copy())
    preds = model.predict(processed, verbose=0)
    print(f"{name}: max={np.max(preds[0]):.4f} ({class_names[np.argmax(preds[0])]})")

# Test with random noise (should give uniform-ish distribution)
print("\n=== Random noise ===")
np.random.seed(123)
noise = np.random.rand(1, 128, 128, 3).astype(np.float32)
for name, preprocess in [
    ("app.py /255", lambda x: x),
    ("MobileNetV2 preprocess", lambda x: mobilenet_preprocess(x * 255)),
    ("[-1,1] scaling", lambda x: x * 2 - 1),
]:
    processed = preprocess(noise.copy())
    preds = model.predict(processed, verbose=0)
    print(f"{name}: max={np.max(preds[0]):.4f}, entropy={-np.sum(preds[0] * np.log(preds[0] + 1e-10)):.4f}")

# Check if model was trained with proper preprocessing by looking at
# what happens when we bypass the augmentation layers entirely
print("\n=== Bypass augmentation layers (direct to MobileNetV2) ===")
# Get the MobileNetV2 submodel
mobilenet = model.layers[2]
gap = model.layers[3]
dense1 = model.layers[4]
dropout = model.layers[5]
dense2 = model.layers[6]

# Create a submodel from MobileNetV2 input to output
submodel = tf.keras.Model(inputs=mobilenet.input, outputs=model.output)

# Test with MobileNetV2 preprocessing
img_test = np.random.rand(1, 128, 128, 3).astype(np.float32)
img_mn = mobilenet_preprocess(img_test * 255)
preds_full = model.predict(img_test, verbose=0)
preds_sub = submodel.predict(img_mn, verbose=0)
print(f"Full model (0-1 input): max={np.max(preds_full[0]):.4f}")
print(f"Submodel (MobileNetV2 preprocess): max={np.max(preds_sub[0]):.4f}")
print(f"Outputs match: {np.allclose(preds_full, preds_sub)}")