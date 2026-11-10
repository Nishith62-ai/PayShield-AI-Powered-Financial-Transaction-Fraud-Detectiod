import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from xgboost import XGBClassifier


print("Loading dataset...")

df = pd.read_csv("../../datasets/paysim_small.csv")


# ==========================================
# FEATURE ENGINEERING
# ==========================================

print("Preparing features...")

# Convert transaction type into numerical values
df = pd.get_dummies(df, columns=["type"], drop_first=True)


feature_columns = [
    "step",
    "amount",
    "oldbalanceOrg",
    "newbalanceOrig",
    "oldbalanceDest",
    "newbalanceDest",
    "type_CASH_OUT",
    "type_DEBIT",
    "type_PAYMENT",
    "type_TRANSFER"
]

# Keep only columns available in dataset
feature_columns = [col for col in feature_columns if col in df.columns]

X = df[feature_columns]
y = df["isFraud"]


print("Features:", feature_columns)
print("Dataset shape:", X.shape)


# ==========================================
# TRAIN / TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# TRAIN XGBOOST MODEL
# ==========================================

print("Training XGBoost model...")

model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=100,
    eval_metric="logloss",
    random_state=42
)

model.fit(X_train, y_train)


# ==========================================
# MODEL EVALUATION
# ==========================================

print("\n===== MODEL EVALUATION =====")

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nROC-AUC Score:")
print(roc_auc_score(y_test, y_prob))


# ==========================================
# SAVE MODEL
# ==========================================

model_data = {
    "model": model,
    "features": feature_columns
}

joblib.dump(model_data, "../model/fraud_model.pkl")

print("\nModel saved successfully!")
print("Location: fraud-service/model/fraud_model.pkl")