"use client";

import { useEffect, useState } from "react";

export default function AuroraBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-[#0a0014]" />

      {/* Aurora layers - each is a large radial gradient that animates position */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(120, 0, 255, 0.25) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 80% 70%, rgba(0, 100, 255, 0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 50% 20%, rgba(255, 0, 128, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 30% 40%, rgba(0, 200, 255, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 70% 30%, rgba(180, 0, 255, 0.15) 0%, transparent 50%)
          `,
        }}
      />

      {/* Animated aurora waves */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 40% at 50% 100%, rgba(80, 0, 200, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 80% 30% at 30% 100%, rgba(0, 80, 255, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 60% 25% at 70% 100%, rgba(200, 0, 100, 0.15) 0%, transparent 50%)
          `,
        }}
      />

      {/* Animated overlay - CSS keyframes for slow movement */}
      {mounted && (
        <style>{`
          @keyframes aurora1 {
            0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
            25% { transform: translate(5%, -3%) scale(1.1); opacity: 0.8; }
            50% { transform: translate(-3%, 2%) scale(0.95); opacity: 0.5; }
            75% { transform: translate(4%, -1%) scale(1.05); opacity: 0.7; }
            100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          }
          @keyframes aurora2 {
            0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
            25% { transform: translate(-4%, 2%) scale(1.05); opacity: 0.7; }
            50% { transform: translate(6%, -2%) scale(1.1); opacity: 0.4; }
            75% { transform: translate(-2%, 3%) scale(0.9); opacity: 0.6; }
            100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          }
          @keyframes aurora3 {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(3%, 2%) scale(1.08); }
            66% { transform: translate(-4%, -1%) scale(0.92); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes auroraGlow {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          @keyframes auroraDrift {
            0% { transform: translateX(-10%) translateY(0); }
            50% { transform: translateX(10%) translateY(-5%); }
            100% { transform: translateX(-10%) translateY(0); }
          }
          @keyframes starTwinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes meteor {
            0% { transform: translateX(0) translateY(0); opacity: 1; }
            100% { transform: translateX(-200px) translateY(200px); opacity: 0; }
          }
          .aurora-blob-1 {
            animation: aurora1 12s ease-in-out infinite;
          }
          .aurora-blob-2 {
            animation: aurora2 15s ease-in-out infinite;
          }
          .aurora-blob-3 {
            animation: aurora3 18s ease-in-out infinite;
          }
          .aurora-drift {
            animation: auroraDrift 20s ease-in-out infinite;
          }
          .aurora-glow {
            animation: auroraGlow 8s ease-in-out infinite;
          }
        `}</style>
      )}

      {/* Aurora blob 1 - purple */}
      <div
        className="aurora-blob-1 absolute"
        style={{
          width: "70%",
          height: "50%",
          top: "10%",
          left: "15%",
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(150, 0, 255, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Aurora blob 2 - electric blue */}
      <div
        className="aurora-blob-2 absolute"
        style={{
          width: "60%",
          height: "40%",
          bottom: "20%",
          right: "10%",
          background:
            "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(0, 120, 255, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Aurora blob 3 - hot pink */}
      <div
        className="aurora-blob-3 absolute"
        style={{
          width: "50%",
          height: "35%",
          top: "40%",
          left: "40%",
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255, 0, 128, 0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Aurora drift layer - slow horizontal waves */}
      <div
        className="aurora-drift absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 15% at 50% 10%, rgba(100, 0, 200, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 100% 12% at 30% 90%, rgba(0, 100, 200, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 10% at 80% 50%, rgba(200, 0, 100, 0.06) 0%, transparent 50%)
          `,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none" style={{}}>
        {mounted &&
          Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1 + "px",
                height: Math.random() * 2 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                opacity: Math.random() * 0.5 + 0.2,
                animation: `starTwinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
                animationDelay: Math.random() * 5 + "s",
              }}
            />
          ))}
      </div>

      {/* Shooting stars */}
      {mounted &&
        Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`meteor-${i}`}
            className="absolute"
            style={{
              width: "80px",
              height: "1px",
              top: Math.random() * 30 + "%",
              left: Math.random() * 60 + 30 + "%",
              background:
                "linear-gradient(to left, rgba(255,255,255,0.8), transparent)",
              animation: `meteor ${Math.random() * 5 + 6}s linear infinite`,
              animationDelay: Math.random() * 10 + "s",
              transform: "rotate(-45deg)",
              opacity: 0.5,
            }}
          />
        ))}

      {/* Bottom glow */}
      <div
        className="aurora-glow absolute bottom-0 left-0 right-0"
        style={{
          height: "40%",
          background:
            "linear-gradient(to top, rgba(100, 0, 200, 0.15) 0%, transparent 100%)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
