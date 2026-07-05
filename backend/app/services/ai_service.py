import os
import json
import time
import requests
from flask import current_app
from app import db
from app.models.exercise_embedding import ExerciseEmbedding

PRIMARY_MODEL = "gemini-2.5-flash"
SECONDARY_MODEL = "gemini-2.5-flash-lite"
FALLBACK_MODEL = "gemini-flash-lite-latest"

# In-memory caching for prompt outputs
_ai_cache = {}

class AIService:
    """Production-grade Google Gemini AI Coaching Orchestrator with structured modules, validation, and ML integration."""

    @staticmethod
    def _get_api_key():
        return os.getenv("GEMINI_API_KEY", "")

    @staticmethod
    def _clean_json_text(text):
        if not text:
            return ""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    @staticmethod
    def _goal_muscle_groups(goal):
        goal_lower = str(goal or "").lower()
        if any(keyword in goal_lower for keyword in ["muscle", "gain", "hypertrophy", "bulk"]):
            return ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]
        if any(keyword in goal_lower for keyword in ["strength", "power"]):
            return ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]
        if any(keyword in goal_lower for keyword in ["fat loss", "weight loss", "cut", "lose"]):
            return ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]
        return ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]

    @staticmethod
    def _exercise_matches_equipment(exercise, equipment):
        equipment_lower = str(equipment or "").lower()
        exercise_equipment = str(exercise.equipment or "").lower()
        if any(keyword in equipment_lower for keyword in ["bodyweight", "home"]):
            return exercise_equipment in {"home", "bodyweight"}
        if "dumbbell" in equipment_lower and exercise_equipment == "gym":
            return True
        if "gym" in equipment_lower or "full" in equipment_lower:
            return True
        return equipment_lower in exercise_equipment

    @staticmethod
    def _exercise_matches_injuries(exercise, injuries):
        injuries_lower = str(injuries or "").lower()
        if not injuries_lower or "none" in injuries_lower:
            return True

        text = f"{exercise.exercise_name} {exercise.muscle_group} {exercise.tags}".lower()
        unsafe_map = {
            "shoulder": ["shoulder press", "overhead press", "lateral raise", "upright row", "face pull"],
            "knee": ["squat", "leg press", "lunge", "step up", "split squat", "hack squat"],
            "joint": ["squat", "leg press", "lunge", "deadlift"],
            "back": ["deadlift", "barbell row", "t-bar row", "row", "good morning"],
            "spine": ["deadlift", "barbell row", "t-bar row", "row", "good morning"],
        }

        for injury_key, unsafe_keywords in unsafe_map.items():
            if injury_key in injuries_lower:
                if any(keyword in text for keyword in unsafe_keywords):
                    return False

        return True

    @staticmethod
    def _build_candidate_exercises(goal, equipment, injuries, days):
        all_exercises = ExerciseEmbedding.query.order_by(
            ExerciseEmbedding.muscle_group.asc(),
            ExerciseEmbedding.exercise_name.asc(),
        ).all()

        goal_groups = set(AIService._goal_muscle_groups(goal))
        days_int = max(int(days or 3), 1)
        max_candidates = max(18, days_int * 10)

        filtered = [
            exercise for exercise in all_exercises
            if exercise.muscle_group in goal_groups
            and AIService._exercise_matches_equipment(exercise, equipment)
            and AIService._exercise_matches_injuries(exercise, injuries)
        ]

        if not filtered:
            filtered = [
                exercise for exercise in all_exercises
                if AIService._exercise_matches_equipment(exercise, equipment)
                and AIService._exercise_matches_injuries(exercise, injuries)
            ]

        if not filtered:
            filtered = all_exercises

        return filtered[:max_candidates]

    @staticmethod
    def _format_candidate_exercises(exercises):
        return "\n".join(
            f"- {exercise.exercise_name} (Muscle: {exercise.muscle_group}, Difficulty: {exercise.difficulty}, Equipment: {exercise.equipment})"
            for exercise in exercises
        )

    @staticmethod
    def call_model(prompt, system_instruction="You are a senior fitness and AI personal coach for Fitnova.", response_format=None, custom_model=None):
        api_key = AIService._get_api_key()
        if not api_key:
            return AIService._get_mock_response(prompt, response_format)

        cache_key = f"{prompt}_{system_instruction}_{response_format}_{custom_model}"
        if cache_key in _ai_cache:
            return _ai_cache[cache_key]

        models_to_try = [PRIMARY_MODEL, SECONDARY_MODEL, FALLBACK_MODEL]
        if custom_model:
            models_to_try.insert(0, custom_model)

        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            
            full_prompt = prompt
            if system_instruction:
                full_prompt = f"System Instruction: {system_instruction}\n\nUser Message: {prompt}"
                
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": full_prompt}
                        ]
                    }
                ]
            }
            
            if response_format and response_format.get("type") == "json_object":
                payload["generationConfig"] = {
                    "responseMimeType": "application/json"
                }

            retries = 2
            for attempt in range(retries):
                try:
                    response = requests.post(
                        url,
                        headers={"Content-Type": "application/json"},
                        json=payload,
                        timeout=45
                    )
                    if response.status_code == 200:
                        res_json = response.json()
                        candidates = res_json.get("candidates") or []
                        if not candidates:
                            raise ValueError("AI provider returned no candidates")

                        content = candidates[0].get("content") or {}
                        parts = content.get("parts") or []
                        text_content = next(
                            (part.get("text") for part in parts if isinstance(part, dict) and part.get("text")),
                            None
                        )
                        if not text_content:
                            raise ValueError("AI provider returned an empty response body")
                        
                        _ai_cache[cache_key] = text_content
                        return text_content
                    elif response.status_code in (429, 503, 500):
                        print(f"[Gemini Service] Model {model} returned status {response.status_code}, trying next model.")
                        break
                    else:
                        print(f"[Gemini Service] Model {model} returned status {response.status_code}: {response.text}")
                        break
                except Exception as e:
                    print(f"[Gemini Service] Error calling model {model} on attempt {attempt}: {str(e)}")
                    if attempt == retries - 1:
                        break

        return AIService._get_mock_response(prompt, response_format)

    @staticmethod
    def _get_mock_response(prompt, response_format):
        """Standard mock fallback responses structured to match format requests"""
        prompt_lower = prompt.lower()
        
        if response_format and response_format.get("type") == "json_object":
            if "workout" in prompt_lower or "split" in prompt_lower:
                return json.dumps({
                    "weekly_split": {
                        "Monday": "Upper Body Strength",
                        "Wednesday": "Lower Body Strength",
                        "Friday": "Full Body Conditioning"
                    },
                    "exercises": {
                        "Monday": [
                            {"name": "Barbell Bench Press", "sets": 4, "reps": "10 reps", "rest_time": "90s"},
                            {"name": "Pull-Ups", "sets": 3, "reps": "8 reps", "rest_time": "90s"}
                        ],
                        "Wednesday": [
                            {"name": "Barbell Squats", "sets": 4, "reps": "10 reps", "rest_time": "120s"}
                        ],
                        "Friday": [
                            {"name": "Push-Ups", "sets": 3, "reps": "15 reps", "rest_time": "60s"}
                        ]
                    },
                    "warm_up": {
                        "Monday": "5 mins arm circles, band pull-aparts, light bench press sets.",
                        "Wednesday": "5 mins bodyweight squats, leg swings, dynamic glute bridges.",
                        "Friday": "5 mins jumping jacks, arm swings, dynamic full-body mobility flow."
                    },
                    "cooldown": {
                        "Monday": "3 mins chest doorway stretch, static overhead tricep stretch.",
                        "Wednesday": "3 mins kneeling quad stretch, hamstring stretches.",
                        "Friday": "3 mins child's pose, deep breathing, spine decompression."
                    },
                    "progression_strategy": "Increase weight by 2.5kg once all planned sets are completed with perfect form.",
                    "cardio_plan": "15 minutes of low-intensity steady-state cardio post-workout."
                })
            elif "meal" in prompt_lower or "diet" in prompt_lower:
                return json.dumps({
                    "breakfast": "Oatmeal with protein powder and mixed berries.",
                    "lunch": "Grilled chicken breast with brown rice and broccoli.",
                    "dinner": "Baked salmon with sweet potatoes and green beans.",
                    "snacks": "Greek yogurt with a handful of almonds.",
                    "macros": {"proteins": "160g", "carbs": "200g", "fats": "65g"},
                    "meal_timing": "Eat meals spaced 3-4 hours apart, finishing dinner at least 2 hours before bed."
                })
            elif "recovery" in prompt_lower or "soreness" in prompt_lower:
                return json.dumps({
                    "recovery_advice": "Focus on passive stretching and progressive foam rolling to release tension. Ensure optimal hydration.",
                    "suggested_workout_today": "Active recovery: 30 minutes of walking or gentle mobility flows.",
                    "hydration_suggestions": "Drink 3.5 liters of water today. Add electrolytes if workout intensity was high.",
                    "rest_recommendation": "Go to sleep 30 minutes earlier tonight. Keep room temperature cool."
                })
            elif "onboarding" in prompt_lower or "maintenance" in prompt_lower:
                return json.dumps({
                    "fitness_profile_summary": "User is focused on optimal transformation, presenting clean schedules and moderate equipment access.",
                    "recommended_training_style": "Resistance training combined with active recovery blocks.",
                    "calorie_recommendation": 2400,
                    "beginner_intermediate_classification": "Intermediate",
                    "estimated_maintenance_calories": 2600
                })
            else:
                return json.dumps({
                    "advice": "Focus on consistency, progressive overload, and active recovery blocks for optimal progression!"
                })
        
        else:
            if "workout" in prompt_lower or "split" in prompt_lower:
                return "Here is a high-level recommendation for your workout split:\n\n* **Monday (Push)**: Focus on Chest, Shoulders, and Triceps.\n* **Wednesday (Pull)**: Focus on Back and Biceps.\n* **Friday (Legs)**: Focus on Quads, Hamstrings, and Calves.\n\nFocus on progressive overload by slowly increasing reps or load week-over-week!"
            elif "meal" in prompt_lower or "diet" in prompt_lower:
                return "To optimize your diet progress, try keeping these guidelines in mind:\n\n1. **Protein Target**: Target 1.8-2.2g of protein per kg of bodyweight.\n2. **Clean Sources**: Focus on high-quality proteins (chicken, fish, eggs, tofu) and complex carbs (oats, brown rice).\n3. **Hydration**: Drink 3-4 liters of water to support metabolism and muscle recovery!"
            else:
                return "Welcome! As your professional fitness intelligence coach, I'm here to guide you. Focus on maintaining a consistent training split, staying hydrated, prioritizing compound lifts, and sleeping 7-8 hours for optimal progressive overload!"

    # ====================================================
    # VALIDATION LAYER
    # ====================================================
    @staticmethod
    def validate_workout_plan(plan, duration_limit, injuries, equipment_type):
        """
        Validates workout plan:
        - No duplicate exercises
        - Total duration fits target (duration_limit)
        - Equipment fits constraints
        - Injuries are respected
        """
        if not plan or not isinstance(plan, dict):
            return False, "Plan is not a valid JSON object."

        weekly_split = plan.get("weekly_split") or {}
        exercises_map = plan.get("exercises") or {}

        if not weekly_split or not exercises_map:
            return False, "Missing weekly_split or exercises fields."

        # Verify no duplicate exercises globally or within day
        all_exercises_names = []
        for day, exs in exercises_map.items():
            if not isinstance(exs, list):
                return False, f"Exercises for day {day} is not an array."
            
            day_exercise_names = []
            for ex in exs:
                name = ex.get("name") if isinstance(ex, dict) else str(ex)
                if not name:
                    return False, f"Missing name field in exercise on {day}."
                if name in day_exercise_names:
                    return False, f"Duplicate exercise '{name}' found on {day}."
                day_exercise_names.append(name)
                all_exercises_names.append(name.lower())

        # Check injuries conflicts (e.g. if injury is 'shoulder', no overhead press)
        injuries_lower = str(injuries).lower()
        if "none" not in injuries_lower:
            unsafe_keywords = []
            if "shoulder" in injuries_lower:
                unsafe_keywords.extend(["shoulder press", "overhead press", "lateral raise", "face pull", "upright row"])
            if "knee" in injuries_lower or "joint" in injuries_lower:
                unsafe_keywords.extend(["squat", "leg press", "lunge"])
            if "back" in injuries_lower or "spine" in injuries_lower:
                unsafe_keywords.extend(["deadlift", "heavy barbell rows"])

            for ex_name in all_exercises_names:
                for keyword in unsafe_keywords:
                    if keyword in ex_name:
                        return False, f"Unsafe exercise '{ex_name}' conflicting with injury '{injuries}'."

        # Check equipment access
        equipment_lower = str(equipment_type).lower()
        if "bodyweight" in equipment_lower:
            for ex_name in all_exercises_names:
                if any(w in ex_name for w in ["barbell", "dumbbell", "cable", "smith machine", "machine"]):
                    return False, f"Exercise '{ex_name}' requires gym equipment but client is bodyweight-only."

        # Estimate duration per day
        # warmup (10 mins) + cooldown (5 mins) + exercises (sets * rest_time + sets * 1.5 mins)
        for day, exs in exercises_map.items():
            est_dur = 15 # Warm-up + Cooldown base
            for ex in exs:
                sets = int(ex.get("sets", 3))
                # extract rest time numeric part
                rest_str = str(ex.get("rest_time", "60s"))
                rest_val = 60
                if "90" in rest_str:
                    rest_val = 90
                elif "120" in rest_str:
                    rest_val = 120
                
                # sets * (rest + 60s performance time)
                est_dur += int((sets * (rest_val + 60)) / 60)
            
            if est_dur > duration_limit + 10: # allow 10min threshold
                return False, f"Day {day} estimated duration ({est_dur} mins) exceeds session limit ({duration_limit} mins)."

        return True, "Success"

    # ====================================================
    # SPECIALIZED AI MODULES & PROMPTS
    # ====================================================

    @classmethod
    def generate_workout_plan(cls, goal, days, equipment, level, duration, injuries, workout_history=None, recovery_score=100, overload_rec=None):
        """
        Specialized Workout Generator Module.
        Applies certified trainer instructions and validates output automatically.
        """
        # Build candidate exercises from the database before handing them to Gemini.
        candidate_exercises = cls._build_candidate_exercises(goal, equipment, injuries, days)
        exercise_list_str = cls._format_candidate_exercises(candidate_exercises) if candidate_exercises else "Use standard gym exercises suitable for user's level."

        system_instruction = (
            "You are a professional Strength and Conditioning Coach. You write precise, scientific workout splits. "
            "You must select exercises ONLY from the following candidate exercises filtered from the exercise database:\n"
            f"{exercise_list_str}\n\n"
            "Rules:\n"
            "1. Prioritize multi-joint compound exercises at the beginning of each day's list.\n"
            "2. Never train the exact same muscle group twice within 48 hours.\n"
            "3. Beginner level must avoid advanced lifts (e.g. Deadlifts, Hanging Leg Raises). Intermediate/Advanced should include progressive overload.\n"
            "4. Strictly respect injuries. Avoid movements loaded on injured body parts.\n"
            "5. The exercises must fit within the target session duration.\n"
            "6. Modify workout difficulty according to the user's recovery score: if score < 50, scale down sets and volume; if score >= 80, scale up intensity."
        )

        validation_feedback = ""
        for attempt in range(3):
            prompt = f"""
            Generate a personalized workout split:
            - Goal: {goal}
            - Days: {days} days/week
            - Equipment Access: {equipment}
            - Difficulty Level: {level}
            - Workout Duration Limit: {duration} minutes
            - Injuries: {injuries}
            - Current Recovery Score: {recovery_score}/100
            - Progressive Overload Recommendation: {overload_rec or "None"}
            - Workout History Context: {workout_history or "None"}

            {f"Previous Validation Error (FIX THIS): {validation_feedback}" if validation_feedback else ""}

            Return a strictly formatted JSON object with keys:
            - weekly_split: An object mapping day names (e.g., "Monday", "Wednesday", "Friday") to their target focus (e.g., "Chest and Triceps").
            - exercises: An object mapping the exact same day names to an array of exercise objects. Each exercise object must have:
              - name: Exercise name (must exactly match one from the database list above).
              - sets: Number of sets (integer).
              - reps: Reps or duration (string, e.g., "8-10 reps").
              - rest_time: Rest duration (string, e.g., "90s").
            - warm_up: An object mapping the same day names to a string description of dynamic warm-up exercises.
            - cooldown: An object mapping the same day names to a string description of static cooldown stretches.
            - progression_strategy: String progression plan (incorporate the overload recommendation).
            - cardio_plan: String recommending cardio integration.

            Do not include markdown wrappers around the JSON outside the standard JSON structure.
            """
            
            response_text = cls.call_model(prompt, system_instruction=system_instruction, response_format={"type": "json_object"})
            try:
                plan_json = json.loads(cls._clean_json_text(response_text))
                is_valid, err_msg = cls.validate_workout_plan(plan_json, duration, injuries, equipment)
                if is_valid:
                    return plan_json
                else:
                    validation_feedback = err_msg
                    print(f"[Workout Generator] Validation failed (Attempt {attempt+1}): {err_msg}")
            except Exception as e:
                validation_feedback = f"JSON Parse error: {str(e)}"
                print(f"[Workout Generator] Parse error (Attempt {attempt+1}): {str(e)}")

        # Final fallback to mock if validation fails repeatedly
        return json.loads(cls._get_mock_response("workout", {"type": "json_object"}))

    @classmethod
    def generate_fitness_chat(cls, user_message, chat_history_context=None, recent_workout_context=None):
        """
        Specialized Fitness Chat router. Directs user questions to specific sub-modules:
        - ExerciseExplainer (if asking how to do an exercise)
        - MotivationCoach (if asking for encouragement/mindset)
        - RecoveryCoach (if asking about fatigue/soreness)
        - FitnessChat (general fitness advice)
        """
        user_msg_lower = user_message.lower()
        
        # 1. Routing to appropriate prompt
        if any(w in user_msg_lower for w in ["explain", "how to", "form", "mistake", "video", "execute"]):
            system_instruction = (
                "You are an Exercise Explainer Specialist. Explain exercise mechanics, target muscles, common mistakes, "
                "and correct form. Be highly technical, safe, and professional. Avoid generic conversational fluff."
            )
        elif any(w in user_msg_lower for w in ["unmotivated", "lazy", "tired", "give up", "motivation", "mindset", "focus"]):
            system_instruction = (
                "You are a sports psychology and motivation coach. Provide professional, direct, non-fluffy mental coaching. "
                "Focus on consistency, discipline over motivation, and aligning actions with long-term fitness goals."
            )
        elif any(w in user_msg_lower for w in ["sore", "pain", "hurt", "recover", "sleep", "rest", "fatigue"]):
            system_instruction = (
                "You are a recovery specialist. Provide scientific recommendations for fatigue management, active recovery, "
                "hydration, sleep hygiene, and mobility splits. Give direct action points based on metrics."
            )
        else:
            system_instruction = (
                "You are an elite, professional fitness coach. Speak professionally and direct. "
                "Always base suggestions on the user's history and data context. Avoid generic 'ChatGPT-like' friendly chatter."
            )

        context_prompt = ""
        if chat_history_context:
            context_prompt += f"Recent Chat context:\n{chat_history_context}\n"
        if recent_workout_context:
            context_prompt += f"Recent Workout Context:\n{recent_workout_context}\n"
        
        prompt = f"{context_prompt}User message: {user_message}\nYour Response:"
        return cls.call_model(prompt, system_instruction=system_instruction)

    @classmethod
    def generate_recovery_advice(cls, last_workout, soreness, sleep, calories, intensity):
        """Delegates to the RecoveryCoach module prompt."""
        prompt = f"""
        Analyze these daily recovery metrics:
        - Last Workout Muscle Group: {last_workout}
        - Soreness level (1-10): {soreness}
        - Sleep hours: {sleep}
        - Calorie intake: {calories} kcal
        - Intensity level (1-10): {intensity}

        Provide recovery strategies. Return a strictly formatted JSON object with keys:
        - recovery_advice (string)
        - suggested_workout_today (string)
        - hydration_suggestions (string)
        - rest_recommendation (string)
        """
        system_instruction = (
            "You are a recovery coach. Provide professional recovery coaching based on physiological metrics. "
            "Suggest optimal sleep extension targets, dynamic release schemes, and nutrition adjustments."
        )
        response_text = cls.call_model(prompt, system_instruction=system_instruction, response_format={"type": "json_object"})
        try:
            return json.loads(cls._clean_json_text(response_text))
        except Exception:
            return json.loads(cls._get_mock_response("recovery", {"type": "json_object"}))

    @classmethod
    def analyze_onboarding(cls, onboarding_data):
        prompt = f"""
        Analyze this onboarding dataset:
        {json.dumps(onboarding_data)}

        Return a strictly formatted JSON object with keys:
        - fitness_profile_summary (string)
        - recommended_training_style (string)
        - calorie_recommendation (integer)
        - beginner_intermediate_classification (string)
        - estimated_maintenance_calories (integer)
        """
        system_instruction = "You are a senior fitness assessor. Analyze physical specs and determine starting difficulty and maintenance calories."
        response_text = cls.call_model(prompt, system_instruction=system_instruction, response_format={"type": "json_object"}, custom_model=SECONDARY_MODEL)
        try:
            return json.loads(cls._clean_json_text(response_text))
        except Exception:
            return json.loads(cls._get_mock_response("onboarding", {"type": "json_object"}))

    @classmethod
    def generate_meal_plan(cls, calories, diet_type, budget, meals_per_day, allergies, indian_preference):
        """Delegates to the MealPlanner module prompt."""
        prompt = f"""
        Design a premium, highly accurate and personalized diet plan:
        - Calorie Target: {calories} kcal
        - Vegetarian/Non-Veg: {diet_type} (Strictly respect this. If Vegetarian, DO NOT include any meat, fish, or eggs. If Non-Veg, include healthy meat/fish/egg options if appropriate).
        - Budget preference: {budget}
        - Meals per day: {meals_per_day} meals
        - Allergies/Avoid: {allergies} (Strictly exclude any ingredients containing these).
        - Indian Food Preference: {'Yes' if indian_preference else 'No'} (If Yes, suggest healthy Indian meals, e.g., paneer, dal, roti, brown rice, etc. If No, suggest western or global recipes).

        Return a strictly formatted JSON object with keys:
        - breakfast: String describing the breakfast meal, including ingredients and portion sizes to hit target.
        - lunch: String describing the lunch meal, including ingredients and portion sizes.
        - dinner: String describing the dinner meal, including ingredients and portion sizes.
        - snacks: String describing snack(s) for the day, matching the meal count preference.
        - macros: An object containing:
          - proteins: String (e.g., "150g")
          - carbs: String (e.g., "220g")
          - fats: String (e.g., "70g")
        - meal_timing: String explaining when to eat each meal for optimal recovery and energy.

        Ensure all meal suggestions strictly adhere to the calorie target of {calories} kcal and macros are mathematically consistent with it (1g protein = 4 kcal, 1g carb = 4 kcal, 1g fat = 9 kcal).
        Do not include markdown wrappers around the JSON outside the standard JSON structure.
        """
        system_instruction = "You are a professional sports nutritionist. Write precise, balanced meal plans aligned with diet restrictions."
        response_text = cls.call_model(prompt, system_instruction=system_instruction, response_format={"type": "json_object"})
        try:
            return json.loads(cls._clean_json_text(response_text))
        except Exception:
            return json.loads(cls._get_mock_response("meal", {"type": "json_object"}))
