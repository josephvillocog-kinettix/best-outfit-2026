import React from "react";
import { motion } from "motion/react";
import { Calendar, Palmtree, Sparkles } from "lucide-react";

interface VotingClosedScreenProps {
  onLogout?: () => void;
}

export default function VotingClosedScreen({ onLogout }: VotingClosedScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center w-full text-white z-10 relative flex-1 py-8 px-4"
    >
      <div className="w-full max-w-sm glass-card-dark rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-white/10 text-center bg-slate-950/40 backdrop-blur-xl">
        {/* Decorative Top Accent Ribbon */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-orange-400 to-amber-300" />
        
        {/* Soft Ambient Orbs */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />

        {/* Animated Custom Icon Container utilizing /assets/Asset_10.png */}
        <div className="relative mx-auto w-28 h-28 mb-6 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: [1, 1.08, 1], opacity: 1 }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-amber-500/10 border border-amber-400/20 rounded-full flex items-center justify-center"
          />
          <motion.div
            animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative z-10 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-400/30 p-2 rounded-2xl flex items-center justify-center overflow-hidden backdrop-blur-sm"
          >
            <img
              src="/assets/Asset_10.png"
              alt="Kinettix Outing Icon"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(251,191,36,0.3)] animate-pulse"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {/* Decorative Sparkles moving around */}
          <Sparkles className="w-5 h-5 text-orange-400 absolute top-0 right-2 animate-ping" />
          <Sparkles className="w-4 h-4 text-amber-200 absolute bottom-1 left-2 animate-pulse" />
        </div>

        {/* Closed Announcement */}
        <h3 className="font-display font-black text-2xl text-white tracking-wide uppercase leading-tight mb-2">
          VOTING CLOSED
        </h3>
        
        <div className="w-12 h-1 bg-amber-400/50 mx-auto rounded-full mb-4" />

        <p className="text-sm text-amber-100/70 font-sans max-w-xs mx-auto leading-relaxed mb-6">
          <strong>Kinettix Summer Outing 2026</strong>!<br />
          Please wait for the announcement.
        </p>

        {/* Modern Stats / Info Row */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left space-y-3.5 mb-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1 bg-amber-500/10 border-b border-l border-white/5 text-[8px] text-amber-300 font-mono uppercase rounded-bl-lg">
            Final Audit
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-orange-200/50 block leading-none tracking-wider mb-1">
                Scheduled End Time
              </span>
              <span className="text-xs font-medium text-white block">
                Closed on Scheduled Outing Timeline
              </span>
            </div>
          </div>
          
          <div className="flex items-start gap-3 border-t border-white/5 pt-3">
            <Palmtree className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-orange-200/50 block leading-none tracking-wider mb-1">
                Results Release
              </span>
              <span className="text-xs font-medium text-amber-200 block">
                Stay tuned for the voting and winner reveal!
              </span>
            </div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="mt-6 w-full cursor-pointer hover:bg-white/10 active:bg-white/15 text-orange-200 hover:text-white transition-all text-xs font-display font-medium py-3 px-4 rounded-xl border border-white/10 flex items-center justify-center gap-2 shadow-inner"
          >
            Switch Account / Sign Out
          </button>
        )}
      </div>
    </motion.div>
  );
}
