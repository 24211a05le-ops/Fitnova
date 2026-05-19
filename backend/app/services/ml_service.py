import numpy as np
import pandas as pd
import pickle
import os
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, accuracy_score

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml")
os.makedirs(MODEL_DIR, exist_ok=True)

class MLService:
    """Production-ready Machine Learning model workflows for weight prediction, consistency, recovery, and progressive overload."""

    @staticmethod
    def _get_model_path(name):
        return os.path.join(MODEL_DIR, f"{name}.pkl")

    # ====================================================
    # A. WEIGHT PREDICTION MODEL (LinearRegression)
    # ====================================================

    @classmethod
    def train_weight_model(cls):
        # Generate robust synthetic training dataset for progressive pipeline
        np.random.seed(42)
        size = 1000
        current_weight = np.random.uniform(60, 100, size)
        calorie_intake = np.random.uniform(1500, 3500, size)
        workout_frequency = np.random.uniform(1, 6, size)
        steps = np.random.uniform(2000, 15000, size)
        sleep = np.random.uniform(5, 9, size)
        consistency = np.random.uniform(0.1, 1.0, size)

        # Target weight after 30 days: influenced by calorie balance and active consistency
        maintenance = current_weight * 30.0
        caloric_balance = calorie_intake - maintenance
        weight_delta = (caloric_balance * 30 / 7700.0) - (workout_frequency * 0.1) - (steps * 0.00005)
        weight_delta = np.clip(weight_delta, -4.0, 4.0) * consistency
        target_weight = current_weight + weight_delta

        df = pd.DataFrame({
            "current_weight": current_weight,
            "calorie_intake": calorie_intake,
            "workout_frequency": workout_frequency,
            "steps": steps,
            "sleep": sleep,
            "consistency": consistency,
            "target_weight": target_weight
        })

        X = df[["current_weight", "calorie_intake", "workout_frequency", "steps", "sleep", "consistency"]]
        y = df["target_weight"]

        model = LinearRegression()
        model.fit(X, y)

        # Evaluate model
        preds = model.predict(X)
        mse = mean_squared_error(y, preds)
        print(f"[ML Service] Weight Model Trained. MSE: {mse:.4f}")

        # Save model
        with open(cls._get_model_path("weight_model"), "wb") as f:
            pickle.dump(model, f)
        
        return mse

    @classmethod
    def predict_weight(cls, current_weight, calorie_intake, workout_frequency, steps, sleep, consistency, days=30):
        model_path = cls._get_model_path("weight_model")
        if not os.path.exists(model_path):
            cls.train_weight_model()

        with open(model_path, "rb") as f:
            model = pickle.load(f)

        features = [[current_weight, calorie_intake, workout_frequency, steps, sleep, consistency]]
        pred_30_days = model.predict(features)[0]

        # Interpolate for 7 days and 90 days based on progress balance
        diff = pred_30_days - current_weight
        pred_7_days = current_weight + (diff * (7 / 30.0))
        pred_90_days = current_weight + (diff * (90 / 30.0))

        return {
            "predicted_7_days": round(float(pred_7_days), 2),
            "predicted_30_days": round(float(pred_30_days), 2),
            "predicted_90_days": round(float(pred_90_days), 2)
        }

    # ====================================================
    # B. CONSISTENCY DROPOUT PREDICTION (LogisticRegression)
    # ====================================================

    @classmethod
    def train_consistency_model(cls):
        np.random.seed(42)
        size = 1000
        streak_days = np.random.uniform(0, 30, size)
        skipped_workouts = np.random.uniform(0, 10, size)
        app_activity = np.random.uniform(1, 20, size)
        workout_frequency = np.random.uniform(1, 6, size)
        session_duration = np.random.uniform(15, 90, size)

        # Logit equation for dropout probability (1 = stops, 0 = continues)
        logit = 2.0 - (streak_days * 0.1) + (skipped_workouts * 0.4) - (app_activity * 0.15) - (workout_frequency * 0.2)
        prob = 1 / (1 + np.exp(-logit))
        dropout = (prob > 0.5).astype(int)

        df = pd.DataFrame({
            "streak_days": streak_days,
            "skipped_workouts": skipped_workouts,
            "app_activity": app_activity,
            "workout_frequency": workout_frequency,
            "session_duration": session_duration,
            "dropout": dropout
        })

        X = df[["streak_days", "skipped_workouts", "app_activity", "workout_frequency", "session_duration"]]
        y = df["dropout"]

        model = LogisticRegression()
        model.fit(X, y)

        preds = model.predict(X)
        acc = accuracy_score(y, preds)
        print(f"[ML Service] Consistency Dropout Model Trained. Accuracy: {acc:.4f}")

        with open(cls._get_model_path("consistency_model"), "wb") as f:
            pickle.dump(model, f)
        
        return acc

    @classmethod
    def predict_dropout_risk(cls, streak_days, skipped_workouts, app_activity, workout_frequency, session_duration):
        model_path = cls._get_model_path("consistency_model")
        if not os.path.exists(model_path):
            cls.train_consistency_model()

        with open(model_path, "rb") as f:
            model = pickle.load(f)

        features = [[streak_days, skipped_workouts, app_activity, workout_frequency, session_duration]]
        prob_dropout = model.predict_proba(features)[0][1] # Probability of class 1

        return {
            "dropout_risk_score": round(float(prob_dropout * 100), 1),
            "label": "High Risk" if prob_dropout > 0.7 else "Moderate Risk" if prob_dropout > 0.4 else "Low Risk"
        }

    # ====================================================
    # C. RECOVERY SCORE MODEL (RandomForestRegressor)
    # ====================================================

    @classmethod
    def train_recovery_model(cls):
        np.random.seed(42)
        size = 1000
        soreness = np.random.uniform(1, 10, size)
        sleep = np.random.uniform(4, 10, size)
        calories = np.random.uniform(1200, 4000, size)
        workout_intensity = np.random.uniform(1, 10, size)
        stress_level = np.random.uniform(1, 10, size)

        # Recovery calculation logic (ideal score 100)
        recovery_score = 50 - (soreness * 2.5) + (sleep * 4.0) + (calories * 0.003) - (workout_intensity * 1.5) - (stress_level * 2.0)
        recovery_score = np.clip(recovery_score, 10, 100)

        df = pd.DataFrame({
            "soreness": soreness,
            "sleep": sleep,
            "calories": calories,
            "workout_intensity": workout_intensity,
            "stress_level": stress_level,
            "recovery_score": recovery_score
        })

        X = df[["soreness", "sleep", "calories", "workout_intensity", "stress_level"]]
        y = df["recovery_score"]

        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model.fit(X, y)

        preds = model.predict(X)
        mse = mean_squared_error(y, preds)
        print(f"[ML Service] Recovery Model Trained. MSE: {mse:.4f}")

        with open(cls._get_model_path("recovery_model"), "wb") as f:
            pickle.dump(model, f)
        
        return mse

    @classmethod
    def predict_recovery_score(cls, soreness, sleep, calories, workout_intensity, stress_level):
        model_path = cls._get_model_path("recovery_model")
        if not os.path.exists(model_path):
            cls.train_recovery_model()

        with open(model_path, "rb") as f:
            model = pickle.load(f)

        features = [[soreness, sleep, calories, workout_intensity, stress_level]]
        score = model.predict(features)[0]

        return {
            "recovery_score": int(round(score)),
            "label": "Fully Recovered" if score > 80 else "Moderately Recovered" if score > 50 else "Rest Recommended"
        }

    # ====================================================
    # D. PROGRESSIVE OVERLOAD MODEL (RandomForestRegressor)
    # ====================================================

    @classmethod
    def train_overload_model(cls):
        np.random.seed(42)
        size = 1000
        prev_weight = np.random.uniform(10, 150, size)
        reps_completed = np.random.uniform(5, 15, size)
        fatigue = np.random.uniform(1, 10, size)
        consistency = np.random.uniform(0.1, 1.0, size)

        # Target next weight suggestion
        next_weight = prev_weight + (reps_completed * 0.5) - (fatigue * 0.4) + (consistency * 3.0)
        # Handle small offsets for light weights
        next_weight = np.maximum(next_weight, prev_weight)

        df = pd.DataFrame({
            "prev_weight": prev_weight,
            "reps_completed": reps_completed,
            "fatigue": fatigue,
            "consistency": consistency,
            "next_weight": next_weight
        })

        X = df[["prev_weight", "reps_completed", "fatigue", "consistency"]]
        y = df["next_weight"]

        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model.fit(X, y)

        preds = model.predict(X)
        mse = mean_squared_error(y, preds)
        print(f"[ML Service] Progressive Overload Model Trained. MSE: {mse:.4f}")

        with open(cls._get_model_path("overload_model"), "wb") as f:
            pickle.dump(model, f)
        
        return mse

    @classmethod
    def predict_progressive_overload(cls, prev_weight, reps_completed, fatigue, consistency):
        model_path = cls._get_model_path("overload_model")
        if not os.path.exists(model_path):
            cls.train_overload_model()

        with open(model_path, "rb") as f:
            model = pickle.load(f)

        features = [[prev_weight, reps_completed, fatigue, consistency]]
        recommended_weight = model.predict(features)[0]

        # Calculate logical rep targets
        rep_target = 10
        if reps_completed > 12:
            rep_target = 8
        elif reps_completed < 8:
            rep_target = 12

        return {
            "recommended_weight": round(float(recommended_weight), 2),
            "rep_target": int(rep_target)
        }
