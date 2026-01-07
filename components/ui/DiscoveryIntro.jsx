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

  useEffect(() => {
    if (!running || skip) return;

    const timeout = setTimeout(() => {
      setIndex(prev => prev + 1);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [index, running, skip]);

  useEffect(() => {
    if (index >= WORDS.length) {
      setTimeout(() => {
        setRunning(false);
        onComplete?.();
      }, 1200);
    }
  }, [index, onComplete]);

  return (
    <motion.div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/overlays/manifest-orb.jpg"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      >
        <source src="/overlays/lv_0_20260102183237.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <AnimatePresence mode="wait">
        {index < WORDS.length && (
          <motion.div
            key={WORDS[index]}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 1.8 }}
            className=" rounded-3xl border border-white/20 bg-gradient-to-br from-white/5 via-white/0 to-transparent p-8 text-center max-w-xl"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-white/60 mb-4">Discovery / Observation / Manifest</p>
            <p className="text-3xl font-light text-white md:text-4xl">
              {WORDS[index]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto absolute inset-x-6 bottom-10 flex items-center justify-between text-white/80 text-xs tracking-[0.3em]">
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: running ? 1 : 0 }}
        transition={{ duration: 2.2 }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_65%)] mix-blend-screen"
      />

      {/* Subtle CRT Scanline */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
    </motion.div>
  );
}

