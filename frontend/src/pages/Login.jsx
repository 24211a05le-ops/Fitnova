import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Validation Schema using Yup
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange', // Validate on keystroke for sleek real-time UX
  });

  const onSubmit = async (data) => {
    setApiError(null);
    setSuccess(false);
    try {
      console.log('Login: Form submitted, calling login auth context:', data.email);
      await login(data.email, data.password);
      setSuccess(true);
      
      // Navigate to dashboard after brief delay for smooth UI feedback
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      console.error('Login Error:', err.message);
      setApiError(err.message || 'Invalid email or password. Try admin@fitnova.com');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-green-500 selection:text-black">
      {/* Background radial glowing effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg bg-gray-950 border border-white/5 rounded-[40px] p-10 sm:p-12 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl mx-auto mb-6 shadow-xl shadow-green-500/20">
            FN
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-500 font-medium tracking-tight text-sm sm:text-base">
            Enter your credentials to access your dashboard
          </p>
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
            <span>Success! Redirecting to your fitness hub...</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email input field */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-500' : 'text-gray-600 group-focus-within:text-green-500'}`} size={18} />
              <input
                type="email"
                {...register('email')}
                className={`w-full bg-black border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:bg-gray-900/30 transition-all font-medium placeholder-gray-700 text-sm`}
                placeholder="alex@fitnova.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs font-semibold ml-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password input field */}
          <div className="space-y-2">
            <div className="flex justify-between items-end ml-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Password
              </label>
              <a href="#" className="text-xs font-bold text-green-500 hover:text-green-400 transition-colors">
                Forgot?
              </a>
            </div>
            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-500' : 'text-gray-600 group-focus-within:text-green-500'}`} size={18} />
              <input
                type="password"
                {...register('password')}
                className={`w-full bg-black border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:bg-gray-900/30 transition-all font-medium placeholder-gray-800 text-sm`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs font-semibold ml-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.password.message}
              </p>
            )}
          </div>

          {/* Sign In Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`w-full font-black py-4.5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest ${
                !isValid 
                  ? 'bg-gray-900 text-gray-600 cursor-not-allowed shadow-none' 
                  : 'bg-green-500 hover:bg-green-400 text-black shadow-green-500/10'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm font-medium">
            New to Fitnova?{' '}
            <Link to="/register" className="text-green-500 font-bold hover:text-green-400 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
