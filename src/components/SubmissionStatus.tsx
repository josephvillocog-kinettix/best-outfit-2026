import { Voter, Candidate } from "../types";
import { CheckCircle2, LogOut, ArrowRight, Sparkles, Heart } from "lucide-react";

interface SubmissionStatusProps {
  voter: Voter;
  votedCandidateIds: string[];
  allCandidates: Candidate[];
  onResetSession: () => void;
  message?: string;
}

export default function SubmissionStatus({
  voter,
  votedCandidateIds,
  allCandidates,
  onResetSession,
  message,
}: SubmissionStatusProps) {
  // Find full records of candidates which are voted
  const votedCandidates = allCandidates.filter((c) => votedCandidateIds.includes(c.id));

  return (
    <div className="flex flex-col items-center justify-center w-full text-white z-10 relative flex-1 py-4">
      <div className="w-full max-w-sm glass-card-dark rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/10 text-center">
        
        {/* Confetti-style decorative lighting */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-amber-300" />
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

        {/* Celebration Tick Icon */}
        <div className="mx-auto bg-emerald-500/15 border-2 border-emerald-400/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </div>

        <h3 className="font-display font-bold text-xl text-white tracking-wide uppercase">
          VOTE CASTED!
        </h3>
        <p className="text-sm text-emerald-100/70 mt-2 font-sans max-w-xs mx-auto leading-relaxed">
          Hi, <span className="text-amber-200 font-bold">{voter.name}</span>! Your selection have been securely processed.
        </p>

  

        {/* Selected List Confirmation */}
        <div className="mt-6 text-left border-y border-white/10 py-5 space-y-3">
          <h4 className="text-xs font-display font-bold tracking-wider text-amber-200/80 uppercase">
            🌺 You voted for
          </h4>
          
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {votedCandidates.length > 0 ? (
              votedCandidates.map((cand) => (
                <div 
                  key={cand.id} 
                  className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <img
                    src={cand.photoUrl}
                    alt={cand.name}
                    className="w-10 h-10 object-cover rounded-lg border border-white/20"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate text-white">{cand.name}</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 rounded-full p-1.5 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-white/40 italic">No outfits marked.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
