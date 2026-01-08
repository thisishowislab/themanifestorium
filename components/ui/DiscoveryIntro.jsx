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

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-black/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.9)_55%,rgba(0,0,0,1)_75%)]" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-black/90" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-black/90" />

      <AnimatePresence mode="wait">
        {index < WORDS.length && (
          <motion.div
            key={WORDS[index]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.4 }}
            className="relative z-10 max-w-xl rounded-3xl border border-white/20 bg-gradient-to-br from-white/5 via-white/0 to-transparent p-8 text-center shadow-lg shadow-cyan-500/20"
            transition={{ duration: 2, ease: 'easeOut' }}
            className="relative z-10 flex w-full flex-col items-center justify-center px-6 text-center"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-white/60 mb-4">Discovery / Observation / Manifest</p>
            <p className="text-3xl font-light text-white md:text-4xl">
              {WORDS[index]}
            <p className="mx-auto font-serif text-[0.65rem] tracking-[0.6em] uppercase text-white/60 mb-6">
              Discovery / Observation / Manifest
            </p>
            <div className="relative mx-auto max-w-4xl px-6">
              <span className="absolute inset-0 translate-x-1 -translate-y-1 text-4xl md:text-6xl lg:text-7xl font-semibold text-cyan-400/20 blur-sm">
                {WORDS[index]}
              </span>
              <span className="absolute inset-0 -translate-x-1 translate-y-1 text-4xl md:text-6xl lg:text-7xl font-semibold text-fuchsia-400/20 mix-blend-screen">
                {WORDS[index]}
              </span>
              <p className="relative font-serif text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[0.08em] text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-fuchsia-200 drop-shadow-[0_0_45px_rgba(56,189,248,0.6)]">
                {WORDS[index]}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 text-[0.65rem] tracking-[0.5em] uppercase text-white/40">
              <span className="h-px w-10 bg-white/30" />
              <span>Opening sequence</span>
              <span className="h-px w-10 bg-white/30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_65%)] mix-blend-screen" />
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_55%)]" />

      <div className="relative z-10 flex w-full items-end justify-between px-8 pb-10 text-xs text-white uppercase tracking-[0.35em]">
        <button className="text-white/80 hover:text-white" onClick={handleComplete}>
        <button className="text-white/80 hover:text-white transition" onClick={handleComplete}>
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
