import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Load dataset
data = pd.read_csv("dataset/isl_dataset.csv")

# Separate features and labels
X = data.drop("label", axis=1)
y = data["label"]

# Check number of classes
print("Sign samples:")
print(y.value_counts())

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Train model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate model
predictions = model.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, predictions))
print("\nClassification Report:")
print(classification_report(y_test, predictions))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions, labels=model.classes_))

# Save trained model
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/isl_model.pkl")

print("\nModel saved successfully!")
print("Classes learned by model :")
print(model.classes_)