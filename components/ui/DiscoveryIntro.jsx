'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscoveryIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000), // Scanning
      setTimeout(() => setPhase(2), 3000), // Found
      setTimeout(() => onComplete(), 5000), // Enter
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Grain/Dust Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="relative text-center">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="p0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-cyan-500/50 tracking-widest text-xs uppercase"
            >
              Establishing connection to desert frequencies...
            </motion.div>
          )}
          
          {phase === 1 && (
            <motion.div
              key="p1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-4xl md:text-6xl font-black text-white italic tracking-tighter">
                UNEARTHING
              </div>
              <div className="h-px w-32 bg-cyan-500 mx-auto animate-pulse" />
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="p2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="text-5xl md:text-7xl font-black text-white">
                FOR MAGICAL <br /> USE ONLY
              </div>
              <div className="text-cyan-400 font-mono text-sm tracking-widest uppercase">
                Signal Found / Slab City CA
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10"
      />
    </motion.div>
  );
}

