import React from "react";
import { Voter, Candidate } from "../types";
import { ShieldCheck, LogOut, Heart, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface AlreadyVotedScreenProps {
  voter: Voter;
  allCandidates: Candidate[];
  onResetSession: () => void;
}

export default function AlreadyVotedScreen({
  voter,
  allCandidates,
  onResetSession,
}: AlreadyVotedScreenProps) {
  // Split voter.vote by comma, and find matching candidates
  const voteSubstrings = voter.vote
    ? voter.vote.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const matchedCandidates = voteSubstrings.map((v) => {
    const found = allCandidates.find(
      (c) =>
        c.id === v ||
        c.name.toLowerCase() === v.toLowerCase()
    );
    return found || v; // Keep as string if it's a raw name not found in candidates list
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center w-full text-white z-10 relative flex-1 py-4"
    >
      <div className="w-full max-w-sm glass-card-dark rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/10 text-center">
        {/* Tropical Ribbon Accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Security Badge Warning Icon */}
        <div className="mx-auto bg-amber-500/10 border-2 border-amber-400/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <ShieldCheck className="w-12 h-12 text-amber-400" />
        </div>

        <h3 className="font-display font-bold text-xl text-white tracking-wide uppercase">
          ALREADY VOTED
        </h3>
        
        <p className="text-sm text-slate-300 mt-3 font-sans max-w-xs mx-auto leading-relaxed">
          Hi, <span className="text-amber-200 font-bold">{voter.name}</span>!<br />
          Our systems show you have already cast your ballot.
        </p>

        {/* Matched / Show Voting Choice layout */}
        <div className="mt-6 text-left border-y border-white/10 py-5 space-y-3">
          <h4 className="text-xs font-display font-bold tracking-wider text-amber-200/80 uppercase">
            🌺 YOUR CASTED SELECTIONS
          </h4>

          {matchedCandidates.length > 0 ? (
            <div className="space-y-2.5">
              {matchedCandidates.map((item, index) => {
                const isCandidateObj = typeof item !== "string";
                if (isCandidateObj) {
                  const cand = item as Candidate;
                  return (
                    <div key={cand.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                      {cand.photoUrl ? (
                        <img
                          src={cand.photoUrl}
                          alt={cand.name}
                          className="w-12 h-12 object-contain rounded-xl border border-white/20 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-400/20 shadow-md shrink-0">
                          <span className="font-display font-medium text-amber-300 text-sm">
                            {cand.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate text-white">
                          {cand.name}
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          {cand.gender === "F" ? "Female Choice" : cand.gender === "M" ? "Male Choice" : "Candidate Selection"}
                        </div>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 rounded-full p-2 flex items-center justify-center">
                        <Heart className="w-4 h-4 fill-emerald-300 text-emerald-300" />
                      </div>
                    </div>
                  );
                } else {
                  const nameStr = item as string;
                  return (
                    <div key={index} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                      <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-2">
                        <Sparkles className="w-6 h-6 text-amber-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate text-white">
                          {nameStr}
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          Custom Entry / Write-in
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-orange-300/80 italic p-3 bg-orange-500/5 rounded-2xl border border-orange-500/10">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Casted ballot choices not specified in the records.</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
