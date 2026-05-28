import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Candidate } from "../types";
import { Heart, Check, Sparkles, AlertCircle, ChevronLeft, ChevronRight, User } from "lucide-react";

interface TinderCardsProps {
  candidates: Candidate[];
  votedCandidates: Record<string, boolean>;
  onMarkVote: (candidateId: string, isVoted: boolean) => void;
  onSubmitVote: () => Promise<boolean>;
  onExplosionComplete: () => void;
  onClearError: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export default function TinderCards({
  candidates,
  votedCandidates,
  onMarkVote,
  onSubmitVote,
  onExplosionComplete,
  onClearError,
  isSubmitting,
  submitError,
}: TinderCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isExploding, setIsExploding] = useState(false);
  const [isContainerShaking, setIsContainerShaking] = useState(false);

  // Setup dual category filter tags
  const hasFemale = candidates.some((c) => (c.gender || "M") === "F");
  const hasMale = candidates.some((c) => (c.gender || "M") === "M");

  const [selectedGender, setSelectedGender] = useState<"F" | "M">("F");

  // Keep chosen gender valid dynamically in sandboxed runs
  useEffect(() => {
    if (!hasFemale && hasMale) {
      setSelectedGender("M");
    } else if (hasFemale && !hasMale) {
      setSelectedGender("F");
    }
  }, [hasFemale, hasMale]);

  const filteredCandidates = candidates.filter(
    (c) => (c.gender || "M") === selectedGender
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);

  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startEmberExplosion = (targetX: number, targetY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    } else {
      canvas.width = 380;
      canvas.height = 600;
    }

    const particles: any[] = [];
    const colors = [
      "rgba(249, 115, 22, ",  // Brand orange
      "rgba(245, 158, 11, ",  // Brand amber
      "rgba(239, 68, 68, ",   // Lava red
      "rgba(253, 224, 71, ",  // Sunflower yellow
      "rgba(255, 255, 255, ", // Bright spark white
    ];

    // Spawn 80 explosive warm ember particles
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 9.0;
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: targetX,
        y: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1 + Math.random() * 3.5,
        colorBase,
        alpha: 1.0,
        decay: 0.012 + Math.random() * 0.018,
        gravity: -0.07, // Floating upward draft
        wind: (Math.random() - 0.5) * 0.25,
      });
    }

    particlesRef.current = particles;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const activeParticles = particlesRef.current;

      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const p = activeParticles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Apply drag/friction deceleration
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Apply gravity (rising heat) and slight wind drift
        p.vy += p.gravity;
        p.vx += p.wind + (Math.random() - 0.5) * 0.15;

        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          activeParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.colorBase + "1.0)";
        ctx.fillStyle = p.colorBase + p.alpha.toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (activeParticles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    tick();
  };

  const handleSubmitBallot = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isExploding || isSubmitting) return;

    // Trigger API call - showing spinner and loading animation on button
    const success = await onSubmitVote();

    if (success) {
      setIsExploding(true);
      setIsContainerShaking(true);

      const btn = buttonRef.current;
      const container = containerRef.current;
      if (btn && container) {
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const x = btnRect.left - containerRect.left + btnRect.width / 2;
        const y = btnRect.top - containerRect.top + btnRect.height / 2;
        startEmberExplosion(x, y);
      } else {
        startEmberExplosion(180, 520);
      }

      // Trigger transition to status screen after explosion finishes
      setTimeout(() => {
        onExplosionComplete();
      }, 980);
    } else {
      // API call failed: keep button active. Shake the container to make it feel visceral
      setIsContainerShaking(true);
      setTimeout(() => {
        setIsContainerShaking(false);
      }, 500);
    }
  };

  if (!candidates || candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-white/50 w-full animate-pulse">
        <AlertCircle className="w-8 h-8 text-amber-300 mb-2" />
        <p className="text-sm">No nominee entries found.</p>
      </div>
    );
  }

  const normalizedIndex = filteredCandidates.length > 0
    ? currentIndex % filteredCandidates.length
    : 0;

  const activeCandidate = filteredCandidates.length > 0
    ? filteredCandidates[normalizedIndex]
    : null;

  const isVoted = activeCandidate ? !!votedCandidates[activeCandidate.id] : false;

  const handleNext = () => {
    onClearError();
    setDirection("right");
    if (filteredCandidates.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredCandidates.length);
    }
  };

  const handlePrev = () => {
    onClearError();
    setDirection("left");
    if (filteredCandidates.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + filteredCandidates.length) % filteredCandidates.length);
    }
  };

  const handleToggleVote = () => {
    onClearError();
    if (activeCandidate) {
      onMarkVote(activeCandidate.id, !isVoted);
    }
  };

  // Find which candidate is currently voted for in each category
  const votedFemaleCandidate = candidates.find(
    (c) => (c.gender || "M") === "F" && !!votedCandidates[c.id]
  );
  const votedMaleCandidate = candidates.find(
    (c) => (c.gender || "M") === "M" && !!votedCandidates[c.id]
  );

  const votedCandidateCount = Object.keys(votedCandidates).filter((id) => votedCandidates[id]).length;
  const votedCandidate = votedFemaleCandidate || votedMaleCandidate || null;

  // Animation variants for smooth horizontal sliding
  const slideVariants = {
    enter: (dir: "left" | "right") => ({
      x: dir === "left" ? -280 : 280,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 26 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: "left" | "right") => ({
      x: dir === "left" ? 280 : -280,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 26 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <motion.div
      ref={containerRef}
      animate={
        isContainerShaking
          ? {
              x: [0, -6, 6, -5, 5, -3, 3, -1, 1, 0],
              scale: [1, 1.02, 0.99, 1.01, 1],
            }
          : { x: 0, scale: 1 }
      }
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-start gap-1 w-full flex-1 max-w-sm mx-auto z-10 relative overflow-hidden px-1"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-50 rounded-2xl"
      />

      {/* Category Selection segmented tab bar */}
      <div className="w-full grid grid-cols-2 gap-1.5 p-1 bg-white/5 border border-white/10 rounded-2xl mb-1.5 text-xs text-white">
        <button
          onClick={() => {
            onClearError();
            setSelectedGender("F");
            setCurrentIndex(0);
          }}
          className={`py-2 px-1 rounded-xl font-display font-bold tracking-wide transition-all flex flex-col items-center justify-center gap-0.5 whitespace-nowrap cursor-pointer ${
            selectedGender === "F"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-[1.02]"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>Female Nominees (F)</span>
          {votedFemaleCandidate ? (
            <span className="text-[9px] text-amber-200 font-sans font-medium max-w-[150px] truncate leading-none">
              ★ {votedFemaleCandidate.name.split(" ")[0]}
            </span>
          ) : (
            <span className="text-[8px] text-white/30 italic font-sans font-normal leading-none">Not selected</span>
          )}
        </button>
        <button
          onClick={() => {
            onClearError();
            setSelectedGender("M");
            setCurrentIndex(0);
          }}
          className={`py-2 px-1 rounded-xl font-display font-bold tracking-wide transition-all flex flex-col items-center justify-center gap-0.5 whitespace-nowrap cursor-pointer ${
            selectedGender === "M"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-[1.02]"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>Male Nominees (M)</span>
          {votedMaleCandidate ? (
            <span className="text-[9px] text-amber-200 font-sans font-medium max-w-[150px] truncate leading-none">
              ★ {votedMaleCandidate.name.split(" ")[0]}
            </span>
          ) : (
            <span className="text-[8px] text-white/30 italic font-sans font-normal leading-none">Not selected</span>
          )}
        </button>
      </div>

      {/* Main Carousel Swipeable Card Window */}
      <div className="relative w-full aspect-[4/5] max-h-[300px] sm:max-h-[340px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-slate-950/20 border border-white/10 shadow-inner">
        {filteredCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-white/50 w-full min-h-[260px]">
            <AlertCircle className="w-8 h-8 text-amber-300 mb-2" />
            <p className="text-sm font-display">No entries found in this category.</p>
          </div>
        ) : activeCandidate ? (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeCandidate.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(_, info) => {
                if (info.offset.x > 50) {
                  handlePrev();
                } else if (info.offset.x < -50) {
                  handleNext();
                }
              }}
              className="absolute w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-end cursor-grab active:cursor-grabbing touch-none bg-slate-900 border border-white/15"
            >
              {/* Direct Picture with support for slow connection error previews */}
              {activeCandidate.photoUrl ? (
                <img
                  src={activeCandidate.photoUrl}
                  alt={activeCandidate.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onError={(e) => {
                    // Fallback if image fails to resolve or reaches rate limit
                    e.currentTarget.style.display = "none";
                    const sib = e.currentTarget.nextElementSibling as HTMLElement;
                    if (sib) sib.style.display = "flex";
                  }}
                />
              ) : null}

              {/* Premium Fallback/Alternative avatar visualization if photoUrl is broken or empty */}
              <div 
                style={{ display: activeCandidate.photoUrl ? "none" : "flex" }}
                className="absolute inset-0 bg-gradient-to-br from-slate-900 via-orange-950/30 to-slate-900 flex-col items-center justify-center p-6 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-400/20 mb-2 animate-pulse">
                  <User className="w-7 h-7 text-orange-400" />
                </div>
                <p className="text-sm font-semibold text-white">{activeCandidate.name}</p>
                <p className="text-xs text-orange-200/40 mt-1">Photo Loading...</p>
              </div>

              {/* Gradient Overlay for aesthetic text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/25 pointer-events-none" />

              {/* Absolute interactive Glowing Heart button inside the Card */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVote();
                }}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border cursor-pointer active:scale-95 ${
                  isVoted
                    ? "bg-rose-500 text-white border-rose-400 scale-105"
                    : "bg-black/40 text-white/90 border-white/20 hover:bg-black/60 hover:border-rose-400/50"
                }`}
                title={isVoted ? "Remove Choice" : "Vote Choice"}
              >
                <Heart
                  className={`w-6 h-6 transition-transform duration-300 ${
                    isVoted ? "fill-white scale-110" : "fill-transparent group-hover:scale-110"
                  }`}
                />
              </button>

              {/* Voted success badge */}
              {isVoted && (
                <div className="absolute top-4 left-4 bg-amber-400 text-slate-950 font-display font-bold px-3 py-1 rounded-full text-[10px] flex items-center gap-1 shadow-lg border border-white/20">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>MY CHOICE</span>
                </div>
              )}

              {/* Candidate Info Badge Label */}
              <div className="p-4 text-left relative z-10 select-none">
                <span className="text-[10px] font-display font-bold tracking-widest bg-orange-500/80 text-white rounded-full px-2.5 py-0.5 uppercase inline-block mb-1.5 shadow-sm">
                  {selectedGender === "F" ? "Female" : "Male"} Nominee #{normalizedIndex + 1}
                </span>
                <h3 className="font-display font-bold text-lg text-white drop-shadow-md leading-tight">
                  {activeCandidate.name}
                </h3>
                <p className="text-[10px] text-amber-200/70 mt-0.5 font-sans">
                  Tap heart inside or click to vote • Swipe left/right to view entries
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>

      {/* Simplified Indicator Dots & Carousel Arrows */}
      <div className="flex items-center justify-between w-full mt-1.5 px-1">
        <button
          onClick={handlePrev}
          className="p-1 px-2 border border-white/10 hover:border-orange-400/40 bg-white/5 text-orange-200 hover:text-white rounded-xl transition-all cursor-pointer shadow-md active:scale-95 text-xs flex items-center justify-center"
          title="Previous Participant"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dynamic progress bar dots aligned to category */}
        <div className="flex items-center justify-center gap-1.5 max-w-[150px] overflow-hidden">
          {filteredCandidates.map((cand, idx) => {
            const hasVotedThis = !!votedCandidates[cand.id];
            return (
              <button
                key={cand.id}
                onClick={() => {
                  onClearError();
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === normalizedIndex
                    ? "bg-amber-400 w-4"
                    : hasVotedThis
                    ? "bg-rose-500"
                    : "bg-white/20 hover:bg-white/45"
                }`}
              />
            );
          })}
        </div>

        <button
          onClick={handleNext}
          className="p-1 px-2 border border-white/10 hover:border-orange-400/40 bg-white/5 text-orange-200 hover:text-white rounded-xl transition-all cursor-pointer shadow-md active:scale-95 text-xs flex items-center justify-center"
          title="Next Participant"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Selections Summary overview rack */}
      <div className="w-full mt-2 p-2 rounded-xl bg-slate-900/40 border border-white/5 text-[10px] flex flex-col gap-1 text-white/70">
        <div className="flex items-center justify-between">
          <span>Female Nomination choice:</span>
          {votedFemaleCandidate ? (
            <span className="text-emerald-300 font-semibold flex items-center gap-1 text-[11px]">
              <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
              {votedFemaleCandidate.name}
            </span>
          ) : (
            <span className="text-white/30 italic">None selected (swipe and tap heart)</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span>Male Nomination choice:</span>
          {votedMaleCandidate ? (
            <span className="text-emerald-300 font-semibold flex items-center gap-1 text-[11px]">
              <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
              {votedMaleCandidate.name}
            </span>
          ) : (
            <span className="text-white/30 italic">None selected (swipe and tap heart)</span>
          )}
        </div>
      </div>

      {/* Primary Final Submit Button Panel */}
      <div className="w-full mt-2 pb-1 flex flex-col gap-2">
        {submitError && (
          <div className="text-center py-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 flex items-center justify-center gap-1.5 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-semibold text-left text-[11px] leading-tight text-rose-200">
              {submitError} (Change choice or tap to retry)
            </span>
          </div>
        )}

        {!votedCandidate ? (
          <div className="text-center py-2 text-xs text-orange-200/50 flex items-center justify-center gap-1.5 bg-slate-950/20 rounded-xl px-3 border border-dashed border-orange-400/10">
            <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>Vote for at least one nominee to unlock posting</span>
          </div>
        ) : (
          <motion.button
            ref={buttonRef}
            onClick={handleSubmitBallot}
            disabled={isSubmitting || isExploding}
            animate={isExploding ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-display font-medium text-white text-sm py-2.5 px-6 rounded-xl shadow-xl hover:shadow-orange-500/10 transition-all text-center flex items-center justify-center gap-2 font-bold cursor-pointer relative overflow-hidden disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isSubmitting || isExploding ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>TRANSMITTING BALLOT...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Submit My Ballot ({votedCandidateCount} {votedCandidateCount === 1 ? 'Vote' : 'Votes'})</span>
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
