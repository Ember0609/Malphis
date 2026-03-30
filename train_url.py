import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from backend.utils.feature_extract import extract_url_features, URL_FEATURE_COLUMNS

if not os.path.exists('models'): 
    os.makedirs('models')

df_raw = pd.read_csv('dataset/Url.csv')

extracted_features = []

for index, row in df_raw.iterrows():
    url_str = str(row['url'])
    features = extract_url_features(url_str)
    extracted_features.append(features)

X = pd.DataFrame(extracted_features)
X = X.reindex(columns=URL_FEATURE_COLUMNS)

y = df_raw['label']

imputer = SimpleImputer(strategy='median')
X_imputed = imputer.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_imputed, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = Sequential()
model.add(Dense(128, input_dim=X_train_scaled.shape[1], activation='relu'))
model.add(Dropout(0.3))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.3))
model.add(Dense(1, activation='sigmoid')) 

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])

history = model.fit(
    X_train_scaled, 
    y_train, 
    epochs=10, 
    batch_size=32, 
    validation_split=0.2, 
    verbose=1 
)

loss, accuracy = model.evaluate(X_test_scaled, y_test)
print(f"Accuracy: {accuracy * 100:.2f}%")

model.save('models/url_nn_model.keras') 
joblib.dump(scaler, 'models/url_scaler.pkl')
joblib.dump(imputer, 'models/url_imputer.pkl')

print("✅ จบกระบวนการ! โมเดลพร้อมใช้งานที่หน้าเว็บแล้วครับ!")