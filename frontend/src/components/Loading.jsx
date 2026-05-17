import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
      <div className="relative w-24 h-24">
        {/* Pulsing rings */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 border-2 border-green-500 rounded-2xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 border-2 border-green-500/50 rounded-xl"
        />
        
        {/* Center Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-black font-black text-xl"
          >
            FT
          </motion.div>
        </div>
      </div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-gray-500 font-bold tracking-[0.3em] uppercase text-[10px]"
      >
        Initializing Performance Engine
      </motion.p>
    </div>
  );
};

export default Loading;
