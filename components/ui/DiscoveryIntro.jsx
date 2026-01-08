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

  const handleReplay = () => {
    setIndex(0);
    setSkip(false);
    setRunning(true);
  };

  useEffect(() => {
    if (!running || skip) return;

    const timeout = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [index, running, skip]);

  useEffect(() => {
    if (index >= WORDS.length) {
      const endFade = setTimeout(() => {
        setRunning(false);
        onComplete?.();
      }, 3200);
      return () => clearTimeout(endFade);
    }
  }, [index, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <motion.video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/overlays/manifest-orb.png"
        src="/overlays/lv_0_20260102183237.mp4"
        initial={{ scale: 1.05, filter: 'brightness(0.85)' }}
        animate={{ scale: 1, filter: 'brightness(1)' }}
        transition={{ duration: 4, ease: 'easeOut' }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-black/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(236,72,153,0.35),transparent_55%),radial-gradient(circle_at_70%_45%,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(249,115,22,0.25),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.9)_55%,rgba(0,0,0,1)_75%)]" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-black/90" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-black/90" />

      <AnimatePresence mode="wait">
        {index < WORDS.length && (
          <motion.div
            key={WORDS[index]}
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
            transition={{ duration: 2.6, ease: 'easeOut' }}
            className="relative z-10 flex w-full flex-col items-center justify-center px-6 text-center"
          >
            <div className="mb-6 h-px w-20 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <p className="mx-auto max-w-3xl font-serif text-2xl italic tracking-[0.2em] text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] md:text-3xl">
              {WORDS[index]}
            </p>
            <div className="mt-6 h-px w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_65%)] mix-blend-screen" />
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")"
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_55%)]" />

      <div className="relative z-10 flex w-full items-end justify-between px-6 pb-6 text-[0.55rem] text-white uppercase tracking-[0.5em]">
        <div className="flex items-center gap-6">
          <button className="text-white/60 hover:text-white transition" onClick={handleComplete}>
            Skip
          </button>
          <button className="text-white/40 hover:text-white/80 transition" onClick={handleReplay}>
            Replay
          </button>
        </div>
        <div className="flex gap-4">
          <span className="animate-pulse text-white/50">Active Signal: High</span>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0.4)_0%,rgba(0,0,0,0.8)_100%)] bg-[length:100%_4px]" />
    </motion.div>
  );
}
