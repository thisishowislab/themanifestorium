import React, { useState, useEffect } from "react";

// You can move these colors/fonts to your global CSS if you want!
const screens = [
  {
    text: "Somewhere in the desert...",
    effect: "glitch",
  },
  {
    text: "beyond the edge of everything known...",
    effect: "glitch",
  },
  {
    text: "a quiet kind of magic awaits...",
    effect: "glitch",
  },
  {
    text: (
      <>
        <span className="rainbow-text manifestorium-title">The Manifestorium</span>
        <br />
        <span className="rainbow-text manifestorium-subtitle">
          Where forgotten things find their way.
        </span>
      </>
    ),
    effect: "rainbow",
  },
];

export default function DiscoveryIntro({ onFinish }) {
  const [screenIdx, setScreenIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // Advance screens every 1.8 seconds, except last one (3s)
  useEffect(() => {
    if (!visible) return;
    if (screenIdx < screens.length - 1) {
      const timer = setTimeout(() => setScreenIdx(screenIdx + 1), 1800);
      return () => clearTimeout(timer);
    } else {
      // Last screen, wait 3s then finish
      const timer = setTimeout(() => handleFinish(), 3000);
      return () => clearTimeout(timer);
    }
  }, [screenIdx, visible]);

  function handleFinish() {
    setVisible(false);
    if (onFinish) onFinish();
  }

  // Dust particles
  const dustParticles = Array.from({ length: 40 }).map((_, i) => ({
    left: Math.random() * 100 + "%",
    top: Math.random() * 100 + "%",
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 8,
    key: i,
  }));

  if (!visible) return null;

  return (
    <div className="discovery-intro-bg">
      {/* Dust Effect */}
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

      {/* Animated Text */}
      <div className="discovery-intro-content">
        <div
          className={
            screens[screenIdx].effect === "glitch"
              ? "intro-text glitch"
              : "intro-text"
          }
        >
          {screens[screenIdx].text}
        </div>
        <button className="intro-skip-btn" onClick={handleFinish}>
          Skip
        </button>
      </div>
      {/* Styles */}
      <style jsx>{`
        .discovery-intro-bg {
          position: fixed;
          z-index: 10000;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(32, 10, 50, 0.95);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          overflow: hidden;
        }
        .discovery-intro-content {
          position: relative;
          z-index: 10;
          text-align: center;
          background: rgba(49, 18, 70, 0.7);
          box-shadow: 0 8px 32px rgba(20, 0, 40, 0.45);
          border-radius: 28px;
          padding: 2.6em 1.5em 2.4em 1.5em;
        }
        .intro-text {
          font-family: 'Cinzel', serif;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 1em;
          line-height: 1.25;
          transition: all 0.3s;
        }
        .manifestorium-title {
          font-size: 2.9rem;
          font-family: 'Cinzel', serif;
          font-weight: 900;
          letter-spacing: 3px;
          margin-bottom: 0.3em;
          display: block;
        }
        .manifestorium-subtitle {
          font-size: 1.2rem;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          margin-top: 0.6em;
          display: block;
        }
        .rainbow-text {
          background: linear-gradient(90deg, #ffd700 0%, #ff6bcb 33%, #5cfaff 67%, #e0ff66 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          filter: drop-shadow(0 0 10px #fff8);
        }
        .glitch {
          position: relative;
          color: #fff;
          text-shadow: 1px 1px 2px #b729ff, -1px -1px 2px #0ff, 0 0 1px #000;
          animation: glitchy 0.8s infinite;
        }
        @keyframes glitchy {
          0% { text-shadow: 1px 1px 2px #b729ff, -1px -1px 2px #0ff, 0 0 1px #000; }
          20% { text-shadow: 2px -2px 5px #ff6bcb, -2px 2px 5px #e0ff66; }
          40% { text-shadow: -2px 2px 2px #5cfaff, 2px -2px 3px #ffd700; }
          60% { text-shadow: 1px -1px 3px #fff, -1px 1px 3px #0ff; }
          80% { text-shadow: -1px 2px 2px #ff6bcb, 2px -1px 2px #e0ff66; }
          100% { text-shadow: 1px 1px 2px #b729ff, -1px -1px 2px #0ff, 0 0 1px #000; }
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
          background: rgba(255,255,220,0.55);
          animation: dust-move linear infinite;
        }
        @keyframes dust-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(24vh); opacity: 0.2; }
        }
        .intro-skip-btn {
          position: absolute;
          bottom: 1.6em;
          right: 1.8em;
          background: rgba(24, 8, 44, 0.8);
          color: #ffd700;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 1em;
          border: none;
          border-radius: 8px;
          padding: 0.5em 1.4em;
          cursor: pointer;
          opacity: 0.85;
          transition: background 0.2s, color 0.2s;
        }
        .intro-skip-btn:hover {
          background: #ffd700;
          color: #462B7A;
        }
        @media (max-width: 600px) {
          .intro-text { font-size: 1.1rem; }
          .manifestorium-title { font-size: 1.4rem; }
          .discovery-intro-content { padding: 1.3em 0.6em 1.2em 0.6em; }
        }
      `}</style>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@500;700&display=swap" rel="stylesheet" />
    </div>
  );
}
