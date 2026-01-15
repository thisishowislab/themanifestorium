import React, { useState, useEffect, useRef } from "react";

// --- INTRO SCREENS ---
const screens = [
  {
    text: "Somewhere in the desert...",
    effect: "glitch",
    showEnter: false,
  },
  {
    text: "beyond the edge of everything known...",
    effect: "glitch",
    showEnter: false,
  },
  {
    text: "a quiet kind of magic awaits...",
    effect: "glitch",
    showEnter: false,
  },
  {
    text: null,
    effect: "rainbow",
    showEnter: true,
  }
];

export default function DiscoveryIntro({ onFinish }) {
  const [screenIdx, setScreenIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(true); // fade in/out transition
  const timerRef = useRef();

  // Timing and transitions
  useEffect(() => {
    // Don't auto-advance on last screen
    if (!visible || screens[screenIdx].showEnter) return;
    timerRef.current = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setScreenIdx(idx => idx + 1);
        setFade(true);
      }, 400); // fade out duration
    }, 1500);
    return () => clearTimeout(timerRef.current);
  }, [screenIdx, visible]);

  // Clean up on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Handler for both skip and enter
  function finish() {
    setVisible(false);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 350);
  }

  // Subtle dust particles (stars)
  const dustParticles = Array.from({ length: 24 }).map((_, i) => ({
    left: Math.random() * 100 + "%",
    top: Math.random() * 100 + "%",
    size: Math.random() * 1.3 + 0.8,
    opacity: Math.random() * 0.2 + 0.08,
    duration: Math.random() * 18 + 12,
    delay: Math.random() * 10,
    key: i,
  }));

  // For rainbow/title/tagline screen
  function renderFinalScreen() {
    return (
      <div>
        <span className="manifestorium-title rainbow-text">THE MANIFESTORIUM</span>
        <div className="rainbow-line" />
        <span className="manifestorium-tagline">
          Where forgotten things find their voice
        </span>
        <div style={{marginTop: "2.1em"}}>
          <button
            className="intro-enter-btn"
            tabIndex={0}
            onClick={finish}
            autoFocus
          >
            ENTER
          </button>
        </div>
      </div>
    );
  }

  if (!visible) return null;

  const isGlitch = screens[screenIdx].effect === "glitch";
  const showEnter = screens[screenIdx].showEnter;

  return (
    <div className={`discovery-intro-bg${isGlitch ? " glitch-bg" : ""}${!fade ? " fade-out-bg" : ""}`}>
      {/* Dust / Stars */}
      <div className="dust-layer">
        {dustParticles.map((p) => (
          <div
            key={p.key}
            className="dust-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size + "px",
              height: p.size + "px",
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
      {/* Main Text */}
      <div className="discovery-intro-content">
        <div
          className={[
            "intro-text",
            isGlitch ? "glitch" : "rainbow",
            fade ? "fade-in" : "fade-out"
          ].join(" ")}
        >
          {showEnter ? renderFinalScreen() : screens[screenIdx].text}
        </div>
      </div>
      {/* SKIP button (always visible, bottom right) */}
      <button className="intro-skip-btn" onClick={finish}>
        Skip
      </button>
      {/* Styles */}
      <style jsx>{`
        .discovery-intro-bg {
          position: fixed;
          z-index: 10000;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(ellipse at 50% 60%, #23123c 55%, #2a102a 100%);
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          overflow: hidden;
          box-shadow: 0 0 120px 40px #000 inset;
          transition: opacity 0.6s;
        }
        .fade-out-bg {
          opacity: 0;
        }
        .glitch-bg {
          animation: flickerbg 1.2s steps(1) infinite;
        }
        @keyframes flickerbg {
          0% { filter: none; opacity:1; }
          7% { filter: brightness(1.1) contrast(1.15); }
          12% { filter: brightness(0.78) grayscale(0.12); }
          14% { opacity: 0.92; }
          21% { filter: brightness(1.15) hue-rotate(8deg); }
          28% { filter: brightness(0.9) grayscale(0.22); }
          32% { opacity: 1; filter: none;}
          100% { filter: none; opacity:1;}
        }
        .discovery-intro-content {
          position: relative;
          z-index: 10;
          text-align: center;
          background: none;
          box-shadow: none;
          border-radius: 0;
          padding: 0;
          min-width: 0;
        }
        .intro-text {
          font-family: 'Playfair Display', 'Cinzel', serif;
          font-size: 2.1rem;
          font-weight: 400;
          letter-spacing: 1px;
          margin-bottom: 1em;
          line-height: 1.28;
          transition: all 0.3s;
          filter: drop-shadow(0 2px 16px #000a);
          color: #ede5ca;
        }
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.5s forwards;
        }
        .fade-out {
          opacity: 1;
          animation: fadeOut 0.4s forwards;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          to { opacity: 0; }
        }
        .manifestorium-title {
          display: block;
          font-family: 'Cinzel', serif;
          font-size: 3.1rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          margin-bottom: 0.3em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #ffe066, #b29cff, #ea82ff, #45f5e6, #ffe066);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          filter: drop-shadow(0 0 10px #fff7) blur(0.2px);
        }
        .rainbow-line {
          width: 46vw;
          max-width: 600px;
          height: 2px;
          margin: 1.0em auto 1.3em auto;
          background: linear-gradient(90deg,#ffe066, #b29cff, #ea82ff, #45f5e6, #ffe066);
          border-radius: 1px;
          box-shadow: 0 0 12px #fff3, 0 0 4px #fff5;
        }
        .manifestorium-tagline {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          color: #f4eddc;
          opacity: 0.88;
          margin-top: 0.8em;
          margin-bottom: 2em;
          display: block;
          font-weight: 400;
          letter-spacing: 0.04em;
        }
        .intro-enter-btn {
          margin-top: 0.2em;
          font-family: 'Playfair Display', serif;
          font-size: 1.12rem;
          font-weight: 500;
          letter-spacing: 0.09em;
          background: rgba(32, 10, 50, 0.7);
          color: #ede5ca;
          border: 1.5px solid #ede5ca;
          border-radius: 8px;
          padding: 0.6em 2.5em;
          cursor: pointer;
          opacity: 0.93;
          box-shadow: 0 2px 14px #000a;
          transition: background 0.15s, color 0.1s, border 0.1s, opacity 0.2s;
        }
        .intro-enter-btn:hover,
        .intro-enter-btn:focus {
          background: linear-gradient(90deg,#ffe06644, #b29cff44, #ea82ff44, #45f5e644, #ffe06644);
          color: #2a102a;
          border-color: #ffe066;
          opacity: 1;
        }
        .intro-skip-btn {
          position: fixed;
          bottom: 3vh;
          right: 5vw;
          background: rgba(32, 10, 50, 0.13);
          color: #ffe066;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 1.1em;
          border: 2px solid #ffe06633;
          border-radius: 30px;
          padding: 0.38em 1.3em 0.38em 1em;
          cursor: pointer;
          opacity: 0.5;
          transition: background 0.15s, color 0.18s, opacity 0.25s;
          z-index: 10001;
          box-shadow: 0 2px 22px #000a;
        }
        .intro-skip-btn:hover {
          background: #ffe06622;
          color: #462B7A;
          opacity: 1;
        }
        .glitch {
          position: relative;
          color: #ede5ca;
          text-shadow: 1px 1px 2px #b29fffa9, -1px -1px 2px #0ff, 0 0 1px #000;
          animation: glitchy 0.8s infinite;
        }
        @keyframes glitchy {
          0% { text-shadow: 1px 1px 2px #b29fffa9, -1px -1px 2px #0ff, 0 0 1px #000; }
          15% { text-shadow: 2px -2px 3px #ea82ff, -2px 2px 2px #ffe066; }
          40% { text-shadow: -2px 2px 2px #5cfaff, 2px -2px 2px #b29cff; }
          60% { text-shadow: 1px -1px 2px #fff, -1px 1px 2px #0ff; }
          80% { text-shadow: -1px 2px 2px #ea82ff, 2px -1px 2px #ffe066; }
          100% { text-shadow: 1px 1px 2px #b29fffa9, -1px -1px 2px #0ff, 0 0 1px #000; }
        }
        .dust-layer {
          position: absolute;
          width: 100vw;
          height: 100vh;
          z-index: 2;
          pointer-events: none;
        }
        .dust-particle {
          position: absolute;
          border-radius: 50%;
          background: #fff9;
          animation: dust-move linear infinite;
        }
        @keyframes dust-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(26vh); opacity: 0.11; }
        }
        @media (max-width: 600px) {
          .intro-text { font-size: 1.1rem; }
          .manifestorium-title { font-size: 1.6rem; }
          .rainbow-line { width: 80vw; }
          .intro-enter-btn { font-size: 1em; padding: 0.3em 1.6em; }
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Cinzel:wght@700&display=swap" rel="stylesheet" />
    </div>
  );
}
