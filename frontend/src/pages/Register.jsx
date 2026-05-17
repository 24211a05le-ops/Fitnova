import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  AlertCircle, 
  Activity 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Step-by-Step validation schema
const registrationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Full Name is required')
    .min(3, 'Name must be at least 3 characters long'),
  email: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  height: yup
    .number()
    .typeError('Height must be a valid number')
    .required('Height is required')
    .positive('Height must be positive')
    .min(100, 'Height seems too small')
    .max(250, 'Height seems too large'),
  weight: yup
    .number()
    .typeError('Weight must be a valid number')
    .required('Weight is required')
    .positive('Weight must be positive')
    .min(30, 'Weight seems too small')
    .max(300, 'Weight seems too large'),
  age: yup
    .number()
    .typeError('Age must be a valid number')
    .required('Age is required')
    .integer('Age must be a whole number')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Age seems invalid'),
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['Male', 'Female', 'Other'], 'Please select a gender option'),
  fitnessGoal: yup
    .string()
    .required('Fitness goal is required')
    .oneOf(['Weight Loss', 'Muscle Gain', 'Cardio Conditioning', 'Endurance'], 'Please select a fitness goal'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registrationSchema),
    mode: 'onChange',
  });

  // Handle continuing to next step by validating only active fields
  const handleContinue = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['name', 'email'];
    } else if (step === 2) {
      fieldsToValidate = ['height', 'weight', 'age', 'gender', 'fitnessGoal'];
    }

    // Trigger validation for active step fields
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const onSubmit = async (data) => {
    setApiError(null);
    setSuccess(false);
    try {
      console.log('Register: Creating account for:', data.email);
      await signup(data);
      setSuccess(true);
      
      // Navigate to onboarding screen after short success delay
      setTimeout(() => {
        navigate('/onboarding');
      }, 1000);
    } catch (err) {
      console.error('Registration Error:', err.message);
      setApiError(err.message || 'Registration failed. Please check your network and details.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-green-500 selection:text-black">
      {/* Background glow styling */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        layout
        className="w-full max-w-xl bg-gray-950 border border-white/5 rounded-[40px] p-10 sm:p-12 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl mx-auto mb-6 shadow-xl shadow-green-500/20">
            FN
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Initialize Profile</h1>
          <p className="text-gray-500 font-medium text-sm">Step {step} of {totalSteps}</p>
        </div>

        {/* Small Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step > i ? 'w-8 bg-green-500' : 'w-2.5 bg-gray-800'}`} />
          ))}
        </div>

        {/* Global Error Banner */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{apiError}</span>
          </motion.div>
        )}

        {/* Success Banner */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400 text-sm font-medium"
          >
            <Loader2 size={18} className="animate-spin shrink-0" />
            <span>Account created! Starting onboarding session...</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <div className="relative group">
                      <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.name ? 'text-red-500' : 'text-gray-600 group-focus-within:text-green-500'}`} size={18} />
                      <input 
                        type="text" 
                        {...formRegister('name')}
                        className={`w-full bg-black border ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-2xl py-4 pl-12 text-white focus:outline-none focus:bg-gray-900/30 transition-all font-medium placeholder-gray-700 text-sm`} 
                        placeholder="Anil Kumar" 
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs font-semibold ml-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-500' : 'text-gray-600 group-focus-within:text-green-500'}`} size={18} />
                      <input 
                        type="email" 
                        {...formRegister('email')}
                        className={`w-full bg-black border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-2xl py-4 pl-12 text-white focus:outline-none focus:bg-gray-900/30 transition-all font-medium placeholder-gray-700 text-sm`} 
                        placeholder="anil@example.com" 
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs font-semibold ml-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.email.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* STEP 2: Vital Physical Stats & Goals */}
              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Height (cm)</label>
                      <input 
                        type="number" 
                        {...formRegister('height')}
                        className={`w-full bg-black border ${errors.height ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-2xl py-4 px-5 text-white focus:outline-none focus:bg-gray-900/30 transition-all font-mono placeholder-gray-800 text-sm`} 
                        placeholder="180" 
                      />
                      {errors.height && (
                        <p className="text-red-500 text-[10px] font-semibold ml-1 flex items-center gap-1 leading-tight">
                          <AlertCircle size={10} /> {errors.height.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Weight (kg)</label>
                      <input 
                        type="number" 
                        {...formRegister('weight')}
                        className={`w-full bg-black border ${errors.weight ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-2xl py-4 px-5 text-white focus:outline-none focus:bg-gray-900/30 transition-all font-mono placeholder-gray-800 text-sm`} 
                        placeholder="75" 
                      />
                      {errors.weight && (
                        <p className="text-red-500 text-[10px] font-semibold ml-1 flex items-center gap-1 leading-tight">
                          <AlertCircle size={10} /> {errors.weight.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Age</label>
                      <input 
                        type="number" 
                        {...formRegister('age')}
                        className={`w-full bg-black border ${errors.age ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-2xl py-4 px-5 text-white focus:outline-none focus:bg-gray-900/30 transition-all font-mono placeholder-gray-800 text-sm`} 
                        placeholder="24" 
                      />
                      {errors.age && (
                        <p className="text-red-500 text-[10px] font-semibold ml-1 flex items-center gap-1 leading-tight">
                          <AlertCircle size={10} /> {errors.age.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Gender</label>
                      <select 
                        {...formRegister('gender')}
                        className={`w-full bg-black border ${errors.gender ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-2xl py-4 px-5 text-white focus:outline-none focus:bg-gray-900/30 transition-all font-medium text-sm appearance-none`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="text-red-500 text-[10px] font-semibold ml-1 flex items-center gap-1 leading-tight">
                          <AlertCircle size={10} /> {errors.gender.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Fitness Goal</label>
                    <div className="relative group">
                      <Activity className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.fitnessGoal ? 'text-red-500' : 'text-gray-600 group-focus-within:text-green-500'}`} size={18} />
                      <select 
                        {...formRegister('fitnessGoal')}
                        className={`w-full bg-black border ${errors.fitnessGoal ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:bg-gray-900/30 transition-all font-medium text-sm appearance-none`}
                      >
                        <option value="">Select Target Objective</option>
                        <option value="Weight Loss">Weight Loss (Deficit Recomposition)</option>
                        <option value="Muscle Gain">Muscle Gain (Hypertrophy Strength)</option>
                        <option value="Cardio Conditioning">Cardio Conditioning (Aerobic Fit)</option>
                        <option value="Endurance">Athletic Endurance (Stamina)</option>
                      </select>
                    </div>
                    {errors.fitnessGoal && (
                      <p className="text-red-500 text-xs font-semibold ml-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.fitnessGoal.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* STEP 3: Account Credentials */}
              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Password</label>
                    <div className="relative group">
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-500' : 'text-gray-600 group-focus-within:text-green-500'}`} size={18} />
                      <input 
                        type="password" 
                        {...formRegister('password')}
                        className={`w-full bg-black border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-2xl py-4 pl-12 text-white focus:outline-none focus:bg-gray-900/30 transition-all font-medium placeholder-gray-800 text-sm`} 
                        placeholder="••••••••" 
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs font-semibold ml-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="p-5 bg-green-500/5 border border-green-500/10 rounded-2xl">
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                      By completing registration, you authorize Fitnova to apply machine learning algorithms to map and securely track your personal physical stats.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-10 flex justify-between gap-4">
            {step > 1 && (
              <button 
                type="button"
                onClick={() => setStep((s) => s - 1)} 
                className="flex-1 py-4 border border-white/5 rounded-2xl text-gray-500 font-bold text-sm hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            
            {step < totalSteps ? (
              <button 
                type="button"
                onClick={handleContinue} 
                className="flex-[2] py-4 bg-white text-black font-black rounded-2xl hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5 text-sm uppercase tracking-wider"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-green-500 text-black font-black rounded-2xl hover:bg-green-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-500/25 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Finalizing...
                  </>
                ) : (
                  <>
                    Complete Account <Check size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500 font-medium text-sm">
            Already a member?{' '}
            <Link to="/login" className="text-green-500 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
