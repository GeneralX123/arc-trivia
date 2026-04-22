"use client";
import { useEffect, useRef, useState } from "react";

const TRACK_SRC = "/music/MIABKP.mp3";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.21);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    function handleFirstClick() {
      if (!started && audioRef.current) {
        audioRef.current.play().catch(() => {});
        setStarted(true);
      }
    }
    document.addEventListener("click", handleFirstClick, { once: true });
    return () => document.removeEventListener("click", handleFirstClick);
  }, [started]);

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio ref={audioRef} src={TRACK_SRC} loop preload="auto" />
      <div className="flex flex-col items-center gap-1 bg-black/50 border border-indigo-500/20 rounded-xl px-2 py-2 backdrop-blur">
        <span className="text-[10px] text-indigo-400/50 uppercase tracking-widest">Vol</span>
        <div className="relative w-7 h-7 flex items-center justify-center">
          <svg className="absolute inset-0 w-7 h-7 -rotate-[135deg]" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3" strokeDasharray="70.7 94.2" strokeLinecap="round"/>
            <circle cx="20" cy="20" r="15" fill="none" stroke="#6366f1" strokeWidth="3"
              strokeDasharray={`${volume * 70.7} 94.2`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.1s" }}/>
          </svg>
          <span className="text-[9px] text-indigo-300 font-bold relative z-10">{Math.round(volume * 100)}</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={volume}
          onChange={handleVolumeChange}
          className="accent-indigo-500 cursor-pointer"
          style={{ writingMode: "vertical-lr", direction: "rtl", height: "44px", width: "4px" }}
        />
        <span className="text-sm">🎵</span>
      </div>
    </div>
  );
}
