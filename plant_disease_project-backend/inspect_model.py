import tensorflow as tf
import json

model = tf.keras.models.load_model('plant_disease_model.keras')
config = model.get_config()

for layer_config in config['layers']:
    print(f"Layer: {layer_config['class_name']} - {layer_config['config'].get('name', 'unnamed')}")
    if 'layers' in layer_config['config']:
        for sub_layer in layer_config['config']['layers']:
            print(f"  Sublayer: {sub_layer['class_name']} - {sub_layer['config'].get('name', 'unnamed')}")
            if 'config' in sub_layer:
                for k, v in sub_layer['config'].items():
                    if k in ['value_range', 'factor', 'mode', 'height_factor', 'width_factor']:
                        print(f"    {k}: {v}")