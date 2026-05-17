import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdArrowForward, MdCheckCircle, MdSpeed, MdAutoGraph, MdInsights } from 'react-icons/md';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 px-10 h-20 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-black font-black text-lg">FN</div>
          <span className="text-xl font-bold tracking-tighter">Fitnova</span>
        </div>
        <div className="flex items-center gap-8">
          <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">Sign In</Link>
          <Link to="/register" className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-all shadow-lg shadow-white/5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">New: AI-Powered Insights</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            YOUR FITNESS<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-blue-600">REDEFINED.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            The professional-grade platform to track workouts, monitor nutrition, and visualize your transformation with precision analytics.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register" className="px-10 py-5 bg-green-500 text-black text-lg font-black rounded-2xl hover:bg-green-400 transition-all hover:scale-105 shadow-2xl shadow-green-500/20 flex items-center gap-3">
              Start Your Journey <MdArrowForward />
            </Link>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-black bg-gray-800"></div>
              ))}
              <div className="pl-6 text-sm font-bold text-gray-400">
                Joined by <span className="text-white">12,000+</span> athletes
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: <MdSpeed size={32} />, title: "Hyper-Tracking", desc: "Log every set, rep, and weight with zero friction. Built for serious athletes." },
              { icon: <MdAutoGraph size={32} />, title: "Visual Progress", desc: "Beautifully rendered charts and transformation metrics to keep you motivated." },
              { icon: <MdInsights size={32} />, title: "Precision Diet", desc: "Manage macros and meal plans with our integrated nutrition engine." },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-10 bg-gray-900/50 border border-white/5 rounded-[40px] hover:border-green-500/50 hover:bg-gray-900 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-black transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-10 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-gradient-to-br from-green-500 to-emerald-800 rounded-[60px] p-20 text-center relative"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <h2 className="text-5xl md:text-6xl font-black text-black tracking-tighter mb-8 relative z-10">
            READY TO BREAK<br />YOUR LIMITS?
          </h2>
          <Link to="/register" className="inline-flex items-center gap-4 px-12 py-6 bg-black text-white text-xl font-black rounded-3xl hover:bg-gray-900 transition-all relative z-10 group shadow-2xl">
            GET LIFETIME ACCESS <MdArrowForward className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-white/5 text-center px-10">
        <div className="flex justify-center gap-10 mb-8 text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p className="text-gray-600 text-sm font-medium">© 2026 Fitnova Labs. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;