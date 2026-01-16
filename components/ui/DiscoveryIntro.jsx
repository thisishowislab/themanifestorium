import React, { useState, useEffect, useRef } from "react";

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
    if (!visible || screens[screenIdx].showEnter) return;
    timerRef.current = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setScreenIdx(idx => idx + 1);
        setFade(true);
      }, 600); // slower fade
    }, 2000);
    return () => clearTimeout(timerRef.current);
  }, [screenIdx, visible]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function finish() {
    setVisible(false);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 400);
  }

  // Dust particles (subtle)
  const dustParticles = Array.from({ length: 24 }).map((_, i) => ({
    left: Math.random() * 100 + "%",
    top: Math.random() * 100 + "%",
    size: Math.random() * 1.4 + 0.7,
    opacity: Math.random() * 0.15 + 0.09,
    duration: Math.random() * 22 + 14,
    delay: Math.random() * 12,
    key: i,
  }));

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
    <div className={`discovery-intro-bg${isGlitch ? " gentle-glitch" : ""}${!fade ? " fade-out-bg" : ""}`}>
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
      <button className="intro-skip-btn" onClick={finish}>
        Skip
      </button>
      <style jsx>{`
        .discovery-intro-bg {
          position: fixed;
          z-index: 10000;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(ellipse at 50% 60%, #2a1746 60%, #1c0a2c 110%);
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          overflow: hidden;
          box-shadow: 0 0 120px 60px #000b inset;
          transition: opacity 0.7s;
        }
        .fade-out-bg {
          opacity: 0;
        }
        .gentle-glitch {
          animation: gentleFlicker 2.2s infinite steps(1);
        }
        @keyframes gentleFlicker {
          0%,100% { filter: none; }
          10% { filter: brightness(1.08) contrast(1.12) blur(0.2px); }
          18% { filter: brightness(0.95) grayscale(0.03); }
          23% { filter: brightness(1.11) sepia(0.1) hue-rotate(-4deg); }
          28% { filter: brightness(0.91) grayscale(0.08); }
          35% { filter: none;}
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
          animation: fadeIn 0.7s forwards cubic-bezier(0.77,0,0.175,1);
        }
        .fade-out {
          opacity: 1;
          animation: fadeOut 0.6s forwards cubic-bezier(0.77,0,0.175,1);
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
          font-size: 3.2rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          margin-bottom: 0.3em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #ffe066 5%, #b29cff 30%, #ea82ff 70%, #45f5e6 95%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          filter: drop-shadow(0 0 18px #fff5) blur(0.1px);
        }
        .rainbow-line {
          width: 44vw;
          max-width: 500px;
          height: 2.5px;
          margin: 1.0em auto 1.3em auto;
          background: linear-gradient(90deg,#ffe066, #b29cff, #ea82ff, #45f5e6, #ffe066);
          border-radius: 1px;
          box-shadow: 0 0 12px #fff3, 0 0 4px #fff5;
        }
        .manifestorium-tagline {
          font-family: 'Playfair Display', serif;
          font-size: 1.18rem;
          color: #f8efdf;
          opacity: 0.95;
          margin-top: 0.8em;
          margin-bottom: 2em;
          display: block;
          font-weight: 400;
          letter-spacing: 0.04em;
          text-shadow: 0 1px 12px #672a7f33;
        }
        .intro-enter-btn {
          margin-top: 0.2em;
          font-family: 'Playfair Display', serif;
          font-size: 1.12rem;
          font-weight: 500;
          letter-spacing: 0.09em;
          background: linear-gradient(90deg,#ffe06644, #b29cff33, #ea82ff33, #45f5e633, #ffe06644);
          color: #f4eddc;
          border: 2px solid #f4eddc;
          border-radius: 10px;
          padding: 0.6em 2.8em;
          cursor: pointer;
          opacity: 0.98;
          box-shadow: 0 2px 14px #000a;
          transition: background 0.15s, color 0.1s, border 0.1s, opacity 0.2s;
          text-shadow: 0 1px 6px #fff3;
        }
        .intro-enter-btn:hover,
        .intro-enter-btn:focus {
          background: linear-gradient(90deg,#ffe06688, #b29cff77, #ea82ff77, #45f5e677, #ffe06688);
          color: #2a102a;
          border-color: #ffe066;
          opacity: 1;
        }
        .intro-skip-btn {
          position: fixed;
          bottom: 3vh;
          right: 5vw;
          background: linear-gradient(90deg,#ffe06633, #ea82ff22, #23123c22);
          color: #ffe066;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 1.1em;
          border: 2px solid #ffe06633;
          border-radius: 30px;
          padding: 0.38em 1.3em 0.38em 1em;
          cursor: pointer;
          opacity: 0.62;
          transition: background 0.15s, color 0.18s, opacity 0.25s;
          z-index: 10001;
          box-shadow: 0 2px 22px #000a;
          text-shadow: 0 1px 6px #ffe06688;
        }
        .intro-skip-btn:hover {
          background: #ffe06644;
          color: #462B7A;
          opacity: 1;
        }
        .glitch {
          position: relative;
          color: #ede5ca;
          text-shadow: 1px 1px 2px #b29fffa9, -1px -1px 2px #0ff, 0 0 1px #000;
          animation: glitchy 1.7s infinite linear;
        }
        @keyframes glitchy {
          0% { text-shadow: 1px 1px 2px #b29fffa9, -1px -1px 2px #0ff, 0 0 1px #000; }
          12% { text-shadow: 2px -2px 3px #ea82ff, -2px 2px 2px #ffe066; }
          37% { text-shadow: -2px 2px 2px #5cfaff, 2px -2px 2px #b29cff; }
          51% { text-shadow: 1px -1px 2px #fff, -1px 1px 2px #0ff; }
          68% { text-shadow: -1px 2px 2px #ea82ff, 2px -1px 2px #ffe066; }
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
