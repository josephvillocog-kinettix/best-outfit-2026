import React, { useState, useMemo } from "react";
import { Candidate, Voter } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  Users, 
  RefreshCw, 
  Search, 
  Crown, 
  TrendingUp, 
  LogOut, 
  Heart, 
  Check, 
  Grid, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface AdminPanelProps {
  candidates: Candidate[];
  voters: Voter[];
  onLogout: () => void;
  onRefresh: () => Promise<void>;
}

export default function AdminPanel({
  candidates,
  voters,
  onLogout,
  onRefresh
}: AdminPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [voterFilter, setVoterFilter] = useState<"all" | "voted" | "pending">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "F" | "M">("all");
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<"all" | "F" | "M" | "write-in">("all");

  const handleRefreshClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 800);
    }
  };

  // Compile vote tallies by candidate name/id
  const voteTallies = useMemo(() => {
    const tallies: Record<string, { 
      candidateId: string;
      candidateName: string; 
      gender?: string;
      photoUrl?: string; 
      isRegistered: boolean;
      votes: number;
      voterDetails: { id: string; name: string }[];
    }> = {};

    // Initialize with registered candidates
    candidates.forEach((c) => {
      tallies[c.name.toLowerCase()] = {
        candidateId: c.id,
        candidateName: c.name,
        gender: c.gender || "M",
        photoUrl: c.photoUrl,
        isRegistered: true,
        votes: 0,
        voterDetails: []
      };
    });

    // Populate with actual votes
    let totalVotesCounted = 0;
    voters.forEach((v) => {
      if (!v.vote) return;
      
      // Support double comma separated votes (Female, Male)
      const parts = v.vote.split(",").map((p) => p.trim()).filter(Boolean);
      
      parts.forEach((part) => {
        const lowerPart = part.toLowerCase();
        
        // Find matching registered candidate by ID or Name
        const matchedCand = candidates.find(
          (c) => c.id === part || c.name.toLowerCase() === lowerPart
        );

        const key = matchedCand ? matchedCand.name.toLowerCase() : lowerPart;
        totalVotesCounted++;

        if (tallies[key]) {
          tallies[key].votes += 1;
          tallies[key].voterDetails.push({ id: v.id, name: v.name });
        } else {
          // Write-in entry not found in candidate list
          tallies[key] = {
            candidateId: `writein-${part}`,
            candidateName: part,
            isRegistered: false,
            votes: 1,
            voterDetails: [{ id: v.id, name: v.name }]
          };
        }
      });
    });

    return {
      talliesList: Object.values(tallies),
      totalVotesCounted
    };
  }, [candidates, voters]);

  // Derived stats
  const stats = useMemo(() => {
    const list = voteTallies.talliesList;
    const totalVoters = voters.length;
    const votedVotersCount = voters.filter((v) => v.vote).length;
    const percentTurnout = totalVoters > 0 ? Math.round((votedVotersCount / totalVoters) * 100) : 0;

    // Filter female in registered candidates
    const femaleTallies = list.filter((t) => t.gender === "F" && t.isRegistered);
    const maleTallies = list.filter((t) => t.gender === "M" && t.isRegistered);

    // Sort descending by votes
    const topFemale = femaleTallies.sort((a, b) => b.votes - a.votes)[0] || null;
    const topMale = maleTallies.sort((a, b) => b.votes - a.votes)[0] || null;

    // Winner collage
    const overallLeader = [...list].sort((a, b) => b.votes - a.votes)[0] || null;

    return {
      totalVoters,
      votedVotersCount,
      percentTurnout,
      topFemale,
      topMale,
      overallLeader,
      list
    };
  }, [voteTallies, voters]);

  // Filter candidates leaderboard
  const filteredLeaderboard = useMemo(() => {
    let list = [...stats.list];
    
    if (activeLeaderboardTab === "F") {
      list = list.filter((t) => t.gender === "F" && t.isRegistered);
    } else if (activeLeaderboardTab === "M") {
      list = list.filter((t) => t.gender === "M" && t.isRegistered);
    } else if (activeLeaderboardTab === "write-in") {
      list = list.filter((t) => !t.isRegistered);
    }

    // Sort candidates descending by votes, then by name
    return list.sort((a, b) => {
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      return a.candidateName.localeCompare(b.candidateName);
    });
  }, [stats.list, activeLeaderboardTab]);

  // Filter voters list
  const filteredVoters = useMemo(() => {
    return voters.filter((v) => {
      const matchesSearch = 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.vote && v.vote.toLowerCase().includes(searchTerm.toLowerCase()));

      if (voterFilter === "voted") {
        return matchesSearch && !!v.vote;
      }
      if (voterFilter === "pending") {
        return matchesSearch && !v.vote;
      }
      return matchesSearch;
    });
  }, [voters, searchTerm, voterFilter]);

  return (
    <div className="w-full flex flex-col h-full text-white">
      
      {/* Mini Breadcrumb Admin bar */}
      <div className="flex items-center justify-between mb-4 bg-orange-500/10 border border-orange-400/20 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-display tracking-widest text-amber-200 font-bold block leading-none">
              Control Panel Secure
            </span>
            <span className="text-sm font-display font-medium text-white">
              Role: System Administrator
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
            title="Refresh from sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-orange-400" : ""}`} />
            <span className="hidden xs:inline">Refresh Sheet</span>
          </button>
          <button
            onClick={onLogout}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/25 active:scale-95 border border-rose-500/20 text-rose-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Log Out</span>
          </button>
        </div>
      </div>

      {/* Visual Image Grid Collage area of highest voted nominations */}
      <div className="bg-slate-900/40 p-4 rounded-3xl border border-white/10 mb-5 text-left">
        <div className="flex items-center gap-1.5 mb-3">
          <Grid className="w-4 h-4 text-orange-400" />
          <h3 className="text-xs font-display font-black tracking-wider text-amber-200 uppercase">
            🏆 Nominations Visual Collage
          </h3>
        </div>

        {/* Row of winners styled in grid format size proportionate to vote standing */}
        {stats.list.filter((t) => t.votes > 0).length === 0 ? (
          <div className="py-8 text-center text-white/30 border border-dashed border-white/10 rounded-2xl bg-slate-950/20 text-xs">
            <AlertCircle className="w-5 h-5 mx-auto mb-1 text-orange-400" />
            <span>Waiting for ballots to accumulate to show the collage.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {stats.list
              .filter((t) => t.votes > 0)
              .sort((a, b) => b.votes - a.votes)
              .slice(0, 6) // limit to top 6 in collage
              .map((item, index) => {
                const percent = voteTallies.totalVotesCounted > 0 
                  ? Math.round((item.votes / voteTallies.totalVotesCounted) * 100)
                  : 0;
                
                return (
                  <motion.div
                    key={item.candidateId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-video xs:aspect-[1.5] rounded-xl overflow-hidden border border-white/10 flex flex-col justify-end p-2.5 bg-slate-900 group shadow-lg"
                  >
                    {item.photoUrl ? (
                      <img 
                        src={item.photoUrl} 
                        alt={item.candidateName}
                        className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-orange-950/20 to-slate-950 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-orange-500/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent pointer-events-none" />
                    
                    {/* Position icon and percentage badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                      <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded text-[9px] leading-none shadow">
                        #{index + 1}
                      </span>
                      {index === 0 && (
                        <Crown className="w-3.5 h-3.5 text-amber-300 drop-shadow fill-amber-300" />
                      )}
                    </div>

                    <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-md text-[8px] font-mono text-emerald-300 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
                      {item.votes} {item.votes === 1 ? 'vote' : 'votes'}
                    </div>

                    <div className="relative z-10 leading-none">
                      <h4 className="font-display font-black text-[11px] text-white truncate drop-shadow">
                        {item.candidateName}
                      </h4>
                      <p className="text-[9px] text-orange-200/80 mt-1 font-mono">
                        {percent}% of overall votes
                      </p>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      {/* Analytics Bento Grid layout */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 mb-4">
        {/* Total Turnout Card */}
        <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-80 mb-1">
            <span className="text-[10px] text-orange-200/60 font-display font-bold tracking-wider uppercase">Voters Turnout</span>
            <Users className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.votedVotersCount} / {stats.totalVoters}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-full bg-slate-950/40 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.percentTurnout}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold shrink-0">{stats.percentTurnout}%</span>
            </div>
          </div>
        </div>

        {/* Top Female Winner summary card */}
        <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1 bg-rose-500/10 border-b border-l border-white/5 text-[9px] text-rose-300 font-display font-bold uppercase rounded-bl-lg">
            Female Leader (F)
          </div>
          <div className="flex items-center justify-between opacity-80 mb-1">
            <span className="text-[10px] text-orange-200/60 font-display font-bold tracking-wider uppercase">F Category</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          {stats.topFemale ? (
            <div className="flex items-center gap-2.5 mt-1.5">
              {stats.topFemale.photoUrl && (
                <img 
                  src={stats.topFemale.photoUrl} 
                  alt={stats.topFemale.candidateName}
                  className="w-10 h-10 object-contain rounded-lg border border-white/20"
                />
              )}
              <div className="min-w-0">
                <div className="text-xs font-black truncate text-white leading-tight">
                  {stats.topFemale.candidateName}
                </div>
                <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                  ★ {stats.topFemale.votes} {stats.topFemale.votes === 1 ? 'vote' : 'votes'}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-[10px] italic text-white/30">No votes cast yet</span>
          )}
        </div>

        {/* Top Male Winner summary card */}
        <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1 bg-amber-500/10 border-b border-l border-white/5 text-[9px] text-amber-300 font-display font-bold uppercase rounded-bl-lg">
            Male Leader (M)
          </div>
          <div className="flex items-center justify-between opacity-80 mb-1">
            <span className="text-[10px] text-orange-200/60 font-display font-bold tracking-wider uppercase">M Category</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          {stats.topMale ? (
            <div className="flex items-center gap-2.5 mt-1.5">
              {stats.topMale.photoUrl && (
                <img 
                  src={stats.topMale.photoUrl} 
                  alt={stats.topMale.candidateName}
                  className="w-10 h-10 object-contain rounded-lg border border-white/20"
                />
              )}
              <div className="min-w-0">
                <div className="text-xs font-black truncate text-white leading-tight">
                  {stats.topMale.candidateName}
                </div>
                <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                  ★ {stats.topMale.votes} {stats.topMale.votes === 1 ? 'vote' : 'votes'}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-[10px] italic text-white/30">No votes cast yet</span>
          )}
        </div>
      </div>

      {/* Main split sections: Leaderboard VS Voters Audit log */}
      <div className="space-y-4">
        
        {/* Candidates Live Standings Section */}
        <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-display font-black tracking-wider text-amber-200 uppercase">
                🏁 Candidate Nominees Standings
              </h3>
            </div>

            {/* Categorization controls */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-[10px] w-fit">
              <button
                onClick={() => setActiveLeaderboardTab("all")}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  activeLeaderboardTab === "all" ? "bg-orange-500 text-white font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveLeaderboardTab("F")}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  activeLeaderboardTab === "F" ? "bg-orange-500 text-white font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                Female (F)
              </button>
              <button
                onClick={() => setActiveLeaderboardTab("M")}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  activeLeaderboardTab === "M" ? "bg-orange-500 text-white font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                Male (M)
              </button>
              <button
                onClick={() => setActiveLeaderboardTab("write-in")}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  activeLeaderboardTab === "write-in" ? "bg-orange-500 text-white font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                Write-Ins
              </button>
            </div>
          </div>

          {/* Standings List */}
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {filteredLeaderboard.length === 0 ? (
              <p className="text-xs text-white/40 italic py-4 text-center">No nominees matches this filter</p>
            ) : (
              filteredLeaderboard.map((cand, idx) => {
                const highestVotedObjInTab = filteredLeaderboard[0];
                const maxVotes = highestVotedObjInTab ? highestVotedObjInTab.votes : 1;
                const ratioPercent = maxVotes > 0 ? (cand.votes / maxVotes) * 100 : 0;
                
                return (
                  <div key={cand.candidateId} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                    {cand.photoUrl && (
                      <img 
                        src={cand.photoUrl} 
                        alt={cand.candidateName}
                        className="w-10 h-10 object-contain rounded-lg border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs font-bold leading-none mb-1">
                        <span className="truncate text-white">{cand.candidateName}</span>
                        <span className="text-amber-200 font-mono text-[11px]">
                          ★ {cand.votes} {cand.votes === 1 ? 'vote' : 'votes'}
                        </span>
                      </div>
                      
                      {/* Stylized progress gauge proportional to leader */}
                      <div className="w-full bg-slate-950/40 h-2 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-300 rounded-full h-full transition-all duration-300"
                          style={{ width: `${Math.max(ratioPercent, cand.votes > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                      
                      {/* Voter triggers popup list if expanded */}
                      {cand.votes > 0 && (
                        <div className="text-[8px] text-white/40 mt-1 truncate">
                          Voted by: {cand.voterDetails.map((v) => v.name).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Voters Real-time Audit Table log */}
        <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-display font-black tracking-wider text-amber-200 uppercase">
                📜 Voter Registry & Audit Logs
              </h3>
            </div>

            {/* Voter Status toggle filters */}
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/5 text-[9px] w-fit">
              <button
                onClick={() => setVoterFilter("all")}
                className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                  voterFilter === "all" ? "bg-white/10 text-white font-bold" : "text-white/50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setVoterFilter("voted")}
                className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                  voterFilter === "voted" ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/20" : "text-white/50"
                }`}
              >
                Voted
              </button>
              <button
                onClick={() => setVoterFilter("pending")}
                className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                  voterFilter === "pending" ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/10" : "text-white/50"
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          {/* Search wrapper bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/35" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Voter ID, voter name, or ballot content..."
              className="w-full bg-slate-950/40 border border-white/10 focus:border-orange-500 text-xs rounded-xl pl-9 pr-4 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-sans"
            />
          </div>

          {/* Audit lists log content */}
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {filteredVoters.length === 0 ? (
              <p className="text-xs text-white/40 italic py-4 text-center">No voters match this search filter</p>
            ) : (
              filteredVoters.map((v) => (
                <div key={v.id} className="flex flex-col gap-1 bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs text-white transition-all hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-white">{v.name}</span>
                      <span className="font-mono text-[9px] text-orange-300 font-bold bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10">
                        KEY: {v.id}
                      </span>
                    </div>
                    {v.vote ? (
                      <span className="text-[9px] px-2 py-0.5 font-bold uppercase rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        Voted
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 font-medium uppercase rounded-full bg-slate-500/10 border border-white/5 text-white/40">
                        Pending
                      </span>
                    )}
                  </div>

                  {v.vote ? (
                    <div className="mt-1 text-[10px] text-amber-200/80 bg-white/5 p-1.5 rounded-lg border border-white/5">
                      <span className="font-medium text-white/40 block text-[8px] uppercase tracking-wider mb-0.5">Casted Selection</span>
                      <span className="font-sans font-bold text-amber-100">{v.vote}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-white/20 italic mt-0.5">Has not unlocked voting booth yet.</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
