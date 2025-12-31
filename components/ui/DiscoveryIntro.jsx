'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = [
  "DESERT ART-TECH",
  "SLAB CITY SALVAGE",
  "FOR MAGICAL USE ONLY",
  "THE MANIFESTORIUM"
];

export default function DiscoveryIntro({ onComplete }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= WORDS.length) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setIndex(prev => prev + 1), 3000);
    return () => clearTimeout(timer);
  }, [index, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-center items-center justify-center overflow-hidden"
    >
      {/* Glitchy Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uWUicGvPK/giphy.gif')] mix-blend-screen" />
      
      <AnimatePresence mode="wait">
        {index < WORDS.length && (
          <motion.div
            key={WORDS[index]}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              filter: "blur(0px)",
              textShadow: ["0 0 0px #0ff", "0 0 20px #0ff", "0 0 0px #0ff"]
            }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 1.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-mono tracking-[0.3em] text-cyan-400 uppercase leading-relaxed">
              {WORDS[index]}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[1px] bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10"
      />
    </motion.div>
  );
}


