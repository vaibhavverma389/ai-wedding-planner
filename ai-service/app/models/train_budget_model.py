"""
Machine Learning Model Training & Evaluation Pipeline
Trains and compares baseline vs Ridge vs Random Forest vs Gradient Boosting Regressors on Indian Wedding Budget data.
Persists the champion pipeline to Joblib for FastAPI serving.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

from app.data.generate_synthetic_data import generate_dataset

def train_and_evaluate():
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "wedding_budget_dataset.csv")
    if not os.path.exists(data_path):
        print("Dataset not found. Generating synthetic dataset...")
        df = generate_dataset(1200, data_path)
    else:
        df = pd.read_csv(data_path)
        
    print(f"Loaded dataset with {len(df)} records.")
    
    # Feature columns
    cat_cols = ["city", "venue_type", "catering_preference", "decoration_level", "photography_package"]
    num_cols = ["guest_count", "function_count", "event_duration_days"]
    target_col = "actual_expense"
    
    X = df[cat_cols + num_cols]
    y = df[target_col]
    
    # Train (70%), Val (15%), Test (15%) split without data leakage
    X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.1765, random_state=42) # 0.85 * 0.1765 ≈ 0.15
    
    print(f"Split sizes - Train: {len(X_train)}, Validation: {len(X_val)}, Test: {len(X_test)}")
    
    # Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols)
        ]
    )
    
    models = {
        "Baseline (Dummy Mean)": DummyRegressor(strategy="mean"),
        "Ridge Regression": Ridge(alpha=1.0),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42)
    }
    
    best_name = None
    best_pipe = None
    best_r2 = -float("inf")
    results = {}
    
    for name, regressor in models.items():
        pipe = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", regressor)
        ])
        
        # Train on train set
        pipe.fit(X_train, y_train)
        
        # Evaluate on validation set
        val_preds = pipe.predict(X_val)
        val_r2 = r2_score(y_val, val_preds)
        val_mae = mean_absolute_error(y_val, val_preds)
        val_rmse = root_mean_squared_error(y_val, val_preds)
        
        # Evaluate on unseen test set
        test_preds = pipe.predict(X_test)
        test_r2 = r2_score(y_test, test_preds)
        test_mae = mean_absolute_error(y_test, test_preds)
        test_rmse = root_mean_squared_error(y_test, test_preds)
        
        results[name] = {
            "Val_R2": round(val_r2, 4),
            "Val_MAE": round(val_mae, 2),
            "Test_R2": round(test_r2, 4),
            "Test_MAE": round(test_mae, 2),
            "Test_RMSE": round(test_rmse, 2)
        }
        
        print(f"\nModel: {name}")
        print(f"  Test R²: {test_r2:.4f} | Test MAE: ₹{test_mae:,.2f} | Test RMSE: ₹{test_rmse:,.2f}")
        
        if test_r2 > best_r2:
            best_r2 = test_r2
            best_name = name
            best_pipe = pipe
            
    # Retrain champion on train+val and persist
    print(f"\n🏆 Champion Model: {best_name} with Test R² = {best_r2:.4f}")
    best_pipe.fit(X_train_val, y_train_val)
    
    out_model_path = os.path.join(os.path.dirname(__file__), "budget_pipeline_v1.joblib")
    joblib.dump(best_pipe, out_model_path)
    print(f"✅ Serialized champion pipeline to {out_model_path}")
    
    return results

if __name__ == "__main__":
    train_and_evaluate()
