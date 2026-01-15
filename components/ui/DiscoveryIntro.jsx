import React, { useState, useEffect } from "react";

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
      <div>
        <span className="manifestorium-title rainbow-text">
          The Manifestorium
        </span>
        <br />
        <span className="manifestorium-tagline rainbow-fade">
          Where forgotten things find their way.
        </span>
      </div>
    ),
    effect: "rainbow",
  },
];

export default function DiscoveryIntro({ onFinish }) {
  const [screenIdx, setScreenIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    if (screenIdx < screens.length - 1) {
      const timer = setTimeout(() => setScreenIdx(screenIdx + 1), 1800);
      return () => clearTimeout(timer);
    } else {
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
              : "intro-text rainbow"
          }
        >
          {screens[screenIdx].text}
        </div>
      </div>
      {/* Skip Button */}
      <button className="intro-skip-btn" onClick={handleFinish}>
        ⏭ Skip
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
          background: radial-gradient(ellipse at 50% 60%, rgba(32,10,50,0.97) 60%, rgba(15,0,40,0.93) 100%);
          backdrop-filter: blur(8px) brightness(0.96);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          overflow: hidden;
          box-shadow: 0 0 120px 40px #000 inset;
          transition: opacity 0.8s;
        }
        .discovery-intro-content {
          position: relative;
          z-index: 10;
          text-align: center;
          /* Remove box and background! */
          background: none;
          box-shadow: none;
          border-radius: 0;
          padding: 0;
          min-width: 0;
        }
        .intro-text {
          font-family: 'Cinzel', serif;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 1em;
          line-height: 1.25;
          transition: all 0.3s;
          filter: drop-shadow(0 2px 16px #000a);
        }
        .manifestorium-title {
          font-size: 4rem;
          font-family: 'Cinzel', serif;
          font-weight: 900;
          letter-spacing: 2.5px;
          margin-bottom: 0.1em;
          display: block;
          line-height: 1.05;
          text-shadow: 0 2px 36px #fff8, 0 0 2px #b729ffcc;
        }
        .manifestorium-tagline {
          font-size: 1.2rem;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          margin-top: 1em;
          display: block;
          opacity: 0.82;
          filter: blur(0.12px);
        }
        .rainbow-text {
          background: linear-gradient(90deg, #ffd700 0%, #ff6bcb 33%, #5cfaff 67%, #e0ff66 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          filter: drop-shadow(0 0 14px #fff8);
        }
        .rainbow-fade {
          background: linear-gradient(90deg, #ffe066, #b29cff, #ea82ff, #45f5e6, #ffe066);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          filter: drop-shadow(0 0 7px #fff4);
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
          100% { transform: translateY(28vh); opacity: 0.2; }
        }
        .intro-skip-btn {
          position: fixed;
          bottom: 3vh;
          right: 5vw;
          background: rgba(32, 10, 50, 0.15);
          color: #ffd700;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 1.2em;
          border: 2px solid #ffd70055;
          border-radius: 30px;
          padding: 0.38em 1.3em 0.38em 1em;
          cursor: pointer;
          opacity: 0.55;
          transition: background 0.15s, color 0.18s, opacity 0.25s;
          z-index: 10001;
          box-shadow: 0 2px 22px #000a;
        }
        .intro-skip-btn:hover {
          background: #ffd70022;
          color: #462B7A;
          opacity: 1;
        }
        @media (max-width: 600px) {
          .intro-text { font-size: 1.2rem; }
          .manifestorium-title { font-size: 1.6rem; }
          .discovery-intro-content { padding: 1.3em 0.6em 1.2em 0.6em; min-width: 70vw; }
          .intro-skip-btn { font-size: 1em; padding: 0.3em 1em 0.3em 0.8em; }
        }
      `}</style>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
}
