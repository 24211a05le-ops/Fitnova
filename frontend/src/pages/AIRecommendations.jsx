import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Brain, 
  Zap, 
  MessageSquare, 
  Send, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { motion, AnimatePresence } from 'framer-motion';

const AIRecommendations = () => {
  const { user } = useAuth();
  const { addExercise, addSet, updateSet, exercises } = useWorkout();
  const navigate = useNavigate();
  
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'coach',
      text: `Hello ${user?.name || 'Alex'}! Fitnova AI Coach here. I've synced with your physical profile and recent logs. Ready to program your routine or answer your bio-metric questions today?`,
      time: '12:00 PM'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [routingRoutine, setRoutingRoutine] = useState(null);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    const question = chatInput.toLowerCase();
    setChatInput('');
    setIsTyping(true);

    // AI Dynamic replies simulation
    setTimeout(() => {
      let replyText = "Interesting question. Consistently maintaining your training volume is essential. Let me analyze your physical DNA tracker to formulate a better strategy.";
      
      if (question.includes('recommend') || question.includes('routine') || question.includes('workout')) {
        replyText = `Based on your goal (${user?.fitnessGoal || 'Weight Loss'}), I highly recommend loading our "Hypertrophy Max" routine. It consists of 3 compound chest and arm movements configured to boost metabolic shock by 18%. Click 'Initialize Routine' below to load it directly into your Workout Sheet!`;
      } else if (question.includes('recovery') || question.includes('tired') || question.includes('sleep')) {
        replyText = "Your neural heart-rate recovery score is currently at 84%, indicating stable autonomic nervous system activity. You are fully primed for high-intensity power movements today. Make sure to space sets by 90 seconds.";
      } else if (question.includes('diet') || question.includes('calories') || question.includes('eat')) {
        replyText = `For a ${user?.fitnessGoal || 'Weight Loss'} profile, prioritize a 40/35/25 protein-carb-fat split. Check out our AI Diet Planner tab to generate a custom 4-meal plan with instant macros calculated!`;
      } else if (question.includes('hi') || question.includes('hello')) {
        replyText = `Hi ${user?.name || 'Alex'}! Ready to crush today's session? Ask me about recovery scores, diet splits, or routine optimization!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleInitializeRoutine = async (routineName, focus) => {
    setRoutingRoutine(routineName);
    
    // Simulate complex matrix programming delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Clear and build the exercises in the context
    if (routineName === 'Hypertrophy Max') {
      // 1. Bench Press
      addExercise('Hypertrophy Bench Press', 'Hypertrophy');
      // 2. Dumbbell Incline Flyes
      addExercise('Dumbbell Incline Flyes', 'Hypertrophy');
      // 3. Triceps Overhead Extension
      addExercise('Triceps Overhead Press', 'Hypertrophy');
    } else {
      // Neural Adaptation Strength Routine
      addExercise('Barbell Strength Squats', 'Strength');
      addExercise('Deadlift Compound Pulls', 'Strength');
      addExercise('Barbell Overhead Press', 'Strength');
    }

    setRoutingRoutine(null);
    // Redirect user to the Active WorkoutTracker
    navigate('/workouts');
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-10">
      
      {/* Page Header */}
      <header className="relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
            <Sparkles className="text-green-500 animate-pulse" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">AI Performance Engine Active</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
            INTELLIGENT<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">RECOMMENDATIONS</span>
          </h1>
          <p className="text-gray-400 mt-4 text-sm sm:text-base max-w-2xl font-medium">
            Fitnova's deep neural networks analyze your biomechanics, nutrition profiles, and recovery telemetry to output a targeted performance blueprint.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Neural Insights & Routine Generation */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Insights Panel */}
          <section className="bg-gray-950 border border-white/5 rounded-[40px] p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] -mr-48 -mt-48 group-hover:bg-blue-500/10 transition-all duration-700 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <Brain className="text-blue-500" size={24} />
                  Biomechanical Insights
                </h3>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Model: Fitnova-N3 v4.0</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { 
                    title: 'Chest & Arm Ratio Lag', 
                    desc: 'Your triceps workload is currently 14% below optimal chest volume. Integrate overhead extension movements to build explosive bench press locking power.', 
                    icon: <TrendingUp className="text-blue-400" size={18} />, 
                    color: 'border-blue-500/10 bg-blue-500/5' 
                  },
                  { 
                    title: 'Heart Rate Recovery Window', 
                    desc: 'Neural heart rate telemetry shows rapid deceleration. Your muscle energy levels are primed for maximum training volume shocks today.', 
                    icon: <Zap className="text-green-400" size={18} />, 
                    color: 'border-green-500/10 bg-green-500/5' 
                  },
                  { 
                    title: 'Biomechanical Consistency Milestone', 
                    desc: 'You have maintained stable routine structures for 3 weeks. Muscle memory integration is up 12% across compound primary lifts.', 
                    icon: <Award className="text-yellow-400" size={18} />, 
                    color: 'border-yellow-500/10 bg-yellow-500/5' 
                  },
                ].map((insight, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`p-5 rounded-2xl border ${insight.color} flex gap-4 hover:scale-[1.01] transition-all duration-300`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/35 flex items-center justify-center shrink-0">
                      {insight.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">{insight.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Routine Generation Panel */}
          <section className="bg-gray-950 border border-white/5 rounded-[40px] p-6 sm:p-8 relative overflow-hidden group">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2.5">
              <Zap className="text-yellow-500" size={24} />
              AI Intelligent Workout Generation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { 
                  name: 'Hypertrophy Max', 
                  duration: '55m', 
                  exercises: 3, 
                  focus: 'Muscle Density', 
                  desc: 'A heavy chest and arm workout aimed at building skeletal muscle thickness.',
                  color: 'hover:border-green-500/40'
                },
                { 
                  name: 'Neural Strength Adaptation', 
                  duration: '45m', 
                  exercises: 3, 
                  focus: 'Max Strength Peak', 
                  desc: 'Low reps, high weights compound lifts centered on nervous system peak outputs.',
                  color: 'hover:border-blue-500/40'
                },
              ].map((routine, i) => (
                <div 
                  key={i} 
                  className={`bg-black border border-white/5 rounded-[28px] p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between group/card relative ${routine.color}`}
                >
                  <div>
                    <div className="absolute top-4 right-4 text-white/5 group-hover/card:text-green-500/10 transition-colors">
                      <Sparkles size={48} />
                    </div>
                    <span className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1.5 block">
                      {routine.focus}
                    </span>
                    <h4 className="text-xl font-bold text-white mb-2">{routine.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
                      {routine.desc}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4 text-[10px] font-bold text-gray-600 border-t border-white/5 pt-4">
                      <span>⏱️ {routine.duration}</span>
                      <span>•</span>
                      <span>🏋️ {routine.exercises} Movements</span>
                    </div>
                    
                    <button 
                      onClick={() => handleInitializeRoutine(routine.name, routine.focus)}
                      disabled={routingRoutine !== null}
                      className="w-full py-3.5 bg-white hover:bg-green-500 text-black hover:text-black font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider disabled:opacity-50"
                    >
                      {routingRoutine === routine.name ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Coding Routine...
                        </>
                      ) : (
                        <>
                          Initialize Routine <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: AI Coach Chat Box */}
        <div className="space-y-8">
          <section className="bg-gray-950 border border-white/5 rounded-[40px] h-[580px] flex flex-col p-6 sm:p-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-green-500/[0.01] pointer-events-none"></div>
            
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center text-green-500 animate-pulse">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Coach Live Chat</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                  <ShieldCheck size={10} className="text-green-500" /> Biometrics Sync Active
                </p>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 my-2 pr-2 scrollbar-hide">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed font-medium ${
                    msg.sender === 'user'
                      ? 'bg-green-500 text-black rounded-tr-none font-bold'
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-gray-600 mt-1 font-mono">{msg.time}</span>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-2 max-w-[85%] bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none mr-auto">
                  <Loader2 size={12} className="animate-spin text-green-500 shrink-0" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">Analyzing stats...</span>
                </div>
              )}
            </div>

            {/* Chat Inputs */}
            <form onSubmit={handleSendChat} className="relative mt-auto shrink-0 pt-4 border-t border-white/5">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI Coach (e.g. recovery, diet details...)" 
                className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-5 pr-14 text-xs text-white focus:outline-none focus:border-green-500 focus:bg-gray-900/10 transition-all font-medium placeholder-gray-700"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-500 disabled:bg-gray-900 text-black disabled:text-gray-700 rounded-xl flex items-center justify-center transition-all"
              >
                <Send size={14} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
