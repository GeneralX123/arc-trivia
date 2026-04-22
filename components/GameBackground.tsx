"use client";
export function GameBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020818]">
      {/* Star field layers */}
      <div className="stars-sm" />
      <div className="stars-md" />
      <div className="stars-lg" />

      {/* Nebula orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Shooting stars */}
      <div className="shoot shoot-1" />
      <div className="shoot shoot-2" />
      <div className="shoot shoot-3" />

      <style>{`
        /* ── Star fields ── */
        .stars-sm, .stars-md, .stars-lg {
          position: absolute;
          inset: 0;
          background-repeat: repeat;
        }
        .stars-sm {
          background-image: radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.55) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 25%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 20% 90%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 65% 55%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 42% 38%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 83% 12%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.4) 0%, transparent 100%);
          background-size: 400px 400px;
          animation: drift 120s linear infinite;
        }
        .stars-md {
          background-image: radial-gradient(1.5px 1.5px at 22% 33%, rgba(180,180,255,0.6) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 60% 10%, rgba(200,200,255,0.5) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 80% 60%, rgba(180,180,255,0.55) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 40% 85%, rgba(200,200,255,0.45) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 15% 65%, rgba(180,180,255,0.5) 0%, transparent 100%);
          background-size: 600px 600px;
          animation: drift 180s linear infinite reverse;
        }
        .stars-lg {
          background-image: radial-gradient(2px 2px at 35% 20%, rgba(160,160,255,0.7) 0%, transparent 100%),
            radial-gradient(2px 2px at 70% 75%, rgba(140,160,255,0.65) 0%, transparent 100%),
            radial-gradient(2px 2px at 88% 30%, rgba(160,160,255,0.6) 0%, transparent 100%),
            radial-gradient(2.5px 2.5px at 12% 82%, rgba(180,140,255,0.7) 0%, transparent 100%);
          background-size: 800px 800px;
          animation: twinkle 6s ease-in-out infinite alternate;
        }
        @keyframes drift {
          from { background-position: 0 0; }
          to   { background-position: 400px 400px; }
        }
        @keyframes twinkle {
          0%   { opacity: 0.6; }
          100% { opacity: 1; }
        }

        /* ── Nebula orbs ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.28;
          animation: float 14s ease-in-out infinite;
        }
        .orb-1 {
          width: 550px; height: 550px;
          background: radial-gradient(circle, #4f46e5, transparent);
          top: -120px; left: -120px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, #0e7490, transparent);
          bottom: -80px; right: -80px;
          animation-delay: -5s;
        }
        .orb-3 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #6d28d9, transparent);
          top: 38%; left: 48%;
          animation-delay: -9s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(25px, -25px) scale(1.04); }
          66%       { transform: translate(-18px, 18px) scale(0.96); }
        }

        /* ── Shooting stars ── */
        .shoot {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
          border-radius: 9999px;
          animation: shoot linear infinite;
          opacity: 0;
        }
        .shoot-1 { width: 120px; top: 18%; left: -10%; animation-duration: 9s;  animation-delay: 1s; }
        .shoot-2 { width: 80px;  top: 45%; left: -5%;  animation-duration: 13s; animation-delay: 5s; }
        .shoot-3 { width: 100px; top: 70%; left: -8%;  animation-duration: 11s; animation-delay: 8s; }
        @keyframes shoot {
          0%   { transform: translateX(0)    skewX(-20deg); opacity: 0; }
          5%   { opacity: 0.7; }
          40%  { opacity: 0.4; }
          60%  { transform: translateX(110vw) skewX(-20deg); opacity: 0; }
          100% { transform: translateX(110vw) skewX(-20deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
