import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Zap, MessageSquare, Send, Loader2, ArrowRight, ArrowLeft, TrendingUp, Award, ShieldCheck, Target, Dumbbell, Clock, Calendar, CheckCircle2, ChevronDown, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_PLAN = {
  "Weight Loss": [
    { day: "Monday", focus: "Full Body HIIT", exercises: [{ name: "Burpees", sets: 3, reps: 15, rest: "30s" }, { name: "Kettlebell Swings", sets: 4, reps: 20, rest: "30s" }, { name: "Mountain Climbers", sets: 3, reps: 30, rest: "20s" }] },
    { day: "Wednesday", focus: "Upper Body + Cardio", exercises: [{ name: "Push-Ups", sets: 4, reps: 15, rest: "30s" }, { name: "Dumbbell Rows", sets: 3, reps: 12, rest: "45s" }, { name: "Plank Hold", sets: 3, reps: "45s", rest: "20s" }] },
    { day: "Friday", focus: "Lower Body Burn", exercises: [{ name: "Jump Squats", sets: 4, reps: 15, rest: "30s" }, { name: "Walking Lunges", sets: 3, reps: 20, rest: "30s" }, { name: "Calf Raises", sets: 4, reps: 20, rest: "20s" }] },
  ],
  "Muscle Gain": [
    { day: "Monday", focus: "Chest & Triceps", exercises: [{ name: "Bench Press", sets: 4, reps: 10, rest: "90s" }, { name: "Incline DB Press", sets: 3, reps: 12, rest: "60s" }, { name: "Tricep Dips", sets: 3, reps: 12, rest: "60s" }] },
    { day: "Wednesday", focus: "Back & Biceps", exercises: [{ name: "Deadlifts", sets: 4, reps: 8, rest: "120s" }, { name: "Pull-Ups", sets: 4, reps: 10, rest: "90s" }, { name: "Barbell Curls", sets: 3, reps: 12, rest: "45s" }] },
    { day: "Friday", focus: "Legs & Shoulders", exercises: [{ name: "Squats", sets: 4, reps: 10, rest: "120s" }, { name: "Overhead Press", sets: 4, reps: 10, rest: "60s" }, { name: "Lateral Raises", sets: 3, reps: 15, rest: "45s" }] },
  ]
};

const AIRecommendations = () => {
  const { user } = useAuth();
  const { addExercise } = useWorkout();
  const navigate = useNavigate();

  // Generator State
  const [genStep, setGenStep] = useState(0); // 0=idle, 1=goal, 2=prefs, 3=loading, 4=result
  const [genData, setGenData] = useState({ goal: '', difficulty: 'Intermediate', daysPerWeek: 3, timePerSession: 45, equipment: 'Full Gym' });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'coach', text: `Hey ${user?.name || 'there'}! I'm your AI Coach. Ask me about workouts, recovery, nutrition, or use the Workout Generator to build a custom plan.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleGenerate = () => {
    setGenStep(3);
    setTimeout(() => {
      const goal = genData.goal || 'Muscle Gain';
      const plan = MOCK_PLAN[goal] || MOCK_PLAN['Muscle Gain'];
      setGeneratedPlan({ goal, plan, rationale: goal === 'Weight Loss' ? 'This plan combines HIIT with compound movements to maximize caloric burn while preserving lean muscle. The circuit-style keeps heart rate elevated for sustained fat oxidation.' : 'Progressive overload targeting each major muscle group with 8-12 rep ranges in the hypertrophy sweet spot. Compound lifts build foundational strength while isolation work sculpts definition.', progression: 'Weeks 1-2: Learn form at moderate intensity. Weeks 3-4: Increase weights by 5-10%, add 1 extra set. Reduce rest periods by 10s for conditioning.' });
      setGenStep(4);
    }, 2500);
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    const q = chatInput.toLowerCase();
    setChatInput('');
    setIsTyping(true);
    setTimeout(() => {
      let reply = "Great question! Based on your training profile, I'd recommend maintaining consistency with your current routine while progressively increasing intensity each week.";
      if (q.includes('diet') || q.includes('eat') || q.includes('calor')) reply = `For ${user?.fitness_goal || 'your goal'}, aim for a 40/35/25 protein-carb-fat split. Check the Diet Planner for personalized meal plans!`;
      else if (q.includes('recovery') || q.includes('rest') || q.includes('sleep')) reply = "Recovery is crucial! Aim for 7-9 hours of sleep, stay hydrated, and consider active recovery on rest days. Your muscles grow during rest, not during training.";
      else if (q.includes('hi') || q.includes('hello')) reply = `Hey ${user?.name || 'there'}! Ready to crush it? Ask me anything about training, nutrition, or recovery!`;
      setMessages(prev => [...prev, { sender: 'coach', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 1200);
  };

  const loadPlanToWorkout = () => {
    if (!generatedPlan) return;
    generatedPlan.plan.forEach(day => {
      day.exercises.forEach(ex => addExercise(ex.name, 'AI Generated'));
    });
    navigate('/workouts');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <header className="relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
            <Sparkles className="text-green-500 animate-pulse" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">AI Engine Active</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">COACH</span>
          </h1>
          <p className="text-gray-500 mt-3 text-sm max-w-xl">Generate personalized workout plans, get real-time coaching, and optimize your training with AI-powered insights.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Generator + Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workout Generator */}
          <section className="bg-gray-950 border border-white/5 rounded-[32px] p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500"><Zap size={20} /></div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Workout Generator</h3>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Build your perfect plan</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {genStep === 0 && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-sm text-gray-400 mb-6">Tell us your preferences and we'll generate a personalized weekly workout plan.</p>
                  <button onClick={() => setGenStep(1)} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-black rounded-2xl hover:from-green-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-xl shadow-green-500/10">
                    <Sparkles size={16} /> Start Generator
                  </button>
                </motion.div>
              )}

              {genStep === 1 && (
                <motion.div key="goal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-sm text-gray-400 mb-4">What's your primary goal?</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {['Weight Loss', 'Muscle Gain', 'Endurance', 'General Fitness'].map(g => (
                      <button key={g} onClick={() => setGenData(p => ({ ...p, goal: g }))}
                        className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${genData.goal === g ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>{g}</button>
                    ))}
                  </div>
                  <button onClick={() => genData.goal && setGenStep(2)} disabled={!genData.goal}
                    className="w-full py-3.5 bg-white text-black font-black rounded-2xl hover:bg-green-500 transition-all text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    Next <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}

              {genStep === 2 && (
                <motion.div key="prefs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Difficulty</label>
                      <select value={genData.difficulty} onChange={e => setGenData(p => ({ ...p, difficulty: e.target.value }))}
                        className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-all">
                        <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Days/Week</label>
                      <select value={genData.daysPerWeek} onChange={e => setGenData(p => ({ ...p, daysPerWeek: parseInt(e.target.value) }))}
                        className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-all">
                        {[2, 3, 4, 5, 6].map(d => <option key={d} value={d}>{d} days</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Time/Session</label>
                      <select value={genData.timePerSession} onChange={e => setGenData(p => ({ ...p, timePerSession: parseInt(e.target.value) }))}
                        className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-all">
                        {[30, 45, 60, 75, 90].map(t => <option key={t} value={t}>{t} min</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Equipment</label>
                      <select value={genData.equipment} onChange={e => setGenData(p => ({ ...p, equipment: e.target.value }))}
                        className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-all">
                        <option>Full Gym</option><option>Home / Minimal</option><option>Bodyweight Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setGenStep(1)} className="flex-1 py-3.5 border border-white/5 rounded-2xl text-gray-400 font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button onClick={handleGenerate} className="flex-[2] py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/10">
                      <Sparkles size={14} /> Generate Plan
                    </button>
                  </div>
                </motion.div>
              )}

              {genStep === 3 && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="py-16 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                    <Loader2 size={28} className="text-green-500 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">Generating Your Plan...</p>
                    <p className="text-xs text-gray-500 mt-1 animate-pulse">Analyzing preferences and optimizing workout structure</p>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full bg-green-500"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {genStep === 4 && generatedPlan && (
                <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Plan Generated</span>
                      <h4 className="text-xl font-black text-white mt-1">{generatedPlan.goal === 'Weight Loss' ? 'Fat Burn Accelerator' : 'Hypertrophy Builder Pro'}</h4>
                    </div>
                    <CheckCircle2 size={24} className="text-green-500" />
                  </div>

                  {/* Why This Workout */}
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={14} className="text-blue-400" />
                      <span className="text-xs font-bold text-blue-400">Why This Workout?</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{generatedPlan.rationale}</p>
                  </div>

                  {/* Weekly Plan */}
                  <div className="space-y-2">
                    {generatedPlan.plan.map((day, i) => (
                      <div key={i} className="border border-white/5 rounded-2xl overflow-hidden">
                        <button onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 text-xs font-black">{day.day.substring(0, 2)}</div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-white">{day.focus}</p>
                              <p className="text-[10px] text-gray-500">{day.exercises.length} exercises</p>
                            </div>
                          </div>
                          <ChevronDown size={16} className={`text-gray-600 transition-transform ${expandedDay === i ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {expandedDay === i && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="border-t border-white/5">
                              <div className="p-4 space-y-2">
                                {day.exercises.map((ex, j) => (
                                  <div key={j} className="flex items-center justify-between p-3 bg-black rounded-xl">
                                    <div className="flex items-center gap-3">
                                      <span className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-500">{j + 1}</span>
                                      <span className="text-sm font-bold text-white">{ex.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono">{ex.sets}x{ex.reps} • {ex.rest}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* Progression */}
                  <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={14} className="text-green-400" />
                      <span className="text-xs font-bold text-green-400">Suggested Progression</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{generatedPlan.progression}</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => { setGenStep(0); setGeneratedPlan(null); setExpandedDay(null); }}
                      className="flex-1 py-3.5 border border-white/5 rounded-2xl text-gray-400 font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all">
                      Generate New
                    </button>
                    <button onClick={loadPlanToWorkout}
                      className="flex-[2] py-3.5 bg-green-500 text-black font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 hover:bg-green-400 transition-all">
                      <Dumbbell size={14} /> Load into Workout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Insights */}
          <section className="bg-gray-950 border border-white/5 rounded-[32px] p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Brain className="text-blue-500" size={20} /> Performance Insights</h3>
            <div className="space-y-3">
              {[
                { title: 'Chest & Arm Ratio', desc: 'Triceps volume is 14% below optimal. Add overhead extensions for bench press lockout power.', icon: <TrendingUp size={16} className="text-blue-400" />, color: 'border-blue-500/10 bg-blue-500/5' },
                { title: 'Recovery Window', desc: 'Heart rate recovery shows rapid deceleration. You\'re primed for high-intensity training today.', icon: <Zap size={16} className="text-green-400" />, color: 'border-green-500/10 bg-green-500/5' },
                { title: 'Consistency Milestone', desc: '3 weeks of stable routine structure. Muscle memory integration up 12% on compound lifts.', icon: <Award size={16} className="text-yellow-400" />, color: 'border-yellow-500/10 bg-yellow-500/5' },
              ].map((insight, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-2xl border ${insight.color} flex gap-3`}>
                  <div className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center shrink-0">{insight.icon}</div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-0.5">{insight.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{insight.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Chat */}
        <div>
          <section className="bg-gray-950 border border-white/5 rounded-[32px] h-[600px] flex flex-col p-6 relative overflow-hidden shadow-2xl sticky top-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center text-green-500 animate-pulse"><MessageSquare size={16} /></div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Coach Chat</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={9} className="text-green-500" /> Online</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col max-w-[88%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${msg.sender === 'user' ? 'bg-green-500 text-black rounded-tr-none font-bold' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'}`}>{msg.text}</div>
                  <span className="text-[8px] text-gray-600 mt-1 font-mono">{msg.time}</span>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 max-w-[85%] bg-white/5 border border-white/10 p-3.5 rounded-2xl rounded-tl-none mr-auto">
                  <Loader2 size={12} className="animate-spin text-green-500 shrink-0" />
                  <span className="text-[10px] text-gray-500 font-bold animate-pulse">Thinking...</span>
                </div>
              )}
            </div>
            <form onSubmit={handleChat} className="relative mt-auto shrink-0 pt-3 border-t border-white/5">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                placeholder="Ask your AI Coach..." className="w-full bg-black border border-white/5 rounded-2xl py-3.5 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-green-500 transition-all placeholder-gray-700" />
              <button type="submit" disabled={!chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-green-500 disabled:bg-gray-900 text-black disabled:text-gray-700 rounded-xl flex items-center justify-center transition-all">
                <Send size={13} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
