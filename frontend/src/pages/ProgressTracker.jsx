import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  TrendingUp, 
  Camera, 
  Ruler, 
  BrainCircuit, 
  Activity, 
  Loader2, 
  AlertCircle, 
  ChevronRight, 
  Sparkles,
  Trophy
} from 'lucide-react';
import { usePrediction } from '../context/PredictionContext';
import { useAuth } from '../context/AuthContext';
import ProgressChart from '../components/ProgressChart';
import { motion, AnimatePresence } from 'framer-motion';

// Yup validation schema for ML Progress Predictor Form
const progressPredictorSchema = yup.object().shape({
  weight: yup
    .number()
    .typeError('Weight must be a positive number')
    .required('Current Weight is required')
    .positive('Weight must be positive')
    .min(30, 'Weight seems too small')
    .max(300, 'Weight seems too large'),
  bodyFat: yup
    .number()
    .typeError('Body Fat must be a valid number')
    .positive('Body Fat must be positive')
    .min(3, 'Min body fat is 3%')
    .max(60, 'Max body fat is 60%')
    .required('Current Body Fat % is required'),
  fitnessGoal: yup
    .string()
    .required('Fitness goal is required'),
  daysPerWeek: yup
    .number()
    .typeError('Workout frequency must be a valid number')
    .required('Workout frequency is required')
    .integer('Must be a whole number')
    .min(1, 'Min 1 day per week')
    .max(7, 'Max 7 days per week'),
});

const ProgressTracker = () => {
  const { user } = useAuth();
  const { 
    predictions, 
    progressLogs, 
    loading, 
    predictBodyTransformation 
  } = usePrediction();
  
  const [showPredictor, setShowPredictor] = useState(false);

  // Form for predicting progress
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(progressPredictorSchema),
    mode: 'onChange',
    defaultValues: {
      weight: user?.weight || 78,
      bodyFat: 16.5,
      fitnessGoal: user?.fitnessGoal || 'Weight Loss',
      daysPerWeek: 4,
    }
  });

  // Calculate dynamic BMI
  const weight = progressLogs[progressLogs.length - 1]?.weight || user?.weight || 78.4;
  const height = user?.height || 180;
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);

  const onPredictSubmit = async (data) => {
    try {
      console.log('ProgressTracker: Calling ML Prediction API with stats:', data);
      await predictBodyTransformation({
        ...data,
        height: height,
        age: user?.age || 24,
        gender: user?.gender || 'Male',
      });
      setShowPredictor(false); // Hide form and show charts
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Transformation Hub</h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Document your physical performance using artificial intelligence and physical telemetry.
          </p>
        </div>
        <button 
          onClick={() => setShowPredictor(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-xl shadow-purple-500/20 flex items-center gap-2 text-sm uppercase tracking-wider shrink-0"
        >
          <BrainCircuit size={18} />
          Predict Progress (ML)
        </button>
      </header>

      {/* MODAL / FORM SECTION: ML Progress Forecasting Form */}
      <AnimatePresence>
        {showPredictor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-gray-950 border border-white/5 rounded-[40px] p-8 sm:p-10 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowPredictor(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-all"
              >
                ✕
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Machine Learning Predictor</h3>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">Neural Progress Forecaster</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onPredictSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Current Weight (KG)</label>
                    <input 
                      type="number"
                      step="0.1"
                      {...register('weight')}
                      className={`w-full bg-black border ${errors.weight ? 'border-red-500/50' : 'border-white/5'} rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono`}
                    />
                    {errors.weight && (
                      <p className="text-red-500 text-[9px] font-semibold flex items-center gap-1"><AlertCircle size={10} /> {errors.weight.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Body Fat (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      {...register('bodyFat')}
                      className={`w-full bg-black border ${errors.bodyFat ? 'border-red-500/50' : 'border-white/5'} rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono`}
                    />
                    {errors.bodyFat && (
                      <p className="text-red-500 text-[9px] font-semibold flex items-center gap-1"><AlertCircle size={10} /> {errors.bodyFat.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Active Target Objective</label>
                    <select 
                      {...register('fitnessGoal')}
                      className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all font-bold"
                    >
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Muscle Gain">Muscle Gain</option>
                      <option value="Cardio Conditioning">Lean Conditioning</option>
                      <option value="Endurance">Stamina Endurance</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Workouts / Week</label>
                    <input 
                      type="number"
                      {...register('daysPerWeek')}
                      className={`w-full bg-black border ${errors.daysPerWeek ? 'border-red-500/50' : 'border-white/5'} rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono text-center`}
                    />
                    {errors.daysPerWeek && (
                      <p className="text-red-500 text-[9px] font-semibold flex items-center gap-1"><AlertCircle size={10} /> {errors.daysPerWeek.message}</p>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!isValid}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mt-4 ${
                    !isValid 
                      ? 'bg-gray-900 text-gray-600 cursor-not-allowed shadow-none' 
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                  }`}
                >
                  Predict Progress Path
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skeletons/Loaders during prediction processing */}
      {loading && (
        <div className="bg-gray-950 border border-white/5 rounded-[40px] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 size={38} className="animate-spin text-purple-500 mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Executing ML Forecasting Model</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Processing biomechanical telemetry and generating 12-week body weight and skeletal muscle hypertrophy trajectory curves...
          </p>
        </div>
      )}

      {/* Dynamic Forecast Grid */}
      {!loading && predictions && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-950 border border-purple-500/20 rounded-[40px] p-8 sm:p-10 relative overflow-hidden group shadow-2xl shadow-purple-500/5"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <BrainCircuit size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">AI Neural Progression Forecast</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Biomechanical Simulation Matrix</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-purple-500/10 text-purple-400 text-xs font-black uppercase tracking-widest rounded-xl border border-purple-500/20 flex items-center gap-1.5">
              <Sparkles size={12} className="animate-spin" />
              Interval: {predictions.estimatedTransformationTime}
            </div>
          </div>

          {/* Forecast Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Weight Reduction Path (KG)</h4>
                <p className="text-[10px] text-gray-600 font-bold mt-0.5">Estimated weight trajectory across {predictions.estimatedTransformationTime}</p>
              </div>
              <div className="h-[250px] bg-black border border-white/5 rounded-[24px] p-4">
                <ProgressChart 
                  data={predictions.weightCurve} 
                  labels={predictions.weeks}
                  color="rgb(168, 85, 247)" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Skeletal Muscle Progression (KG)</h4>
                <p className="text-[10px] text-gray-600 font-bold mt-0.5">Estimated lean hypertrophy across {predictions.estimatedTransformationTime}</p>
              </div>
              <div className="h-[250px] bg-black border border-white/5 rounded-[24px] p-4">
                <ProgressChart 
                  data={predictions.muscleCurve} 
                  labels={predictions.weeks}
                  color="rgb(59, 130, 246)" 
                />
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-purple-300 uppercase tracking-wider">AI Coach Prescription</p>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed font-medium">{predictions.recommendationSummary}</p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Top Cards: Vital Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Weight', value: `${weight}`, unit: 'kg', trend: '-1.0', color: 'text-green-500' },
          { label: 'Body Fat', value: `${progressLogs[progressLogs.length - 1]?.bodyFat || 16.2}`, unit: '%', trend: '-0.6', color: 'text-green-500' },
          { label: 'Muscle Mass', value: `${progressLogs[progressLogs.length - 1]?.muscleMass || 34.8}`, unit: 'kg', trend: '+0.8', color: 'text-blue-500' },
          { label: 'Body Mass Index (BMI)', value: `${bmi}`, unit: '', trend: '0.0', color: 'text-gray-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-950 border border-white/5 rounded-[32px] p-8 group hover:border-white/10 transition-all shadow-xl">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-mono">{stat.value}</span>
              <span className="text-xs font-bold text-gray-600">{stat.unit}</span>
            </div>
            <div className={`mt-4 text-xs font-bold flex items-center gap-1 ${stat.color}`}>
              <TrendingUp size={12} className={stat.trend.startsWith('-') ? 'rotate-180' : ''} />
              {stat.trend} from baseline
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Visual progress grid */}
        <div className="lg:col-span-2 bg-gray-950 border border-white/5 rounded-[40px] p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none" />
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Camera className="text-purple-500" size={20} />
              Visual Journey Logs
            </h3>
            <button className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest">View Gallery</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {[
              { date: 'May 16, 2026', label: 'Current Log' },
              { date: 'Apr 16, 2026', label: '1 Month Ago' },
              { date: 'Mar 16, 2026', label: '2 Months Ago' },
            ].map((photo, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-gray-900 rounded-[24px] border border-white/5 flex flex-col items-center justify-center group cursor-pointer overflow-hidden relative shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Compare metrics</p>
                  </div>
                  <Camera size={28} className="text-gray-800 group-hover:text-purple-400 transition-all duration-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{photo.label}</p>
                  <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{photo.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column measurements & rewards */}
        <div className="space-y-8">
          <div className="bg-gray-950 border border-white/5 rounded-[40px] p-8 sm:p-10">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2.5">
              <Ruler className="text-blue-500" size={20} />
              Key Measurements
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Chest Circumference', value: `${progressLogs[progressLogs.length - 1]?.chest || 104}`, unit: 'cm' },
                { label: 'Waist Circumference', value: `${progressLogs[progressLogs.length - 1]?.waist || 82}`, unit: 'cm' },
                { label: 'Biceps Peak', value: `${progressLogs[progressLogs.length - 1]?.biceps || 41}`, unit: 'cm' },
                { label: 'Thigh Circumference', value: `${progressLogs[progressLogs.length - 1]?.thighs || 62}`, unit: 'cm' },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer border-b border-white/[0.02] pb-4 last:border-0 last:pb-0">
                  <span className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors">{m.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black text-white">{m.value} {m.unit}</span>
                    <ChevronRight size={14} className="text-gray-800 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest">
              Log Measurements
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-[40px] p-8 sm:p-10 text-white shadow-2xl shadow-purple-500/10">
            <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center mb-4 text-yellow-400">
              <Trophy size={20} fill="currentColor" />
            </div>
            <p className="text-[9px] font-black text-purple-200 uppercase tracking-[0.2em] mb-2">Milestone Achieved</p>
            <h4 className="text-xl font-black leading-tight">12 Weeks Consistency</h4>
            <p className="text-xs font-medium text-purple-100/80 mt-4 leading-relaxed">
              You've recorded metrics for 12 consecutive weeks without deviation. Your bio-rhythms look incredibly stable.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-purple-700 bg-purple-900 flex items-center justify-center text-xs">🏆</div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-200">+3 consistency awards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
