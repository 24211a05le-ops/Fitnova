from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.utils.responses import api_response, error_response

diet_bp = Blueprint('diet', __name__, url_prefix='/api/diet')

@diet_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_diet_plan():
    """
    Generates a personalized daily nutrition menu plan.
    Contains NO AI models, adhering strictly to the "Do NOT use AI" instruction.
    """
    try:
        data = request.get_json()
        if not data:
            return error_response("Payload is empty", status_code=400)

        try:
            weight = float(data.get("weight", 75.0))
        except (ValueError, TypeError):
            weight = 75.0

        goal = data.get("fitnessGoal", "Weight Loss")
        preference = data.get("dietPreference", "High Protein")

        # 1. Determine Target Calories
        if goal == "Weight Loss":
            calories = int((weight * 22) - 400)
            protein_pct, carbs_pct, fats_pct = 40, 35, 25
        elif goal == "Muscle Gain":
            calories = int((weight * 26) + 300)
            protein_pct, carbs_pct, fats_pct = 30, 45, 25
        else:
            calories = int(weight * 24)
            protein_pct, carbs_pct, fats_pct = 35, 40, 25

        # Calculate exact macro gram totals
        protein_g = int((calories * (protein_pct / 100)) / 4)
        carbs_g = int((calories * (carbs_pct / 100)) / 4)
        fats_g = int((calories * (fats_pct / 100)) / 9)

        # 2. Compile Food Menus based on dietary preference
        if preference == "Vegetarian":
            breakfast = ["3 Scrambled Egg Whites with Spinach", "1 Slice of Whole Wheat Toast", "1 Banana"]
            lunch = ["Grilled Tofu (180g) with Quinoa", "Steamed Broccoli & Carrot Medley", "1 tablespoon Olive Oil"]
            snack = ["Greek Yogurt (150g) with Almonds", "Handful of Blueberries"]
            dinner = ["Lentil Curry (1 Bowl) with Brown Rice", "Mixed Green Salad with Lemon Dressing"]
            tips = [
                "Focus on combining diverse grains to ensure complete plant-based amino acid coverage.",
                "Include egg whites or premium paneer to meet high protein targets.",
                "Squeeze lemon over green meals to increase non-heme iron absorption!"
            ]
        elif preference == "Vegan":
            breakfast = ["Oatmeal with Almond Milk", "1 Scoop Plant Protein Powder", "Chia Seeds (1 tbsp)"]
            lunch = ["Tempeh Stir-Fry (180g) with Edamame", "Brown Rice or Sweet Potato Mash", "Asparagus Spears"]
            snack = ["Peanut Butter (2 tbsp) with Apple Slices", "Raw Pumpkin Seeds"]
            dinner = ["Black Bean & Quinoa Bowl", "Guacamole (2 tbsp)", "Roasted Brussels Sprouts"]
            tips = [
                "Incorporate hemp and chia seeds daily to satisfy essential Omega-3 fatty acid targets.",
                "Take a B12 supplement to support central nervous system recovery.",
                "Hydrate with at least 3 liters of water to manage high dietary fiber volumes."
            ]
        elif preference == "Ketogenic":
            breakfast = ["3 Whole Eggs cooked in Butter", "2 Strips of Bacon", "Avocado (Half)"]
            lunch = ["Baked Salmon Fillet (200g) with Butter", "Sauteed Spinach with Garlic & Olive Oil"]
            snack = ["Macadamia Nuts (Handful)", "String Cheese (2 Sticks)"]
            dinner = ["Ribeye Steak or Chicken Thighs", "Cauliflower Mash with Heavy Cream", "Mixed Greens"]
            tips = [
                "Strictly cap net carbohydrates below 25-30g daily to maintain deep metabolic ketosis.",
                "Replenish sodium, potassium, and magnesium to prevent low-carb fatigue.",
                "Focus on high-quality MCT fats from coconuts and grass-fed butter."
            ]
        else:
            # Default "High Protein" / Balanced Plan
            breakfast = ["3 Egg Whites & 1 Whole Egg", "Oatmeal (50g) with Berries", "Protein Shake"]
            lunch = ["Grilled Chicken Breast (200g)", "Sweet Potato (150g)", "Steamed Green Asparagus"]
            snack = ["Whey Protein Shake", "Rice Cakes (2) with Almond Butter"]
            dinner = ["Sirloin Steak or Baked Salmon (180g)", "Brown Rice (100g)", "Roasted Zucchini & Bell Peppers"]
            tips = [
                "Drink 1 glass of water 15 minutes before every meal to support digestion.",
                "Space meals by 3-4 hours to sustain a positive nitrogen balance in muscles.",
                "Avoid carbonated high-sugar soft drinks; stick to black coffee and green teas."
            ]

        meals = [
            {"name": "Breakfast", "time": "08:00 AM", "items": breakfast},
            {"name": "Lunch", "time": "01:00 PM", "items": lunch},
            {"name": "Snack", "time": "04:30 PM", "items": snack},
            {"name": "Dinner", "time": "08:30 PM", "items": dinner}
        ]

        diet_data = {
            "calories": calories,
            "macros": {
                "protein": f"{protein_g}g",
                "carbs": f"{carbs_g}g",
                "fats": f"{fats_g}g"
            },
            "meals": meals,
            "tips": tips
        }

        return api_response(success=True, message="AI Custom nutrition plan compiled successfully", data=diet_data)

    except Exception as e:
        return error_response(f"Could not generate nutrition plan: {str(e)}", status_code=500)
