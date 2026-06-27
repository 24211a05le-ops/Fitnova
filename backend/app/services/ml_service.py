import numpy as np
import pandas as pd
import pickle
import os
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, accuracy_score

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml")
os.makedirs(MODEL_DIR, exist_ok=True)

class MLService:
    """Production-ready Machine Learning model workflows for weight prediction, consistency, recovery, and progressive overload."""

    @staticmethod
    def _get_model_path(name):
        return os.path.join(MODEL_DIR, f"{name}.pkl")

    @staticmethod
    def _goal_to_direction(goal):
        goal_text = (goal or "maintain").strip().lower()
        if "loss" in goal_text or "cut" in goal_text:
            return -1.0
        if "gain" in goal_text or "bulk" in goal_text:
            return 1.0
        return 0.0

    @staticmethod
    def _activity_to_score(activity_level):
        if isinstance(activity_level, (int, float)):
            return float(np.clip(activity_level, 1, 5))

        text = (activity_level or "moderate").strip().lower()
        mapper = {
            "sedentary": 1.0,
            "low": 2.0,
            "light": 2.0,
            "moderate": 3.0,
            "active": 4.0,
            "high": 4.0,
            "very active": 5.0,
            "athlete": 5.0
        }
        return mapper.get(text, 3.0)

    @classmethod
    def _load_model(cls, model_name, trainer, expected_features):
        model_path = cls._get_model_path(model_name)

        if not os.path.exists(model_path):
            trainer()

        with open(model_path, "rb") as f:
            model = pickle.load(f)

        if hasattr(model, "n_features_in_") and int(model.n_features_in_) != expected_features:
            trainer()
            with open(model_path, "rb") as f:
                model = pickle.load(f)

        return model

    # ====================================================
    # A. WEIGHT PREDICTION MODEL (LinearRegression)
    # ====================================================

    @classmethod
    def train_weight_model(cls):
        np.random.seed(42)
        size = 3000
        current_weight = np.random.uniform(50, 130, size)
        trend_14 = np.random.uniform(-3.0, 3.0, size)
        trend_30 = np.random.uniform(-6.0, 6.0, size)
        goal_direction = np.random.choice([-1.0, 0.0, 1.0], size=size, p=[0.4, 0.2, 0.4])
        activity_score = np.random.uniform(1.0, 5.0, size)
        horizon_days = np.random.choice([14.0, 30.0, 90.0], size=size)

        baseline_projection = current_weight + (trend_30 * (horizon_days / 30.0))
        goal_impact = goal_direction * (horizon_days / 30.0) * np.random.uniform(0.3, 0.9, size)
        activity_impact = (activity_score - 3.0) * (horizon_days / 30.0) * np.random.uniform(0.05, 0.25, size)
        noise = np.random.normal(0, 0.25, size)

        target_weight = np.clip(baseline_projection + goal_impact + activity_impact + noise, 35, 220)

        df = pd.DataFrame({
            "current_weight": current_weight,
            "trend_14": trend_14,
            "trend_30": trend_30,
            "goal_direction": goal_direction,
            "activity_score": activity_score,
            "horizon_days": horizon_days,
            "target_weight": target_weight
        })

        X = df[["current_weight", "trend_14", "trend_30", "goal_direction", "activity_score", "horizon_days"]]
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
    def predict_weight(cls, current_weight, trend_14=0.0, trend_30=0.0, goal="maintain", activity_level="moderate"):
        model = cls._load_model("weight_model", cls.train_weight_model, expected_features=6)

        goal_direction = cls._goal_to_direction(goal)
        activity_score = cls._activity_to_score(activity_level)

        def _predict_for_horizon(horizon):
            features = pd.DataFrame([{
                "current_weight": current_weight,
                "trend_14": trend_14,
                "trend_30": trend_30,
                "goal_direction": goal_direction,
                "activity_score": activity_score,
                "horizon_days": float(horizon),
            }])
            return float(model.predict(features)[0])

        pred_14 = _predict_for_horizon(14)
        pred_30 = _predict_for_horizon(30)
        pred_90 = _predict_for_horizon(90)

        # Backward compatibility aliases for existing frontend consumers.
        pred_7 = current_weight + ((pred_14 - current_weight) * 0.5)

        return {
            "predicted_weight_2_weeks": round(pred_14, 2),
            "predicted_weight_1_month": round(pred_30, 2),
            "predicted_weight_3_months": round(pred_90, 2),
            "predicted_7_days": round(float(pred_7), 2),
            "predicted_30_days": round(pred_30, 2),
            "predicted_90_days": round(pred_90, 2)
        }

    # ====================================================
    # B. CONSISTENCY PREDICTION (RandomForestClassifier)
    # ====================================================

    @classmethod
    def train_consistency_model(cls):
        np.random.seed(42)
        size = 2500
        workout_frequency = np.random.uniform(0, 7, size)
        missed_sessions = np.random.uniform(0, 8, size)
        login_days = np.random.uniform(0, 30, size)
        streak_days = np.random.uniform(0, 60, size)
        session_duration = np.random.uniform(10, 120, size)

        # 1 = likely to drop workouts, 0 = likely to remain consistent.
        logit = (
            1.2
            - (workout_frequency * 0.25)
            + (missed_sessions * 0.55)
            - (login_days * 0.07)
            - (streak_days * 0.06)
            - (session_duration * 0.01)
        )
        prob = 1 / (1 + np.exp(-logit))
        dropout = (prob > 0.5).astype(int)

        df = pd.DataFrame({
            "workout_frequency": workout_frequency,
            "missed_sessions": missed_sessions,
            "login_days": login_days,
            "streak_days": streak_days,
            "session_duration": session_duration,
            "dropout": dropout
        })

        X = df[["workout_frequency", "missed_sessions", "login_days", "streak_days", "session_duration"]]
        y = df["dropout"]

        model = RandomForestClassifier(n_estimators=180, random_state=42, max_depth=8)
        model.fit(X, y)

        preds = model.predict(X)
        acc = accuracy_score(y, preds)
        print(f"[ML Service] Consistency Dropout Model Trained. Accuracy: {acc:.4f}")

        with open(cls._get_model_path("consistency_model"), "wb") as f:
            pickle.dump(model, f)
        
        return acc

    @classmethod
    def predict_dropout_risk(cls, workout_frequency, missed_sessions, login_days, streak_days, session_duration):
        model = cls._load_model("consistency_model", cls.train_consistency_model, expected_features=5)

        features = pd.DataFrame([{
            "workout_frequency": workout_frequency,
            "missed_sessions": missed_sessions,
            "login_days": login_days,
            "streak_days": streak_days,
            "session_duration": session_duration,
        }])
        prob_dropout = float(model.predict_proba(features)[0][1])
        consistency_prob = max(0.0, min(1.0, 1.0 - prob_dropout))

        if consistency_prob >= 0.85:
            label = "Likely Consistent"
        elif consistency_prob >= 0.6:
            label = "At Mild Risk"
        else:
            label = "At High Risk"

        return {
            "consistency_probability": round(consistency_prob * 100, 1),
            "dropout_probability": round(prob_dropout * 100, 1),
            "label": label,
            "dropout_risk_score": round(prob_dropout * 100, 1)
        }

    # ====================================================
    # C. RECOVERY SCORE MODEL (RandomForestRegressor)
    # ====================================================

    @classmethod
    def train_recovery_model(cls):
        np.random.seed(42)
        size = 2500
        sleep_hours = np.random.uniform(3.5, 10, size)
        workout_duration = np.random.uniform(10, 150, size)
        workout_intensity = np.random.uniform(1, 10, size)
        muscle_soreness = np.random.uniform(0, 10, size)
        calories_burned = np.random.uniform(80, 1400, size)

        recovery_score = (
            65
            + (sleep_hours * 4.2)
            - (workout_duration * 0.14)
            - (workout_intensity * 2.1)
            - (muscle_soreness * 2.7)
            - (calories_burned * 0.015)
            + np.random.normal(0, 2.2, size)
        )
        recovery_score = np.clip(recovery_score, 0, 100)

        df = pd.DataFrame({
            "sleep_hours": sleep_hours,
            "workout_duration": workout_duration,
            "workout_intensity": workout_intensity,
            "muscle_soreness": muscle_soreness,
            "calories_burned": calories_burned,
            "recovery_score": recovery_score
        })

        X = df[["sleep_hours", "workout_duration", "workout_intensity", "muscle_soreness", "calories_burned"]]
        y = df["recovery_score"]

        model = RandomForestRegressor(n_estimators=160, random_state=42, max_depth=10)
        model.fit(X, y)

        preds = model.predict(X)
        mse = mean_squared_error(y, preds)
        print(f"[ML Service] Recovery Model Trained. MSE: {mse:.4f}")

        with open(cls._get_model_path("recovery_model"), "wb") as f:
            pickle.dump(model, f)
        
        return mse

    @classmethod
    def predict_recovery_score(cls, sleep_hours, workout_duration, workout_intensity, muscle_soreness, calories_burned):
        model = cls._load_model("recovery_model", cls.train_recovery_model, expected_features=5)

        features = pd.DataFrame([{
            "sleep_hours": sleep_hours,
            "workout_duration": workout_duration,
            "workout_intensity": workout_intensity,
            "muscle_soreness": muscle_soreness,
            "calories_burned": calories_burned,
        }])
        score = float(np.clip(model.predict(features)[0], 0, 100))

        if score >= 75:
            status = "High"
            label = "Fully Recovered"
        elif score >= 45:
            status = "Moderate"
            label = "Moderately Recovered"
        else:
            status = "Low"
            label = "Rest Recommended"

        return {
            "recovery_score": int(round(score)),
            "recovery_status": status,
            "label": label
        }

    # ====================================================
    # D. PROGRESSIVE OVERLOAD MODEL (RandomForestRegressor)
    # ====================================================

    @classmethod
    def train_overload_model(cls):
        np.random.seed(42)
        size = 3000
        prev_weight = np.random.uniform(5, 220, size)
        reps_completed = np.random.uniform(3, 15, size)
        sets_completed = np.random.uniform(1, 8, size)
        exercise_trend = np.random.uniform(-2.0, 2.0, size)

        next_weight = (
            prev_weight
            + (reps_completed - 8.0) * 0.35
            + (sets_completed - 3.0) * 0.25
            + exercise_trend * 0.8
            + np.random.normal(0, 0.4, size)
        )
        next_weight = np.maximum(next_weight, prev_weight * 0.92)

        df = pd.DataFrame({
            "prev_weight": prev_weight,
            "reps_completed": reps_completed,
            "sets_completed": sets_completed,
            "exercise_trend": exercise_trend,
            "next_weight": next_weight
        })

        X = df[["prev_weight", "reps_completed", "sets_completed", "exercise_trend"]]
        y = df["next_weight"]

        model = RandomForestRegressor(n_estimators=180, random_state=42, max_depth=12)
        model.fit(X, y)

        preds = model.predict(X)
        mse = mean_squared_error(y, preds)
        print(f"[ML Service] Progressive Overload Model Trained. MSE: {mse:.4f}")

        with open(cls._get_model_path("overload_model"), "wb") as f:
            pickle.dump(model, f)
        
        return mse

    @classmethod
    def predict_progressive_overload(cls, prev_weight, reps_completed, sets_completed, exercise_trend=0.0):
        model = cls._load_model("overload_model", cls.train_overload_model, expected_features=4)

        features = pd.DataFrame([{
            "prev_weight": prev_weight,
            "reps_completed": reps_completed,
            "sets_completed": sets_completed,
            "exercise_trend": exercise_trend,
        }])
        raw_recommended_weight = float(model.predict(features)[0])

        # Round to nearest common gym increment of 2.5kg.
        rounded_recommended_weight = round(raw_recommended_weight / 2.5) * 2.5
        rounded_recommended_weight = max(rounded_recommended_weight, prev_weight * 0.9)

        suggested_action = "Keep same weight"
        recommended_reps = int(reps_completed)
        recommended_sets = int(max(1, round(sets_completed)))

        if reps_completed >= 10 and exercise_trend >= 0:
            suggested_action = "Increase weight"
            recommended_reps = int(reps_completed)
        elif reps_completed < 8:
            suggested_action = "Increase reps"
            rounded_recommended_weight = float(prev_weight)
            recommended_reps = int(reps_completed + 1)

        return {
            "suggested_action": suggested_action,
            "recommended_weight": round(float(rounded_recommended_weight), 2),
            "recommended_reps": int(recommended_reps),
            "recommended_sets": int(recommended_sets),
            "rep_target": int(recommended_reps)
        }
