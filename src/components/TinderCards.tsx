import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Candidate } from "../types";
import { Heart, Check, Sparkles, AlertCircle, ChevronLeft, ChevronRight, User } from "lucide-react";

interface TinderCardsProps {
  candidates: Candidate[];
  votedCandidates: Record<string, boolean>;
  onMarkVote: (candidateId: string, isVoted: boolean) => void;
  onSubmitVote: () => void;
  isSubmitting: boolean;
}

export default function TinderCards({
  candidates,
  votedCandidates,
  onMarkVote,
  onSubmitVote,
  isSubmitting,
}: TinderCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  if (!candidates || candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-white/50 w-full">
        <AlertCircle className="w-8 h-8 text-amber-300 mb-2" />
        <p className="text-sm">No nominee entries found.</p>
      </div>
    );
  }

  const activeCandidate = candidates[currentIndex];
  const isVoted = !!votedCandidates[activeCandidate.id];

  const handleNext = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % candidates.length);
  };

  const handlePrev = () => {
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
  };

  const handleToggleVote = () => {
    onMarkVote(activeCandidate.id, !isVoted);
  };

  // Find which candidate is currently voted (if any)
  const votedCandidateId = Object.entries(votedCandidates).find(([_, voted]) => voted)?.[0];
  const votedCandidate = votedCandidateId ? candidates.find((c) => c.id === votedCandidateId) : null;

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
    <div className="flex flex-col items-center justify-between w-full flex-1 max-w-sm mx-auto z-10 relative overflow-hidden px-1">
      
      {/* Active State Shelf Header */}
      <div className="w-full text-center py-2 px-3.5 rounded-xl glass-banner text-xs flex justify-between items-center mb-3 border border-white/10 bg-white/5">
        <div className="flex items-center gap-1.5 text-orange-200">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="font-display font-semibold">Outfit Entry:</span>
          <span className="text-white font-bold font-mono">
            {currentIndex + 1} of {candidates.length}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-orange-500/10 text-amber-200 font-bold font-display px-2 py-0.5 rounded-full border border-orange-400/20">
          <Sparkles className="w-3 h-3 text-orange-400" />
          <span>{votedCandidate ? "1 Vote Set" : "0 Votes Set"}</span>
        </div>
      </div>

      {/* Main Carousel Swipeable Card Window */}
      <div className="relative w-full aspect-[4/5] max-h-[350px] sm:max-h-[380px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-slate-950/20 border border-white/10 shadow-inner">
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
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-400/20 mb-3 animate-pulse">
                <User className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-sm font-semibold text-white">{activeCandidate.name}</p>
              <p className="text-xs text-orange-200/40 mt-1">Photo Loading / Private Direct Link</p>
            </div>

            {/* Gradient Overlay for aesthetic text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/25 pointer-events-none" />

            {/* Absolute interactive Glowing Heart button inside the Card */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVote();
              }}
              className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border cursor-pointer active:scale-90 ${
                isVoted
                  ? "bg-rose-500 text-white border-rose-400 animate-pulse scale-105"
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
                Candidate Entry #{currentIndex + 1}
              </span>
              <h3 className="font-display font-bold text-xl text-white drop-shadow-md leading-tight">
                {activeCandidate.name}
              </h3>
              <p className="text-[10px] text-amber-200/70 mt-0.5 font-sans">
                Tap heart inside or click to vote • Swipe left/right to view entries
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Simplified Indicator Dots & Carousel Arrows */}
      <div className="flex items-center justify-between w-full mt-3 px-1">
        <button
          onClick={handlePrev}
          className="p-2 border border-white/10 hover:border-orange-400/40 bg-white/5 text-orange-200 hover:text-white rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
          title="Previous Participant"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dynamic progress bar dots */}
        <div className="flex items-center justify-center gap-1.5 max-w-[150px] overflow-hidden">
          {candidates.map((cand, idx) => {
            const hasVotedThis = !!votedCandidates[cand.id];
            return (
              <button
                key={cand.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
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
          className="p-2 border border-white/10 hover:border-orange-400/40 bg-white/5 text-orange-200 hover:text-white rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
          title="Next Participant"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Show active Choice Reminder if voted on a different card */}
      <div className="w-full mt-2 text-center h-5">
        {votedCandidate && votedCandidate.id !== activeCandidate.id ? (
          <p className="text-[10px] text-emerald-300 font-sans tracking-wide">
            ★ Currently selected: <span className="font-semibold text-white">{votedCandidate.name}</span>
          </p>
        ) : isVoted ? (
          <p className="text-[10px] text-amber-300 font-sans tracking-wide">
            ★ You are supporting this outfit entry!
          </p>
        ) : (
          <p className="text-[10px] text-white/40 font-sans">
            Swipe or use arrows to compare candidates
          </p>
        )}
      </div>

      {/* Primary Final Submit Button Panel */}
      <div className="w-full mt-2.5 pb-2">
        {!votedCandidate ? (
          <div className="text-center py-2 text-xs text-orange-200/50 flex items-center justify-center gap-1.5 bg-slate-950/20 rounded-xl px-3 border border-dashed border-orange-400/10">
            <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>Select one favorite outfit to submit</span>
          </div>
        ) : (
          <button
            onClick={onSubmitVote}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-display font-medium text-white text-base py-3 px-6 rounded-xl shadow-xl hover:shadow-orange-500/10 transform hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 font-bold cursor-pointer relative overflow-hidden"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>TRANSMITTING BALLOT...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-white" />
                <span>Submit My Ballot</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
