import tensorflow as tf
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess

model = tf.keras.models.load_model('plant_disease_model.keras')
with open('class_names.json') as f:
    import json
    class_names = json.load(f)

# Test the EXACT app.py preprocessing pipeline
def app_preprocess(img_bytes):
    from PIL import Image
    import io
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize((128, 128))
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0)

# Create test images and save as bytes to simulate upload
from PIL import Image
import io

# Green leaf
green = Image.new('RGB', (128, 128), color=(50, 180, 50))
buf = io.BytesIO()
green.save(buf, format='PNG')
green_bytes = buf.getvalue()

# Brown spotted leaf
brown = Image.new('RGB', (128, 128), color=(139, 69, 19))
# Add some spots
import random
for _ in range(100):
    x, y = random.randint(0, 127), random.randint(0, 127)
    brown.putpixel((x, y), (100, 30, 30))
buf = io.BytesIO()
brown.save(buf, format='PNG')
brown_bytes = buf.getvalue()

# Yellow leaf
yellow = Image.new('RGB', (128, 128), color=(255, 255, 0))
buf = io.BytesIO()
yellow.save(buf, format='PNG')
yellow_bytes = buf.getvalue()

test_images = [
    ("Green leaf", green_bytes),
    ("Brown spotted", brown_bytes),
    ("Yellow leaf", yellow_bytes),
]

print("=== Testing EXACT app.py preprocessing pipeline ===")
for name, img_bytes in test_images:
    input_arr = app_preprocess(img_bytes)
    preds = model.predict(input_arr, verbose=0)
    max_idx = np.argmax(preds[0])
    max_prob = preds[0][max_idx]
    print(f"{name}: max={max_prob:.4f} ({max_prob*100:.2f}%) - {class_names[max_idx]}")
    print(f"  Top 3: {[(class_names[i], f'{preds[0][i]*100:.2f}%') for i in np.argsort(preds[0])[-3:][::-1]]}")

# Now test with CORRECT MobileNetV2 preprocessing
def mobilenet_preprocess_pipeline(img_bytes):
    from PIL import Image
    import io
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize((128, 128))
    arr = np.array(img).astype(np.float32)
    arr = mobilenet_preprocess(arr)
    return np.expand_dims(arr, axis=0)

print("\n=== Testing MobileNetV2 preprocess_input pipeline ===")
for name, img_bytes in test_images:
    input_arr = mobilenet_preprocess_pipeline(img_bytes)
    preds = model.predict(input_arr, verbose=0)
    max_idx = np.argmax(preds[0])
    max_prob = preds[0][max_idx]
    print(f"{name}: max={max_prob:.4f} ({max_prob*100:.2f}%) - {class_names[max_idx]}")
    print(f"  Top 3: {[(class_names[i], f'{preds[0][i]*100:.2f}%') for i in np.argsort(preds[0])[-3:][::-1]]}")

# Check if the model's augmentation layers are causing issues
# by examining what they expect vs what we give
print("\n=== Augmentation Layer Analysis ===")
print("RandomContrast value_range: [0, 255] - expects uint8 range")
print("RandomBrightness value_range: [0.0, 1.0] - expects normalized range")
print("These are INCONSISTENT - training was likely corrupted")
print("During inference, these layers are inactive (no-op)")
print("But the MobileNetV2 expects ImageNet preprocessing: preprocess_input (scales 0-255 to [-1, 1])")
print("Current app.py uses /255.0 (scales to [0, 1]) - WRONG for MobileNetV2")

# Test what the model predicts for each class with a "perfect" input
# by checking the final dense layer weights
print("\n=== Dense Layer Analysis ===")
dense1_w = model.layers[4].get_weights()[0]  # (1280, 128)
dense2_w = model.layers[6].get_weights()[0]  # (128, 59)
print(f"Dense1 (1280->128): weight range [{dense1_w.min():.4f}, {dense1_w.max():.4f}]")
print(f"Dense2 (128->59): weight range [{dense2_w.min():.4f}, {dense2_w.max():.4f}]")

# Check if any class has strongly positive weights
class_scores = dense2_w.mean(axis=0)  # Average weight per class
print(f"Class weight means range: [{class_scores.min():.4f}, {class_scores.max():.4f}]")
top_classes = np.argsort(class_scores)[-5:][::-1]
print(f"Top 5 classes by avg weight: {[(class_names[i], class_scores[i]) for i in top_classes]}")