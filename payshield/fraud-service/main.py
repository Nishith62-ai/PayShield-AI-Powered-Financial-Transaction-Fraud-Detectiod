from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(
    title="PayShield Fraud Detection Service",
    description="ML inference service for fraud detection",
    version="1.0.0",
)

# ==============================
# LOAD TRAINED MODEL
# ==============================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "model",
    "fraud_model.pkl"
)

loaded_data = joblib.load(MODEL_PATH)

# Extract XGBoost model and feature list
model = loaded_data["model"]
features = loaded_data["features"]


# ==============================
# INPUT DATA STRUCTURE
# ==============================

class TransactionInput(BaseModel):
    step: int
    type: str
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float


# ==============================
# HOME ENDPOINT
# ==============================

@app.get("/")
def home():
    return {
        "message": "PayShield Fraud Detection Service is running"
    }


# ==============================
# HEALTH CHECK
# ==============================

@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "payshield-fraud-service",
        "model": "XGBoost"
    }


# ==============================
# FRAUD PREDICTION
# ==============================

@app.post("/predict")
def predict(transaction: TransactionInput):

    transaction_type = transaction.type.upper()

    data = {
        "step": transaction.step,
        "amount": transaction.amount,
        "oldbalanceOrg": transaction.oldbalanceOrg,
        "newbalanceOrig": transaction.newbalanceOrig,
        "oldbalanceDest": transaction.oldbalanceDest,
        "newbalanceDest": transaction.newbalanceDest,

        "type_CASH_OUT": 1 if transaction_type == "CASH_OUT" else 0,
        "type_DEBIT": 1 if transaction_type == "DEBIT" else 0,
        "type_PAYMENT": 1 if transaction_type == "PAYMENT" else 0,
        "type_TRANSFER": 1 if transaction_type == "TRANSFER" else 0,
    }

    # Create DataFrame
    input_df = pd.DataFrame([data])

    # Ensure feature order matches training
    input_df = input_df[features]

    # Prediction
    prediction = model.predict(input_df)[0]

    # Probability
    probability = model.predict_proba(input_df)[0][1]

    return {
        "isFraud": bool(prediction),
        "fraudProbability": round(float(probability), 4)
    }