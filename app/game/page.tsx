"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { parseEther } from "viem";
import { ARC_TRIVIA_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { TIERS } from "@/lib/tiers";
import { playCorrect, playWrong, playPowerup } from "@/lib/sounds";
import { GameBackground } from "@/components/GameBackground";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import Image from "next/image";

type Question = { id: number; question: string; options: { label: string; text: string }[] };
type Phase = "loading" | "paying" | "waiting_payment" | "countdown" | "playing" | "finished" | "already_played" | "x_taken";
type PowerUps = { skip: boolean; extraTime: boolean; fiftyFifty: boolean };

export default function GamePage() {
  const { address, isConnected, status } = useAccount();
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reserveQuestions, setReserveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [maxTime, setMaxTime] = useState(10);
  const [powerUps, setPowerUps] = useState<PowerUps>({ skip: true, extraTime: true, fiftyFifty: true });
  const [result, setResult] = useState<{ score: number; tier: number; tierName: string; signature: string; minted?: boolean } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);
  const handleAnswerRef = useRef<((opt: string | null) => Promise<void>) | null>(null);

  const { writeContract, data: txHash } = useWriteContract();
  const { isSuccess: paymentConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: playerOnChain, refetch: refetchOnChain } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ARC_TRIVIA_ABI,
    functionName: "players",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESS },
  });
  const hasMinted = !!(playerOnChain as unknown as unknown[])?.[1];

  useEffect(() => {
    if (status === "disconnected") { router.push("/"); return; }
    if (status === "reconnecting" || status === "connecting") return;
    if (sessionStatus === "loading") return;
    if (!isConnected || !session?.user?.xUsername) router.push("/");
  }, [isConnected, session, router, status, sessionStatus]);

  useEffect(() => {
    if (paymentConfirmed && phase === "waiting_payment") startGame();
  }, [paymentConfirmed, phase]);

  useEffect(() => {
    if (!address || !session) return;
    async function checkPlayed() {
      const res = await fetch("/api/game/start", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, checkOnly: true }),
      });
      const data = await res.json();
      if (data.error === "X account already used") { setPhase("x_taken"); return; }
      if (data.error === "Already played") {
        const finishRes = await fetch("/api/game/finish", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address }),
        });
        const finishData = await finishRes.json();
        if (finishData.score !== undefined) setResult(finishData);
        setPhase("already_played");
        return;
      }
      setPhase("paying");
    }
    checkPlayed();
  }, [address, session]);

  function startTimer(duration = 15) {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(duration);
    setMaxTime(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); handleAnswerRef.current?.(null); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  async function payEntry() {
    if (!address || !CONTRACT_ADDRESS) return;
    try {
      writeContract({ address: CONTRACT_ADDRESS, abi: ARC_TRIVIA_ABI, functionName: "enterGame", value: parseEther("2") });
      setPhase("waiting_payment");
    } catch { setPhase("paying"); }
  }

  async function startGame() {
    const res = await fetch("/api/game/start", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address }),
    });
    const data = await res.json();
    if (data.error === "X account already used") { setPhase("x_taken"); return; }
    if (data.error === "Already played") { setPhase("already_played"); return; }
    setQuestions(data.questions);
    setReserveQuestions(data.reserve ?? []);
    setPhase("countdown");
    let count = 3;
    setCountdown(count);
    const cdInterval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(cdInterval);
        setPhase("playing");
        startTimer();
      } else {
        setCountdown(count);
      }
    }, 1000);
  }

  const handleAnswer = useCallback(async (optionText: string | null) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(optionText ?? "__timeout__");

    const res = await fetch("/api/game/answer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address, questionId: questions[currentIndex].id, selectedOptionText: optionText ?? "" }),
    });
    const data = await res.json();
    setCorrectAnswer(data.correctAnswer ?? optionText ?? "");
    setScore(data.score);

    if (data.correct) { playCorrect(); setStreak(s => s + 1); }
    else { playWrong(); setStreak(0); }

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) { finishGame(); }
      else {
        setCurrentIndex(i => i + 1);
        setSelected(null); setCorrectAnswer(null); setHiddenOptions([]);
        answeredRef.current = false;
        startTimer(15);
      }
    }, 1300);
  }, [currentIndex, questions, address]);
  handleAnswerRef.current = handleAnswer;

  function useSkip() {
    if (!powerUps.skip || answeredRef.current) return;
    playPowerup();
    setPowerUps(p => ({ ...p, skip: false }));
    if (timerRef.current) clearInterval(timerRef.current);
    answeredRef.current = true;
    setSelected("__skip__");

    // Build updated question list: remove skipped, append replacement from reserve
    const newQuestions = [...questions];
    newQuestions.splice(currentIndex, 1);
    const newReserve = [...reserveQuestions];
    if (newReserve.length > 0) {
      newQuestions.push(newReserve.shift()!);
    }
    setQuestions(newQuestions);
    setReserveQuestions(newReserve);

    setTimeout(() => {
      if (currentIndex >= newQuestions.length) {
        finishGame();
      } else {
        setSelected(null); setCorrectAnswer(null); setHiddenOptions([]);
        answeredRef.current = false;
        startTimer(15);
      }
    }, 600);
  }

  function useExtraTime() {
    if (!powerUps.extraTime || answeredRef.current) return;
    playPowerup();
    setPowerUps(p => ({ ...p, extraTime: false }));
    setTimeLeft(t => t + 10);
    setMaxTime(m => m + 10);
  }

  async function useFiftyFifty() {
    if (!powerUps.fiftyFifty || answeredRef.current || !questions[currentIndex]) return;
    playPowerup();
    setPowerUps(p => ({ ...p, fiftyFifty: false }));
    const q = questions[currentIndex];
    const res = await fetch("/api/game/hint", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: q.id, options: q.options.map(o => o.text) }),
    });
    const data = await res.json();
    if (data.hide) setHiddenOptions(data.hide);
  }

  async function finishGame() {
    setPhase("finished");
    const res = await fetch("/api/game/finish", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address }),
    });
    setResult(await res.json());
  }

  const tier = result ? TIERS[result.tier] : null;
  const q = questions[currentIndex];
  const timerPct = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0;
  const timerColor = timeLeft <= 3 ? "#ef4444" : timeLeft <= 6 ? "#f59e0b" : "#6366f1";

  // ── Screens ──────────────────────────────────────────────────

  if (phase === "loading") return <Shell><Spinner /></Shell>;

  if (phase === "already_played") {
    const alreadyTier = result ? TIERS[result.tier] : null;
    const shareText = result ? encodeURIComponent(`I just played Arc Trivia 1.0 and earned the "${alreadyTier?.name}" SBT with a score of ${result.score}/20! 🎮\n\nAre you an Arc Maxi? Go Try it now`) : "";
    const shareUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/share/${address}`);
    return (
      <Shell>
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-black leading-snug">Thanks for playing<br />Arc Trivia 1.0!</h2>
          {result && alreadyTier && (
            <div className="glass-card p-6 space-y-3">
              <Image src={alreadyTier.image} alt={alreadyTier.name} width={120} height={120} className="mx-auto object-contain" />
              <p className="text-xl font-bold text-indigo-300">{alreadyTier.name}</p>
              <p className="text-4xl font-black">{result.score}<span className="text-indigo-400 text-xl">/20</span></p>
            </div>
          )}
          {result && !hasMinted && (
            <MintButton score={result.score} tierId={result.tier} signature={result.signature} address={address!} onMinted={() => refetchOnChain()} />
          )}
          {hasMinted && (
            <p className="text-green-400 text-sm font-semibold">✓ SBT minted on-chain</p>
          )}
          {result && (
            <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-zinc-700 hover:border-zinc-500 text-white py-3 rounded-xl transition text-sm">
              <span className="font-bold">𝕏</span> Share on X
            </a>
          )}
          <button onClick={() => router.push("/profile")} className="btn-primary">View your SBT →</button>
          <button onClick={() => router.push("/leaderboard")} className="w-full text-indigo-400 hover:text-indigo-300 text-sm underline">
            See the leaderboard →
          </button>
        </div>
      </Shell>
    );
  }

  if (phase === "x_taken") return (
    <Shell>
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-2xl font-black leading-snug">X Account Already Used</h2>
        <p className="text-indigo-200/60 text-sm">
          @{session?.user?.xUsername} has already played Arc Trivia 1.0 on a different wallet.<br /><br />
          Each X account can only play once.
        </p>
        <button onClick={() => router.push("/")} className="btn-primary">Back to Home →</button>
      </div>
    </Shell>
  );

  if (phase === "paying") return (
    <Shell>
      <div className="max-w-sm w-full space-y-5">
        <h2 className="text-3xl font-black text-center">Ready to play?</h2>

        {/* Entry fee */}
        <div className="glass-card p-5 text-center space-y-1">
          <p className="text-xs text-indigo-300 uppercase tracking-widest">Entry Fee</p>
          <p className="text-5xl font-black text-indigo-400">2 <span className="text-2xl">USDC</span></p>
          <p className="text-xs text-indigo-200/40">Non-refundable</p>
        </div>

        {/* Rules */}
        <div className="glass-card p-5 space-y-3">
          <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest">How to Play</p>
          <ul className="space-y-2 text-sm text-indigo-200/70">
            <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">→</span>20 questions, 15 seconds each. Answer before time runs out.</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">→</span>Each user can only play <span className="text-white font-semibold">once</span>. Make it count.</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">→</span>If you quit or refresh mid-game, your score locks in automatically.</li>
          </ul>
          <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest pt-1">Power-ups (1 each)</p>
          <ul className="space-y-2 text-sm text-indigo-200/70">
            <li className="flex items-center gap-2"><span className="text-base">◑</span><span><span className="text-white font-semibold">50/50</span> — Removes 2 wrong answers</span></li>
            <li className="flex items-center gap-2"><span className="text-base">⏱</span><span><span className="text-white font-semibold">+10s</span> — Adds 10 extra seconds to the clock</span></li>
            <li className="flex items-center gap-2"><span className="text-base">⏭</span><span><span className="text-white font-semibold">Skip</span> — Skips the question (no score change)</span></li>
          </ul>
        </div>

        <button onClick={payEntry} className="btn-primary">Pay & Start Game →</button>
      </div>
    </Shell>
  );

  if (phase === "waiting_payment") return (
    <Shell><div className="text-center space-y-4"><Spinner /><p className="text-indigo-200/60">Confirming on Arc Testnet...</p></div></Shell>
  );

  if (phase === "countdown") return (
    <Shell>
      <div className="text-center space-y-4">
        <p className="text-indigo-300 text-lg font-semibold uppercase tracking-widest">Arc Trivia 1.0</p>
        <p className="text-indigo-200/60 text-sm">Starting in</p>
        <p className="text-9xl font-black text-indigo-400" style={{ transition: "all 0.3s" }}>{countdown}</p>
        <p className="text-indigo-200/40 text-xs">Get ready...</p>
      </div>
    </Shell>
  );

  if (phase === "finished" && result && tier) {
    const shareText = encodeURIComponent(`I just played Arc Trivia 1.0 and earned the "${tier.name}" SBT with a score of ${result.score}/20! 🎮\n\nAre you an Arc Maxi? Go Try it now`);
    const shareUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/share/${address}`);
    return (
      <Shell>
        <div className="max-w-sm w-full text-center space-y-5">
          <h2 className="text-3xl font-black">Game Complete!</h2>
          <div className="glass-card p-6 space-y-4">
            <Image src={tier.image} alt={tier.name} width={160} height={160} className="mx-auto object-contain" />
            <p className="text-2xl font-bold text-indigo-300">{tier.name}</p>
            <p className="text-5xl font-black">{result.score}<span className="text-indigo-400 text-2xl">/20</span></p>
          </div>
          {!hasMinted
            ? <MintButton score={result.score} tierId={result.tier} signature={result.signature} address={address!} onMinted={() => refetchOnChain()} />
            : <p className="text-green-400 text-sm font-semibold">✓ SBT minted on-chain</p>
          }
          <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-zinc-700 hover:border-zinc-500 text-white py-3 rounded-xl transition text-sm">
            <span className="font-bold">𝕏</span> Share on X
          </a>
          <button onClick={() => router.push("/profile")} className="text-indigo-400 hover:text-indigo-300 text-sm underline">
            View Profile →
          </button>
        </div>
      </Shell>
    );
  }

  if (phase === "playing" && q) return (
    <>
      <GameBackground />
      <Sidebar />
      <TopBar />
      <main className="min-h-screen pl-16 pt-14 flex flex-col">
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 gap-4">

          {/* Progress + streak row */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-indigo-300 font-medium">
              Question <span className="text-white font-bold">{currentIndex + 1}</span>/{questions.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-indigo-400">Score: <span className="text-white font-bold">{score}</span></span>
              {streak > 0 && (
                <span className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-bold px-2.5 py-1 rounded-full">
                  🔥 {streak}
                </span>
              )}
            </div>
          </div>

          {/* Timer bar */}
          <div className="w-full h-1.5 rounded-full bg-indigo-950/80 overflow-hidden">
            <div className="h-full rounded-full transition-none"
              style={{ width: `${timerPct}%`, background: timerColor, transition: "width 1s linear, background 0.3s" }} />
          </div>
          <div className="flex justify-between items-center -mt-2">
            <span className="text-xs text-indigo-500">Timer</span>
            <span className={`text-sm font-black ${timeLeft <= 3 ? "text-red-400" : "text-indigo-400"}`}>{timeLeft}s</span>
          </div>

          {/* Question card */}
          <div className="glass-card p-6 md:p-8">
            <p className="text-lg md:text-xl font-semibold leading-relaxed">{q.question}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-2.5">
            {q.options.map((opt) => {
              const isHidden = hiddenOptions.includes(opt.text);
              const isSelected = selected === opt.text;
              const isCorrect = correctAnswer === opt.text;
              const isWrong = isSelected && !isCorrect && selected !== "__timeout__" && selected !== "__skip__";

              let cls = "w-full text-left px-5 py-4 rounded-xl border font-medium text-sm transition-all duration-200 flex items-center gap-3 ";
              if (isHidden || selected === "__skip__") {
                cls += "opacity-0 pointer-events-none";
              } else if (isCorrect && selected) {
                cls += "border-green-400 bg-green-500/20 text-green-300 scale-[1.01]";
              } else if (isWrong) {
                cls += "border-red-400 bg-red-500/20 text-red-300";
              } else if (!selected) {
                cls += "border-indigo-500/20 bg-black/30 hover:border-indigo-400/60 hover:bg-indigo-950/50 cursor-pointer hover:scale-[1.01]";
              } else {
                cls += "border-indigo-500/10 bg-black/20 opacity-40 cursor-not-allowed";
              }

              return (
                <button key={opt.label} className={cls}
                  onClick={() => !selected && !isHidden && handleAnswer(opt.text)}
                  disabled={!!selected || isHidden}>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0
                    ${isCorrect && selected ? "bg-green-500 text-white" : isWrong ? "bg-red-500 text-white" : "bg-indigo-900/60 text-indigo-400"}`}>
                    {opt.label}
                  </span>
                  {opt.text}
                  {isCorrect && selected && <span className="ml-auto text-green-400">✓</span>}
                  {isWrong && <span className="ml-auto text-red-400">✗</span>}
                </button>
              );
            })}
          </div>

          {/* Power-ups */}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-indigo-500 uppercase tracking-widest">Power-ups</span>
            <button onClick={useFiftyFifty} disabled={!powerUps.fiftyFifty || !!selected}
              className={`powerup-btn ${!powerUps.fiftyFifty ? "opacity-30 cursor-not-allowed" : ""}`}
              title="50/50 — Remove 2 wrong answers">
              <span className="text-base">◑</span>
              <span className="text-xs">50/50</span>
            </button>
            <button onClick={useExtraTime} disabled={!powerUps.extraTime || !!selected}
              className={`powerup-btn ${!powerUps.extraTime ? "opacity-30 cursor-not-allowed" : ""}`}
              title="+10 seconds">
              <span className="text-base">⏱</span>
              <span className="text-xs">+10s</span>
            </button>
            <button onClick={useSkip} disabled={!powerUps.skip || !!selected}
              className={`powerup-btn ${!powerUps.skip ? "opacity-30 cursor-not-allowed" : ""}`}
              title="Skip question">
              <span className="text-base">⏭</span>
              <span className="text-xs">Skip</span>
            </button>
          </div>

        </div>
      </main>

      <style>{`
        .glass-card {
          background: rgba(10,10,30,0.7);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 1rem;
          backdrop-filter: blur(16px);
        }
        .powerup-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 8px;
          border: 1px solid rgba(99,102,241,0.3);
          background: rgba(99,102,241,0.1);
          color: #a5b4fc; font-weight: 600;
          transition: all 0.15s;
        }
        .powerup-btn:not(:disabled):hover {
          background: rgba(99,102,241,0.25);
          border-color: rgba(99,102,241,0.6);
          color: white;
        }
      `}</style>
    </>
  );

  return <Shell><Spinner /></Shell>;
}

function MintButton({ score, tierId, signature, address, onMinted }: { score: number; tierId: number; signature: string; address: string; onMinted?: () => void }) {
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  useEffect(() => { if (isSuccess && onMinted) onMinted(); }, [isSuccess]);
  if (isSuccess) return <p className="text-green-400 font-semibold py-3">✓ SBT Minted successfully!</p>;
  return (
    <button disabled={isPending || !CONTRACT_ADDRESS}
      onClick={() => writeContract({ address: CONTRACT_ADDRESS, abi: ARC_TRIVIA_ABI, functionName: "mintSBT", args: [score, tierId, signature as `0x${string}`] })}
      className="btn-primary disabled:opacity-50">
      {isPending ? "Minting..." : "Mint Your SBT →"}
    </button>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GameBackground />
      <Sidebar />
      <TopBar />
      {/* Decorative logos */}
      <div className="fixed left-16 top-1/2 -translate-y-1/2 -translate-x-1/3 opacity-[0.05] pointer-events-none select-none">
        <Image src="/logo.png" alt="" width={380} height={380} className="object-contain" />
      </div>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.05] pointer-events-none select-none">
        <Image src="/arc-logo.png" alt="" width={380} height={380} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <main className="min-h-screen pl-16 pt-14 flex items-center justify-center px-4">{children}</main>
    </>
  );
}

function Spinner() {
  return <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />;
}
