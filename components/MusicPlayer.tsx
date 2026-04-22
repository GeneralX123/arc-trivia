"use client";
import { useState, useRef, useEffect } from "react";

const TRACKS = [
  { title: "Like That", src: "/music/Like That.mp3" },
  { title: "Mona Lisa", src: "/music/monalisa1.mp3" },
  { title: "The Heart Pt. 5", src: "/music/the heart pt 5.mp3" },
] as { title: string; src: string }[];

export function MusicPlayer() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.play(); } else { audioRef.current.pause(); }
  }, [playing, current]);

  if (TRACKS.length === 0) return null;

  const track = TRACKS[current];

  function prev() { setCurrent((c) => (c - 1 + TRACKS.length) % TRACKS.length); }
  function next() { setCurrent((c) => (c + 1) % TRACKS.length); }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio ref={audioRef} src={track.src} onEnded={next} />
      {open && (
        <div className="mb-2 bg-black/90 border border-indigo-500/40 rounded-xl p-4 w-72 backdrop-blur">
          <p className="text-xs text-indigo-300 mb-1 uppercase tracking-widest">Now Playing</p>
          <p className="text-white font-semibold truncate mb-3">{track.title}</p>
          <div className="flex items-center justify-between gap-3">
            <button onClick={prev} className="text-indigo-400 hover:text-white text-lg">⏮</button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white"
            >
              {playing ? "⏸" : "▶"}
            </button>
            <button onClick={next} className="text-indigo-400 hover:text-white text-lg">⏭</button>
          </div>
          <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
            {TRACKS.map((t, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setPlaying(true); }}
                className={`w-full text-left text-sm px-2 py-1 rounded ${i === current ? "bg-indigo-600 text-white" : "text-indigo-300 hover:bg-indigo-900"}`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full bg-black/70 hover:bg-indigo-900/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 hover:text-white shadow-lg transition"
          title="Previous"
        >
          ⏮
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 flex items-center justify-center text-xl shadow-lg shadow-indigo-900"
        >
          🎵
        </button>
        <button
          onClick={next}
          className="w-9 h-9 rounded-full bg-black/70 hover:bg-indigo-900/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 hover:text-white shadow-lg transition"
          title="Next"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
