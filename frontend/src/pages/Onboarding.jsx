import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { submitOnboarding } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { 
  Loader2, AlertCircle, Target, Dumbbell, Clock, 
  Home, Building2, TreePine, Zap, ChevronRight, 
  ChevronLeft, CheckCircle2, Shield, Flame, Trophy,
  Heart, AlertTriangle
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Fitness Goal', subtitle: 'What drives your training?' },
  { id: 2, title: 'Experience Level', subtitle: 'Where are you on your fitness journey?' },
  { id: 3, title: 'Workout Style', subtitle: 'How do you prefer to train?' },
  { id: 4, title: 'Weekly Schedule', subtitle: 'How many days can you commit?' },
  { id: 5, title: 'Equipment Access', subtitle: 'What do you have available?' },
  { id: 6, title: 'Limitations', subtitle: 'Anything we should know about?' }
];

const GOALS = [
  { value: 'Weight Loss', icon: <Flame size={28} />, label: 'Weight Loss', desc: 'Burn fat and improve body composition', color: 'orange' },
  { value: 'Muscle Gain', icon: <Dumbbell size={28} />, label: 'Muscle Gain', desc: 'Build strength and increase muscle mass', color: 'green' },
  { value: 'Endurance', icon: <Zap size={28} />, label: 'Endurance', desc: 'Boost stamina and cardiovascular fitness', color: 'blue' },
  { value: 'General Fitness', icon: <Heart size={28} />, label: 'General Fitness', desc: 'Stay active and maintain overall health', color: 'purple' }
];

const LEVELS = [
  { value: 'Beginner', icon: <Shield size={28} />, label: 'Beginner', desc: 'New to working out or returning after a long break', color: 'green' },
  { value: 'Intermediate', icon: <Target size={28} />, label: 'Intermediate', desc: '6+ months of consistent training experience', color: 'blue' },
  { value: 'Advanced', icon: <Trophy size={28} />, label: 'Advanced', desc: '2+ years of dedicated training with solid form', color: 'orange' }
];

const PREFERENCES = [
  { value: 'Gym', icon: <Building2 size={28} />, label: 'Gym Workouts', desc: 'Full access to machines, free weights, and cables' },
  { value: 'Home', icon: <Home size={28} />, label: 'Home Workouts', desc: 'Bodyweight and minimal equipment routines' },
  { value: 'Outdoor', icon: <TreePine size={28} />, label: 'Outdoor Training', desc: 'Running, calisthenics, and park workouts' },
  { value: 'Mixed', icon: <Zap size={28} />, label: 'Mixed / Hybrid', desc: 'Combination of gym, home, and outdoor sessions' }
];

const DAYS = [
  { value: 2, label: '2 Days', desc: 'Light commitment', emoji: '🌱' },
  { value: 3, label: '3 Days', desc: 'Balanced routine', emoji: '⚡' },
  { value: 4, label: '4 Days', desc: 'Solid consistency', emoji: '🔥' },
  { value: 5, label: '5 Days', desc: 'High dedication', emoji: '💪' },
  { value: 6, label: '6 Days', desc: 'Elite commitment', emoji: '🏆' }
];

const EQUIPMENT = [
  'Dumbbells', 'Barbell', 'Bench', 'Pull-up Bar', 'Resistance Bands',
  'Kettlebell', 'Cable Machine', 'Treadmill', 'None / Bodyweight Only'
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    fitnessGoal: '', experienceLevel: '', workoutPreference: '',
    availableDays: 3, equipmentAccess: [], injuries: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleEquipment = (item) => {
    setFormData(prev => {
      const current = prev.equipmentAccess;
      if (item === 'None / Bodyweight Only') {
        return { ...prev, equipmentAccess: current.includes(item) ? [] : [item] };
      }
      const filtered = current.filter(e => e !== 'None / Bodyweight Only');
      return {
        ...prev,
        equipmentAccess: filtered.includes(item)
          ? filtered.filter(e => e !== item)
          : [...filtered, item]
      };
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.fitnessGoal;
      case 2: return !!formData.experienceLevel;
      case 3: return !!formData.workoutPreference;
      case 4: return !!formData.availableDays;
      case 5: return formData.equipmentAccess.length > 0;
      case 6: return true;
      default: return false;
    }
  };

  const handleComplete = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const payload = {
        fitnessGoal: formData.fitnessGoal,
        experienceLevel: formData.experienceLevel,
        workoutPreference: formData.workoutPreference,
        availableDays: formData.availableDays,
        equipmentAccess: formData.equipmentAccess.join(','),
        injuries: formData.injuries || 'None'
      };
      const updatedUser = await submitOnboarding(payload);
      setUser(updatedUser);
      localStorage.setItem('fitnova_user', JSON.stringify(updatedUser));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save onboarding data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => { if (canProceed() && step < 6) setStep(s => s + 1); };
  const goBack = () => { if (step > 1) setStep(s => s - 1); };

  const colorMap = { orange: 'text-orange-500', green: 'text-green-500', blue: 'text-blue-500', purple: 'text-purple-500' };
  const bgMap = { orange: 'bg-orange-500', green: 'bg-green-500', blue: 'bg-blue-500', purple: 'bg-purple-500' };

  const renderOptionCards = (options, field, showColor = false) => (
    <div className={`grid gap-4 ${options.length === 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
      {options.map((opt) => {
        const selected = formData[field] === opt.value;
        return (
          <button key={opt.value} onClick={() => handleSelect(field, opt.value)}
            className={`group relative p-6 rounded-3xl border-2 text-left transition-all duration-300 ${
              selected
                ? 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/10'
                : 'bg-gray-900/50 border-gray-800 hover:border-gray-600 hover:bg-gray-900'
            }`}>
            {selected && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 size={20} className="text-green-500" />
              </div>
            )}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${
              selected ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400 group-hover:text-white'
            }`}>
              {opt.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{opt.label}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 selection:bg-green-500 selection:text-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-green-500/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full"></div>
      </div>

      <motion.div layout className="w-full max-w-3xl bg-gray-950 border border-white/5 rounded-[40px] p-8 sm:p-12 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-black font-black text-xl mx-auto mb-4 shadow-xl shadow-green-500/20">FN</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
            {STEPS[step - 1].title}
          </h1>
          <p className="text-gray-500 text-sm">{STEPS[step - 1].subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-gray-900 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: step > i ? '100%' : step === i + 1 ? '50%' : '0%' }}
                transition={{ duration: 0.4 }}
                className={`h-full rounded-full ${step > i ? 'bg-green-500' : step === i + 1 ? 'bg-green-500/50' : 'bg-gray-800'}`}
              />
            </div>
          ))}
        </div>

        <div className="text-right mb-4">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Step {step} of {STEPS.length}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            {step === 1 && renderOptionCards(GOALS, 'fitnessGoal', true)}

            {step === 2 && renderOptionCards(LEVELS, 'experienceLevel')}

            {step === 3 && renderOptionCards(PREFERENCES, 'workoutPreference')}

            {step === 4 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {DAYS.map(d => {
                  const selected = formData.availableDays === d.value;
                  return (
                    <button key={d.value} onClick={() => handleSelect('availableDays', d.value)}
                      className={`p-5 rounded-2xl border-2 text-center transition-all ${
                        selected ? 'bg-green-500/10 border-green-500' : 'bg-gray-900/50 border-gray-800 hover:border-gray-600'
                      }`}>
                      <span className="text-2xl block mb-2">{d.emoji}</span>
                      <span className="text-lg font-black text-white block">{d.value}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{d.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 5 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {EQUIPMENT.map(item => {
                  const selected = formData.equipmentAccess.includes(item);
                  return (
                    <button key={item} onClick={() => toggleEquipment(item)}
                      className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                        selected ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-600'
                      }`}>
                      {selected && <CheckCircle2 size={14} className="inline mr-2" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div className="p-5 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    If you have any injuries, medical conditions, or physical limitations, please let us know so we can tailor your workouts safely. This is optional.
                  </p>
                </div>
                <textarea
                  value={formData.injuries}
                  onChange={(e) => setFormData(prev => ({ ...prev, injuries: e.target.value }))}
                  placeholder="e.g., Lower back pain, knee injury, shoulder impingement... or leave blank if none"
                  rows={4}
                  className="w-full bg-black border border-gray-800 rounded-2xl p-5 text-white text-sm focus:outline-none focus:border-green-500 transition-all resize-none placeholder-gray-700"
                />
                <div className="p-5 bg-green-500/5 border border-green-500/10 rounded-2xl">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    ✨ <strong className="text-green-400">You're all set!</strong> Fitnova will use your preferences to personalize workout recommendations, track your progress, and build AI-powered training plans tailored specifically for you.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center gap-4">
          <button onClick={goBack}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
              step === 1 ? 'text-gray-800 pointer-events-none' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'
            }`}>
            <ChevronLeft size={18} /> Back
          </button>

          {step < 6 ? (
            <button onClick={goNext} disabled={!canProceed()}
              className={`flex items-center gap-2 px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-xl ${
                canProceed()
                  ? 'bg-white text-black hover:bg-green-500 shadow-white/5'
                  : 'bg-gray-900 text-gray-600 cursor-not-allowed shadow-none'
              }`}>
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleComplete} disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-4 bg-green-500 text-black rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 disabled:opacity-50">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={18} /> Complete Setup</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
