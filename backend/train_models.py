import os
import sys

# Ensure backend root is in PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.services.ml_service import MLService

def run_retraining():
    app = create_app()
    with app.app_context():
        print("====================================================")
        print(" FITNOVA MACHINE LEARNING TRAINING PIPELINE ")
        print("====================================================")
        
        print("\n[1/4] Training Weight Prediction model (LinearRegression)...")
        weight_mse = MLService.train_weight_model()
        print(f"Weight model trained. MSE: {weight_mse:.5f}")

        print("\n[2/4] Training Consistency Dropout model (LogisticRegression)...")
        consistency_acc = MLService.train_consistency_model()
        print(f"Consistency model trained. Accuracy: {consistency_acc:.5f}")

        print("\n[3/4] Training Recovery Score model (RandomForestRegressor)...")
        recovery_mse = MLService.train_recovery_model()
        print(f"Recovery model trained. MSE: {recovery_mse:.5f}")

        print("\n[4/4] Training Progressive Overload model (RandomForestRegressor)...")
        overload_mse = MLService.train_overload_model()
        print(f"Progressive Overload model trained. MSE: {overload_mse:.5f}")

        print("\n====================================================")
        print(" ALL MODELS TRAINED & DEPLOYED SUCCESSFULLY TO ML DIR ")
        print("====================================================")

if __name__ == "__main__":
    run_retraining()
