import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCheck, MdArrowForward, MdArrowBack, MdFitnessCenter, MdTrendingDown, MdFlashOn } from 'react-icons/md';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const steps = [
    {
      id: 1,
      title: "Identify Your Primary Goal",
      subtitle: "Fitnova tailors your experience based on your selection.",
      options: [
        { title: 'Weight Loss', icon: <MdTrendingDown size={32} />, desc: 'Burn fat and improve lean muscle definition.' },
        { title: 'Muscle Gain', icon: <MdFitnessCenter size={32} />, desc: 'Build strength and increase overall body mass.' },
        { title: 'Peak Performance', icon: <MdFlashOn size={32} />, desc: 'Optimize stamina and athletic explosive power.' },
      ]
    },
    {
      id: 2,
      title: "Tell Us About Yourself",
      subtitle: "Precision tracking requires accurate baseline data.",
      inputs: [
        { label: 'Current Weight (kg)', placeholder: '75', type: 'number' },
        { label: 'Target Weight (kg)', placeholder: '82', type: 'number' },
        { label: 'Height (cm)', placeholder: '180', type: 'number' },
        { label: 'Age', placeholder: '24', type: 'number' },
      ]
    },
    {
      id: 3,
      title: "Workout Frequency",
      subtitle: "How many sessions per week are you aiming for?",
      options: [
        { title: '2-3 Days', icon: '⚡', desc: 'Maintain fitness and basic strength levels.' },
        { title: '4-5 Days', icon: '🔥🔥', desc: 'Serious transformation and growth focus.' },
        { title: '6-7 Days', icon: '🏆', desc: 'Elite athlete performance and discipline.' },
      ]
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-green-500 selection:text-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        layout
        className="w-full max-w-4xl bg-gray-950 border border-white/5 rounded-[48px] p-12 md:p-20 shadow-2xl relative z-10"
      >
        <div className="flex gap-4 mb-16">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-gray-900 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: step > i ? '100%' : '0%' }}
                className={`h-full ${step > i ? 'bg-green-500' : 'bg-gray-800'}`}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">{currentStep.title}</h1>
              <p className="text-gray-500 text-lg font-medium">{currentStep.subtitle}</p>
            </div>

            {currentStep.options && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentStep.options.map((opt, i) => (
                  <button key={i} className="group p-8 bg-black border border-gray-900 rounded-[32px] text-left hover:border-green-500 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MdCheck size={24} />
                    </div>
                    <div className="w-14 h-14 bg-gray-950 rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-green-500 group-hover:text-black transition-all mb-6">
                      {opt.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{opt.title}</h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {currentStep.inputs && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentStep.inputs.map((input, i) => (
                  <div key={i} className="space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">{input.label}</label>
                    <input 
                      type={input.type} 
                      placeholder={input.placeholder}
                      className="w-full bg-black border border-gray-900 rounded-2xl py-5 px-8 text-white focus:outline-none focus:border-green-500 transition-all font-bold text-xl"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-16 pt-10 border-t border-white/5 flex justify-between items-center">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className={`flex items-center gap-3 text-sm font-black uppercase tracking-widest transition-all ${step === 1 ? 'text-gray-800 pointer-events-none' : 'text-gray-500 hover:text-white'}`}
          >
            <MdArrowBack size={20} /> Back
          </button>
          
          {step < totalSteps ? (
            <button 
              onClick={() => setStep(s => Math.min(totalSteps, s + 1))}
              className="px-10 py-5 bg-white text-black text-sm font-black rounded-2xl hover:bg-green-500 transition-all shadow-xl shadow-white/5 flex items-center gap-3 uppercase tracking-widest"
            >
              Next Step <MdArrowForward size={20} />
            </button>
          ) : (
            <button 
              className="px-10 py-5 bg-green-500 text-black text-sm font-black rounded-2xl hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 flex items-center gap-3 uppercase tracking-widest"
            >
              Complete Setup <MdCheck size={20} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
