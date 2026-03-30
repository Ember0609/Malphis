import tensorflow as tf

model = tf.keras.models.load_model('models/url_nn_model.keras')
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

with open('models/url_nn_model.tflite', 'wb') as f:
    f.write(tflite_model)