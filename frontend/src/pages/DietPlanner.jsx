import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Plus, 
  Utensils, 
  Droplet, 
  Flame, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Check, 
  TrendingUp, 
  Settings, 
  Apple 
} from 'lucide-react';
import { generateDiet } from '../services/dietService';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Validation Schema for AI Diet Generator
const dietGeneratorSchema = yup.object().shape({
  weight: yup
    .number()
    .typeError('Weight must be a positive number')
    .required('Weight is required')
    .positive('Weight must be positive')
    .min(30, 'Weight is too small')
    .max(300, 'Weight is too large'),
  fitnessGoal: yup
    .string()
    .required('Fitness goal is required'),
  dietPreference: yup
    .string()
    .required('Dietary preference is required'),
});

const DietPlanner = () => {
  const { user } = useAuth();
  const [dietPlan, setDietPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loggedGlasses, setLoggedGlasses] = useState(4); // default tracker
  
  // Set default initial values from the global user context if available
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(dietGeneratorSchema),
    mode: 'onChange',
    defaultValues: {
      weight: user?.weight || 75,
      fitnessGoal: user?.fitnessGoal || 'Weight Loss',
      dietPreference: 'High Protein',
    }
  });

  // Pre-load a default diet plan for high fidelity visual presentation on first loading
  useEffect(() => {
    const fetchDefault = async () => {
      setGenerating(true);
      try {
        const plan = await generateDiet({
          weight: user?.weight || 75,
          fitnessGoal: user?.fitnessGoal || 'Weight Loss',
          dietPreference: 'High Protein'
        });
        setDietPlan(plan);
      } catch (err) {
        console.error(err);
      } finally {
        setGenerating(false);
      }
    };
    fetchDefault();
  }, [user]);

  const handleGenerate = async (data) => {
    setGenerating(true);
    setDietPlan(null);
    try {
      console.log('DietPlanner: Generating AI plan with metrics:', data);
      const plan = await generateDiet({
        weight: data.weight,
        fitnessGoal: data.fitnessGoal,
        dietPreference: data.dietPreference,
      });
      setDietPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleHydrationClick = (index) => {
    if (index < loggedGlasses) {
      setLoggedGlasses(index); // undo click
    } else {
      setLoggedGlasses(index + 1); // add glass
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-green-500/20">
              AI Intelligent Dietitian
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Precision Nutrition Engine</h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Fuel your transformation using custom macros and tailored AI-generated meal grids.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Form & Meal Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Generator Control Panel */}
          <section className="bg-gray-950 border border-white/5 rounded-[32px] p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 blur-3xl -mr-20 -mt-20 group-hover:bg-green-500/10 transition-all pointer-events-none" />
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="text-green-500 animate-pulse" size={20} />
              Re-Calculate Custom AI Diet Path
            </h3>

            <form onSubmit={handleSubmit(handleGenerate)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Current Weight (KG)</label>
                <input 
                  type="number" 
                  {...register('weight')}
                  className={`w-full bg-black border ${errors.weight ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:bg-gray-900/30 transition-all font-mono font-bold`}
                  placeholder="75"
                />
                {errors.weight && (
                  <p className="text-red-500 text-[9px] font-semibold flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.weight.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Active Target Goal</label>
                <select 
                  {...register('fitnessGoal')}
                  className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:bg-gray-900/30 transition-all font-bold appearance-none"
                >
                  <option value="Weight Loss">Weight Loss (Shred)</option>
                  <option value="Muscle Gain">Muscle Gain (Bulk)</option>
                  <option value="Cardio Conditioning">Lean Conditioning</option>
                  <option value="Endurance">Stamina Endurance</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Diet Preference</label>
                <select 
                  {...register('dietPreference')}
                  className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:bg-gray-900/30 transition-all font-bold appearance-none"
                >
                  <option value="High Protein">High Protein</option>
                  <option value="Vegetarian">Vegetarian Protein</option>
                  <option value="Vegan">100% Plant-Based Vegan</option>
                  <option value="Ketogenic">Low-Carb Ketogenic</option>
                  <option value="Balanced Diet">Balanced Macro Split</option>
                </select>
              </div>

              <div className="sm:col-span-3 pt-3">
                <button 
                  type="submit"
                  disabled={!isValid || generating}
                  className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    !isValid || generating
                      ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/10'
                  }`}
                >
                  {generating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Synthesizing AI Meal Plans...
                    </>
                  ) : (
                    <>
                      Generate Custom Nutrition Plan <Sparkles size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* AI Generated Meals Display */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Utensils className="text-green-500" size={20} />
              AI Daily Meal Roadmap
            </h3>
            
            {generating && (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-950 border border-white/5 rounded-[32px] p-8 animate-pulse space-y-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-900" />
                      <div className="space-y-2 flex-1">
                        <div className="w-32 h-4 bg-gray-900 rounded" />
                        <div className="w-24 h-2 bg-gray-900 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-gray-900 rounded" />
                      <div className="w-[80%] h-3 bg-gray-900 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!generating && dietPlan && (
              <div className="space-y-6">
                {dietPlan.meals?.map((meal, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gray-950 border border-white/5 rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shrink-0 mt-1">
                        <Utensils size={18} />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">{meal.name}</h4>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Target time: {meal.time}</p>
                        </div>
                        <ul className="space-y-1.5 list-disc list-inside text-gray-400 text-xs font-medium">
                          {meal.items?.map((item, itemIdx) => (
                            <li key={itemIdx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-black hover:border-transparent transition-all self-end md:self-center">
                      <Plus size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Macros & Hydration */}
        <div className="space-y-8">
          
          {/* Macronutrients Display */}
          <div className="bg-gray-950 border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -mr-10 -mt-10" />
            
            <h3 className="text-lg font-bold text-white mb-6">AI Target Macronutrients</h3>
            
            {generating ? (
              <div className="space-y-6 py-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between"><div className="w-12 h-3 bg-gray-900 rounded" /><div className="w-8 h-3 bg-gray-900 rounded" /></div>
                    <div className="w-full bg-gray-900 h-2 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">🥩 Protein (Target)</span>
                    <span className="text-xs font-mono font-black text-white">{dietPlan?.macros?.protein || '150g'}</span>
                  </div>
                  <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[75%] transition-all duration-700" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">🥖 Carbs (Target)</span>
                    <span className="text-xs font-mono font-black text-white">{dietPlan?.macros?.carbs || '220g'}</span>
                  </div>
                  <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[60%] transition-all duration-700" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">🥑 Fats (Target)</span>
                    <span className="text-xs font-mono font-black text-white">{dietPlan?.macros?.fats || '65g'}</span>
                  </div>
                  <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[55%] transition-all duration-700" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-white">
                  <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">AI Caloric Target</p>
                    <p className="text-2xl font-black mt-2 font-mono text-green-400">{dietPlan?.calories || '2200'} kcal</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                    <Flame size={22} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hydration Tracker */}
          <div className="bg-gray-950 border border-white/5 rounded-[32px] p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Droplet className="text-blue-500" size={18} />
              Hydration Tracker
            </h3>
            
            <div className="grid grid-cols-4 gap-3.5">
              {[...Array(8)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => handleHydrationClick(i)}
                  className={`aspect-square rounded-xl border flex items-center justify-center transition-all ${
                    i < loggedGlasses 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-inner' 
                      : 'bg-black border-white/5 text-gray-800 hover:text-gray-400 hover:border-white/10'
                  }`}
                >
                  <Droplet size={18} fill={i < loggedGlasses ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between items-center text-xs font-bold text-gray-500">
              <span>{loggedGlasses} of 8 glasses logged</span>
              <span className="font-mono text-blue-400 font-black">{(loggedGlasses * 0.25).toFixed(2)}L logged</span>
            </div>
          </div>

          {/* Pro Dietary Guidelines */}
          {!generating && dietPlan?.tips && (
            <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-[32px] p-8 text-black shadow-xl shadow-green-500/5">
              <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center mb-4">
                <Apple size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2">Nutritional Guidelines</h3>
              <ul className="space-y-3 mt-4 text-xs font-semibold leading-relaxed text-black/85">
                {dietPlan.tips?.map((tip, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="font-black text-sm leading-none shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietPlanner;
