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
  const [skip, setSkip] = useState(false);
  const [running, setRunning] = useState(true);

  const handleComplete = () => {
    setSkip(true);
    setRunning(false);
    onComplete?.();
  };

  useEffect(() => {
    if (!running || skip) return;

    const timeout = setTimeout(() => {
      setIndex(prev => prev + 1);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [index, running, skip]);

  useEffect(() => {
    if (index >= WORDS.length) {
      const endFade = setTimeout(() => {
        setRunning(false);
        onComplete?.();
      }, 2200);
      return () => clearTimeout(endFade);
    }
  }, [index, onComplete]);

  return (
    <motion.div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/overlays/manifest-orb.png"
        src="/overlays/lv_0_20260102183237.mp4"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/90" />

      <AnimatePresence mode="wait">
        {index < WORDS.length && (
          <motion.div
            key={WORDS[index]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.4 }}
            className="relative z-10 max-w-xl rounded-3xl border border-white/20 bg-gradient-to-br from-white/5 via-white/0 to-transparent p-8 text-center shadow-lg shadow-cyan-500/20"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-white/60 mb-4">Discovery / Observation / Manifest</p>
            <p className="text-3xl font-light text-white md:text-4xl">
              {WORDS[index]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_65%)] mix-blend-screen" />

      <div className="relative z-10 flex w-full items-end justify-between px-8 pb-10 text-xs text-white uppercase tracking-[0.35em]">
        <button className="text-white/80 hover:text-white" onClick={handleComplete}>
          Skip Observation
        </button>
        <div className="flex gap-4">
          <span className="animate-pulse">Active Signal: High</span>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0.4)_0%,rgba(0,0,0,0.8)_100%)] bg-[length:100%_4px]" />
    </motion.div>
  );
}


