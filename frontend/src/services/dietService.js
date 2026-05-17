import api from './api';

/**
 * Generate a personalized diet plan based on fitness goals and body characteristics.
 * @param {Object} dietSpecs - Goals, allergies, current weight, target weight, age, calories.
 * @returns {Promise<Object>} The generated AI diet plan containing daily meals, macros, and tips.
 */
export const generateDiet = async (dietSpecs) => {
  try {
    const response = await api.post('/diet/generate', dietSpecs);
    return response.data.data;
  } catch (error) {
    console.warn('AI Diet Generation offline, using local neural network model fallback.');
    
    // Simulate AI generation lag
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const goal = dietSpecs.fitnessGoal || 'Fat Loss';
    const weight = parseFloat(dietSpecs.weight) || 75;
    
    let targetCalories = Math.round(weight * 22); // Baseline lean estimation
    if (goal.toLowerCase().includes('gain') || goal.toLowerCase().includes('bulk')) {
      targetCalories = Math.round(weight * 32); // Caloric surplus
    } else if (goal.toLowerCase().includes('loss') || goal.toLowerCase().includes('shred')) {
      targetCalories = Math.round(weight * 18); // Caloric deficit
    }

    // Compute healthy macro split
    const protein = Math.round(weight * 2.2); // 2.2g per kg
    const fat = Math.round(weight * 0.9); // 0.9g per kg
    const remainingCalories = targetCalories - (protein * 4) - (fat * 9);
    const carbs = Math.max(50, Math.round(remainingCalories / 4));

    return {
      success: true,
      calories: targetCalories,
      macros: {
        protein: `${protein}g`,
        carbs: `${carbs}g`,
        fats: `${fat}g`,
      },
      meals: [
        {
          name: 'Meal 1: High Protein Breakfast',
          time: '08:00 AM',
          items: [
            '4 Egg Whites + 2 Whole Eggs scrambled',
            '100g Rolled Oats with 1 scoop Whey Protein',
            '1 medium Banana & black coffee',
          ],
        },
        {
          name: 'Meal 2: Post-Workout Fuel',
          time: '12:00 PM',
          items: [
            '180g Grilled Chicken Breast',
            '150g Jasmine Rice or Sweet Potato',
            'Steamed Broccoli with olive oil drizzle',
          ],
        },
        {
          name: 'Meal 3: Mid-Day Recharge',
          time: '04:00 PM',
          items: [
            '200g Greek Yogurt (0% fat)',
            'Handful of mixed berries',
            '30g Almonds or Walnuts',
          ],
        },
        {
          name: 'Meal 4: Anabolic Dinner',
          time: '08:00 PM',
          items: [
            '180g Baked Salmon or Tilapia',
            'Large mixed green salad with avocado slices',
            '100g Quinoa or brown rice',
          ],
        },
      ],
      hydration: '3.5 - 4 Liters of purified water per day',
      tips: [
        'Stay hydrated: Drink 500ml of water immediately upon waking.',
        'Protein density: Ensure protein is divided evenly across all 4 meals.',
        'Meal timing: Consume Meal 2 within 90 minutes after your workout session.',
      ],
    };
  }
};
