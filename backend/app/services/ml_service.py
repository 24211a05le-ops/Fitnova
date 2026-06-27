import numpy as np
import pandas as pd
import pickle
import os
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, accuracy_score, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.base import clone
from sqlalchemy.exc import SQLAlchemyError

from app import db
from app.models.fitness_profile import FitnessProfile
from app.models.ml_model_metric import MLModelMetric
from app.models.progress_log import ProgressLog
from app.models.weight_log import WeightLog
from app.models.workout import Workout

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

    @staticmethod
    def _get_user_ids():
        try:
            user_ids = set()
            for table in (WeightLog, Workout, ProgressLog, FitnessProfile):
                rows = db.session.query(table.user_id).distinct().all()
                user_ids.update(row[0] for row in rows if row and row[0] is not None)
            return sorted(user_ids)
        except SQLAlchemyError as exc:
            print(f"[ML Service] Real-data lookup unavailable, falling back to synthetic data: {exc}")
            db.session.rollback()
            return []

    @staticmethod
    def _sessionize_workouts(workouts):
        sessions = []
        grouped = {}
        sorted_workouts = sorted(workouts, key=lambda item: item.created_at or datetime.min)
        for workout in sorted_workouts:
            created_at = workout.created_at or datetime.utcnow()
            bucket = created_at.replace(second=0, microsecond=0)
            key = (workout.user_id, workout.workout_name.strip().lower(), bucket.isoformat())
            if key not in grouped:
                grouped[key] = {
                    "user_id": workout.user_id,
                    "date": bucket.date(),
                    "created_at": bucket,
                    "name": workout.workout_name,
                    "duration": 0,
                    "calories": 0,
                    "sets": 0,
                    "exercises": [],
                }
                sessions.append(grouped[key])
            session = grouped[key]
            session["duration"] += int(workout.duration or 0)
            session["calories"] += int(workout.calories_burned or 0)
            session["sets"] += int(workout.sets or 0)
            session["exercises"].append(workout)
        return sessions

    @staticmethod
    def _activity_score_from_profile(profile):
        if not profile:
            return 3.0
        days = profile.available_days or 3
        if days <= 1:
            return 1.0
        if days <= 3:
            return 2.0
        if days <= 5:
            return 3.0
        return 4.0

    @classmethod
    def _build_weight_training_rows(cls):
        rows = []
        user_ids = cls._get_user_ids()
        for user_id in user_ids:
            logs = WeightLog.query.filter_by(user_id=user_id).order_by(WeightLog.date.asc()).all()
            profile = FitnessProfile.query.filter_by(user_id=user_id).first()
            if len(logs) < 2:
                continue

            weight_points = sorted(logs, key=lambda log: log.date)
            for idx, current in enumerate(weight_points):
                reference_14 = current.weight
                reference_30 = current.weight
                for prev in reversed(weight_points[:idx]):
                    days_delta = (current.date - prev.date).days
                    if days_delta >= 14:
                        reference_14 = prev.weight
                        break
                for prev in reversed(weight_points[:idx]):
                    days_delta = (current.date - prev.date).days
                    if days_delta >= 30:
                        reference_30 = prev.weight
                        break

                future_candidates = [log for log in weight_points[idx + 1:] if (log.date - current.date).days >= 14]
                if not future_candidates:
                    continue
                future = future_candidates[0]
                days_future = (future.date - current.date).days
                goal_direction = cls._goal_to_direction(profile.fitness_goal if profile else None)
                activity_score = cls._activity_score_from_profile(profile)
                rows.append({
                    "current_weight": float(current.weight),
                    "trend_14": float(current.weight - reference_14),
                    "trend_30": float(current.weight - reference_30),
                    "goal_direction": goal_direction,
                    "activity_score": activity_score,
                    "horizon_days": float(days_future),
                    "target_weight": float(future.weight),
                })

        return pd.DataFrame(rows)

    @classmethod
    def _build_consistency_training_rows(cls):
        rows = []
        user_ids = cls._get_user_ids()
        for user_id in user_ids:
            profile = FitnessProfile.query.filter_by(user_id=user_id).first()
            workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.asc()).all()
            sessions = cls._sessionize_workouts(workouts)
            if not sessions:
                continue
            total_days = max(1, ((sessions[-1]["date"] - sessions[0]["date"]).days) + 1)
            for idx, session in enumerate(sessions):
                next_window_end = session["date"] + timedelta(days=14)
                future_sessions = [s for s in sessions[idx + 1:] if s["date"] <= next_window_end]
                workout_frequency = min(7, len([s for s in sessions if session["date"] <= s["date"] <= next_window_end]))
                missed_sessions = max(0, (profile.available_days if profile else 3) * 2 - workout_frequency)
                login_days = min(30, total_days)
                streak_days = 1
                for prev in reversed(sessions[:idx]):
                    if (session["date"] - prev["date"]).days == 1:
                        streak_days += 1
                    else:
                        break
                session_duration = float(session["duration"] or 0)
                dropout = 1 if len(future_sessions) < max(1, (profile.available_days if profile else 3) // 2) else 0
                rows.append({
                    "workout_frequency": float(workout_frequency),
                    "missed_sessions": float(missed_sessions),
                    "login_days": float(login_days),
                    "streak_days": float(streak_days),
                    "session_duration": session_duration,
                    "dropout": dropout,
                })
        return pd.DataFrame(rows)

    @classmethod
    def _build_recovery_training_rows(cls):
        rows = []
        user_ids = cls._get_user_ids()
        for user_id in user_ids:
            workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.asc()).all()
            sessions = cls._sessionize_workouts(workouts)
            if len(sessions) < 2:
                continue
            for idx, session in enumerate(sessions[:-1]):
                next_session = sessions[idx + 1]
                recovery_days = max(1, (next_session["date"] - session["date"]).days)
                workout_duration = float(session["duration"] or 0)
                workout_intensity = min(10.0, max(1.0, (session["calories"] or 150) / max(workout_duration, 1) / 1.4))
                muscle_soreness = min(10.0, 2.0 + recovery_days * 1.2 + workout_intensity * 0.3)
                sleep_hours = min(10.0, max(4.0, 8.0 - workout_intensity * 0.15 + recovery_days * 0.1))
                recovery_score = float(np.clip(100 - (workout_intensity * 6.0) - (workout_duration * 0.08) + (recovery_days * 3.0), 0, 100))
                rows.append({
                    "sleep_hours": sleep_hours,
                    "workout_duration": workout_duration,
                    "workout_intensity": workout_intensity,
                    "muscle_soreness": muscle_soreness,
                    "calories_burned": float(session["calories"] or 0),
                    "recovery_score": recovery_score,
                })
        return pd.DataFrame(rows)

    @classmethod
    def _build_overload_training_rows(cls):
        rows = []
        user_ids = cls._get_user_ids()
        for user_id in user_ids:
            workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.asc()).all()
            grouped = {}
            for workout in workouts:
                key = workout.exercise_name.strip().lower()
                grouped.setdefault(key, []).append(workout)
            for exercises in grouped.values():
                if len(exercises) < 2:
                    continue
                for idx, current in enumerate(exercises[:-1]):
                    future = exercises[idx + 1]
                    rows.append({
                        "prev_weight": float((current.calories_burned or 0) / max(current.duration or 1, 1) + current.sets * 2.5),
                        "reps_completed": float(current.reps or 0),
                        "sets_completed": float(current.sets or 0),
                        "exercise_trend": float((future.reps or 0) - (current.reps or 0)) / 10.0,
                        "next_weight": float((future.calories_burned or 0) / max(future.duration or 1, 1) + future.sets * 2.5),
                    })
        return pd.DataFrame(rows)

    @staticmethod
    def _fallback_weight_df():
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
        return pd.DataFrame({
            "current_weight": current_weight,
            "trend_14": trend_14,
            "trend_30": trend_30,
            "goal_direction": goal_direction,
            "activity_score": activity_score,
            "horizon_days": horizon_days,
            "target_weight": target_weight
        })

    @staticmethod
    def _persist_metrics(model_name, metrics, sample_count, details=None):
        details_json = None
        if details is not None:
            import json
            details_json = json.dumps(details)

        for metric_name, metric_value in metrics.items():
            db.session.add(
                MLModelMetric(
                    model_name=model_name,
                    metric_name=metric_name,
                    metric_value=float(metric_value),
                    sample_count=int(sample_count),
                    details=details_json,
                )
            )
        db.session.commit()

    @staticmethod
    def _fit_and_score(model, X, y, task_type="regression"):
        stratify = y if task_type == "classification" and len(pd.Series(y).unique()) > 1 else None
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=stratify,
        )
        fitted = clone(model)
        fitted.fit(X_train, y_train)

        if task_type == "classification":
            y_pred = fitted.predict(X_test)
            proba = fitted.predict_proba(X_test)[:, 1] if hasattr(fitted, "predict_proba") and len(fitted.classes_) > 1 else None
            metrics = {
                "accuracy": accuracy_score(y_test, y_pred),
            }
            if proba is not None:
                metrics["mean_positive_probability"] = float(np.mean(proba))
        else:
            y_pred = fitted.predict(X_test)
            metrics = {
                "mse": mean_squared_error(y_test, y_pred),
                "mae": mean_absolute_error(y_test, y_pred),
                "r2": r2_score(y_test, y_pred),
            }
        return fitted, metrics, len(X)

    # ====================================================
    # A. WEIGHT PREDICTION MODEL (LinearRegression)
    # ====================================================

    @classmethod
    def train_weight_model(cls):
        df = cls._build_weight_training_rows()
        if df.empty:
            df = cls._fallback_weight_df()

        X = df[["current_weight", "trend_14", "trend_30", "goal_direction", "activity_score", "horizon_days"]]
        y = df["target_weight"]

        model, metrics, sample_count = cls._fit_and_score(LinearRegression(), X, y, task_type="regression")
        print(f"[ML Service] Weight Model Trained. Metrics: {metrics}")

        # Save model
        with open(cls._get_model_path("weight_model"), "wb") as f:
            pickle.dump(model, f)

        cls._persist_metrics("weight_model", metrics, sample_count, details={"features": list(X.columns)})
        return metrics.get("mse", 0.0)

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
        df = cls._build_consistency_training_rows()
        if df.empty:
            np.random.seed(42)
            size = 2500
            workout_frequency = np.random.uniform(0, 7, size)
            missed_sessions = np.random.uniform(0, 8, size)
            login_days = np.random.uniform(0, 30, size)
            streak_days = np.random.uniform(0, 60, size)
            session_duration = np.random.uniform(10, 120, size)

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

        model, metrics, sample_count = cls._fit_and_score(
            RandomForestClassifier(n_estimators=180, random_state=42, max_depth=8),
            X,
            y,
            task_type="classification",
        )
        acc = metrics.get("accuracy", 0.0)
        print(f"[ML Service] Consistency Dropout Model Trained. Metrics: {metrics}")

        with open(cls._get_model_path("consistency_model"), "wb") as f:
            pickle.dump(model, f)

        cls._persist_metrics("consistency_model", metrics, sample_count, details={"features": list(X.columns)})
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
        df = cls._build_recovery_training_rows()
        if df.empty:
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

        model, metrics, sample_count = cls._fit_and_score(
            RandomForestRegressor(n_estimators=160, random_state=42, max_depth=10),
            X,
            y,
            task_type="regression",
        )
        mse = metrics.get("mse", 0.0)
        print(f"[ML Service] Recovery Model Trained. Metrics: {metrics}")

        with open(cls._get_model_path("recovery_model"), "wb") as f:
            pickle.dump(model, f)

        cls._persist_metrics("recovery_model", metrics, sample_count, details={"features": list(X.columns)})
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
        df = cls._build_overload_training_rows()
        if df.empty:
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

        model, metrics, sample_count = cls._fit_and_score(
            RandomForestRegressor(n_estimators=180, random_state=42, max_depth=12),
            X,
            y,
            task_type="regression",
        )
        mse = metrics.get("mse", 0.0)
        print(f"[ML Service] Progressive Overload Model Trained. Metrics: {metrics}")

        with open(cls._get_model_path("overload_model"), "wb") as f:
            pickle.dump(model, f)

        cls._persist_metrics("overload_model", metrics, sample_count, details={"features": list(X.columns)})
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
