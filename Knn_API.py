from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)

# โหลดโมเดลและ label_encoders
model = joblib.load('knn_model_k3.pkl')
label_encoders = joblib.load('label_encoders.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    # ตรวจสอบว่า request.json มี key 'specTest' หรือไม่
    if not request.json or 'specTest' not in request.json:
        return jsonify({'error': 'Missing specTest in request body'}), 400

    # รับข้อมูลจาก request
    data = request.json['specTest']

    # แปลง JSON เป็น DataFrame
    try:
        df = pd.DataFrame([data])
    except Exception as e:
        return jsonify({'error': f'Data format error: {str(e)}'}), 400

    # ตรวจสอบและแปลงข้อมูลด้วย label_encoders
    for column in df.columns:
        if column in label_encoders:
            encoder = label_encoders[column]
            df[column] = encoder.transform(df[column])

    # ทำการคาดการณ์
    prediction = model.predict(df)
    print(prediction)

    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
