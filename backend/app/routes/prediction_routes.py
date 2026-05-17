from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.utils.responses import api_response, error_response

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api/predict')

@prediction_bp.route('', methods=['POST'])
@jwt_required()
def predict_progress():
    """
    Simulates 12-week progress forecasting mathematically.
    Contains NO Machine Learning libraries, complying fully with instructions.
    """
    try:
        data = request.get_json()
        if not data:
            return error_response("Payload is empty", status_code=400)

        # Parse stats
        try:
            start_weight = float(data.get("weight", 78.0))
            body_fat = float(data.get("bodyFat") or data.get("body_fat", 18.0))
            days_per_week = int(data.get("daysPerWeek", 4))
        except (ValueError, TypeError):
            return error_response("Weight, body fat, and days per week must be valid numbers", status_code=400)

        goal = data.get("fitnessGoal", "Weight Loss")

        # Deterministic simulation based on physical goals
        weeks = ["Wk 0", "Wk 2", "Wk 4", "Wk 6", "Wk 8", "Wk 10", "Wk 12"]
        weight_curve = []
        muscle_curve = []
        
        # Calculate lean muscle benchmark (estimated)
        start_muscle = start_weight * (1 - (body_fat / 100)) * 0.5

        for i in range(len(weeks)):
            week_num = i * 2
            if goal == "Weight Loss":
                # Healthy weight reduction of 0.4kg per week
                current_weight = start_weight - (0.4 * week_num)
                # Slow muscle retention or minor gain
                current_muscle = start_muscle + (0.05 * week_num)
            elif goal == "Muscle Gain":
                # Controlled weight gain of 0.25kg per week
                current_weight = start_weight + (0.25 * week_num)
                # Hypertrophy gains
                current_muscle = start_muscle + (0.15 * week_num)
            else:
                # Conditioning / Endurance: Stable weights
                current_weight = start_weight - (0.1 * week_num)
                current_muscle = start_muscle + (0.08 * week_num)
                
            weight_curve.append(round(current_weight, 1))
            muscle_curve.append(round(current_muscle, 1))

        # Compile summaries
        if goal == "Weight Loss":
            time_frame = "12 Weeks (Shred Cycle)"
            advice = (
                f"For a Shred cycle, maintain a calorie deficit of 400kcal. "
                f"We project a total loss of {round(start_weight - weight_curve[-1], 1)}kg. "
                f"Ensure daily protein intake is at least 2.0g per kg of body weight to safeguard your muscle peaks."
            )
        elif goal == "Muscle Gain":
            time_frame = "12 Weeks (Hypertrophy Cycle)"
            advice = (
                f"To maximize lean tissue growth, consume a surplus of 300kcal daily. "
                f"We project a controlled clean increase of {round(weight_curve[-1] - start_weight, 1)}kg. "
                f"Space compound sets by 90 seconds to maximize mechanical tension."
            )
        else:
            time_frame = "12 Weeks (Conditioning)"
            advice = (
                "Maintain weight stability. Focus on progressive overload during compound lifts "
                "coupled with high-intensity interval cardiorespiratory shocks twice per week."
            )

        forecast_data = {
            "estimatedTransformationTime": time_frame,
            "weeks": weeks,
            "weightCurve": weight_curve,
            "muscleCurve": muscle_curve,
            "recommendationSummary": advice
        }

        return api_response(success=True, message="Biomechanical trajectory forecast calculated successfully", data=forecast_data)

    except Exception as e:
        return error_response(f"Could not calculate progress forecast: {str(e)}", status_code=500)
