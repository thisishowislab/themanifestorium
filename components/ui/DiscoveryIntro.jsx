'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = [
  "Somewhere in the desert….",
  "Beyond the edge of everything known…",
  "a quiet kind of magic remains…",
  "The Manifestorium. where forgotten things find their value."
];

export default function DiscoveryIntro({ onComplete }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= WORDS.length) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setIndex(prev => prev + 1), 3500);
    return () => clearTimeout(timer);
  }, [index, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center overflow-hidden font-serif"
    >
      {/* Dynamic UV/Neon Gradient Backdrop */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.2),rgba(168,85,247,0.1),transparent_70%)]" />
      
      {/* Glitchy Dust/Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-screen bg-[url('https://media.giphy.com/media/oEI9uWUicGvPK/giphy.gif')]" />
      
      <AnimatePresence mode="wait">
        {index < WORDS.length && (
          <motion.div
            key={WORDS[index]}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              filter: "blur(0px)",
              color: ["#fff", "#99f", "#fff"]
            }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="text-center px-6 max-w-4xl"
          >
            <h1 className="text-2xl md:text-4xl italic tracking-wide leading-relaxed font-light text-white/90">
              {WORDS[index]}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replay/Skip Controls */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono">
        <button 
          onClick={onComplete}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          [ Skip Observation ]
        </button>
        <div className="flex gap-4">
          <span className="animate-pulse">Active Signal: High</span>
        </div>
      </div>

      {/* Subtle CRT Scanline */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
    </motion.div>
  );
}



