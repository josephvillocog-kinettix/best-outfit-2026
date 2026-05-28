import { useEffect, useState } from "react";
import { Candidate, Voter, VoteState } from "./types";
import { FALLBACK_CANDIDATES, FALLBACK_VOTERS } from "./data/fallbackData";

// Components
import EmberEffect from "./components/EmberEffect";
import LoadingScreen from "./components/LoadingScreen";
import LoginScreen from "./components/LoginScreen";
import TinderCards from "./components/TinderCards";
import SubmissionStatus from "./components/SubmissionStatus";
import AlreadyVotedScreen from "./components/AlreadyVotedScreen";

// Icons
import { Palmtree, Flame, Award, Heart, ShieldCheck, LogOut } from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [activeVoter, setActiveVoter] = useState<Voter | null>(null);
  
  // App states
  const [votedCandidates, setVotedCandidates] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Helper to convert Google Drive share links into direct raw image render URLs
  const convertDriveUrl = (url: string): string => {
    if (!url) return "";
    const trimUrl = url.trim();
    
    // Pattern to catch drive.google.com/file/d/{FILE_ID}
    const driveFileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
    const fileMatch = trimUrl.match(driveFileRegex);
    if (fileMatch && fileMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
    }

    // Pattern to catch drive.google.com/open?id={FILE_ID} or uc?id={FILE_ID}
    if (trimUrl.includes("drive.google.com")) {
      const idMatch = trimUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
      if (idMatch && idMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
      }
    }
    
    return trimUrl;
  };

  // Normalizer to format Google Apps response data cleanly
  const normalizeData = (data: any) => {
    console.log("Parsing Google Sheet doGet response:", data);
    
    let rawCandidates: any[] = [];
    let rawVoters: any[] = [];

    // Accommodate key variations like uppercase, nested objects, or different naming conventions
    if (data) {
      if (Array.isArray(data.candidates)) {
        rawCandidates = data.candidates;
      } else if (Array.isArray(data.items)) {
        rawCandidates = data.items;
      } else if (Array.isArray(data.data)) {
        rawCandidates = data.data;
      }

      if (Array.isArray(data.voters)) {
        rawVoters = data.voters;
      } else if (Array.isArray(data.users)) {
        rawVoters = data.users;
      }
    }

    // Safely map Candidates
    const parsedCandidates: Candidate[] = rawCandidates.map((c: any, index: number) => {
      // Find candidate name
      const name = c.name || c.Name || c.candidateName || c.Title || `Contestant ${index + 1}`;
      
      // Find photoUrl supporting multiple common labels
      const rawPhoto = c.photoUrl || c.photo_url || c.photo || c.Photo || c["photo url"] || "";
      const photoUrl = convertDriveUrl(rawPhoto);
      
      // Find id
      const id = String(c.id || c.ID || index + 1);

      return { id, name, photoUrl };
    }).filter((c) => c.name && c.photoUrl); // ensure valid entry records

    // Safely map Voters
    const parsedVoters: Voter[] = rawVoters.map((v: any, index: number) => {
      const id = String(v.id || v.ID || v.voterId || "");
      const name = v.name || v.Name || v.voterName || `Voter ${id || index + 1}`;
      const vote = v.vote ?? v.Vote ?? v.voted ?? v.votedCandidate ?? v.candidate ?? v.voted_candidate ?? "";
      return { id, name, vote: vote ? String(vote).trim() : undefined };
    }).filter((v) => v.id);

    return { parsedCandidates, parsedVoters };
  };

  useEffect(() => {
    async function initFetch() {
      try {
        console.log("Triggering fetch to backend proxy GET /api/data...");
        const response = await fetch("/api/data");
        
        if (!response.ok) {
          throw new Error(`API GET status response failed with: ${response.status}`);
        }

        const data = await response.json();
        const { parsedCandidates, parsedVoters } = normalizeData(data);

        // Fallback checks if the parsed values are empty or malformed
        setCandidates(parsedCandidates.length > 0 ? parsedCandidates : FALLBACK_CANDIDATES);
        setVoters(parsedVoters.length > 0 ? parsedVoters : FALLBACK_VOTERS);

      } catch (err) {
        console.error("API GET failed. Swapping to high quality sandbox fallbacks.", err);
        setCandidates(FALLBACK_CANDIDATES);
        setVoters(FALLBACK_VOTERS);
      } finally {
        // Enforce a friendly loading delay so the animations play smoothly
        const delayTimer = setTimeout(() => {
          setLoading(false);
        }, 1500);
        return () => clearTimeout(delayTimer);
      }
    }

    initFetch();
  }, []);

  // Update a single mark state - enforcing that the user can only vote for exactly one candidate
  const handleMarkVote = (candidateId: string, isVoted: boolean) => {
    setVotedCandidates((prev) => {
      if (isVoted) {
        // Clear all previous choices and vote only for the current one
        return { [candidateId]: true };
      } else {
        // Deselect current choice
        return {};
      }
    });
  };

  // Submit the selected votes
  const handleSubmitVote = async (): Promise<boolean> => {
    if (!activeVoter) return false;

    // Compile list of voted candidates
    const votedList = Object.entries(votedCandidates)
      .filter(([_, isVoted]) => isVoted)
      .map(([id]) => {
        const match = candidates.find((c) => c.id === id);
        return match ? match.name : id;
      });

    if (votedList.length === 0) {
      alert("Please vote for one candidate before submitting!");
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const votedCandidateId = Object.entries(votedCandidates).find(([_, voted]) => voted)?.[0];
    const votedCandidate = votedCandidateId ? candidates.find((c) => c.id === votedCandidateId) : null;
    const candidateId = votedCandidate ? votedCandidate.id : "";
    const candidateName = votedCandidate ? votedCandidate.name : "";

    try {
      console.log("Posting ballot selections to server API `/api/vote`...", {
        voterId: activeVoter.id,
        voterName: activeVoter.name,
        candidateId,
        candidateName,
      });

      // Pass the voter's ID as 'id' and the candidate's name as 'name' parameters in json format as requested.
      const payloadBody = {
        id: activeVoter.id,           // voter's id
        name: candidateName,          // candidate's name
        candidateId,                  // explicit candidate id
        candidateName,                // explicit candidate name
        voterId: activeVoter.id,      // voter's id
        voterName: activeVoter.name,  // voter's name
        votedList,
      };

      const res = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadBody),
      });

      const result = await res.json();
      console.log("Post submission server result:", result);

      const completedVoteValue = candidateName || candidateId;

      if (res.ok && result.success) {
        setSubmitMessage(result.data || "Vote registered successfully!");
        if (completedVoteValue) {
          setActiveVoter((prev) => (prev ? { ...prev, vote: completedVoteValue } : null));
          setVoters((prevList) =>
            prevList.map((v) =>
              v.id === activeVoter.id ? { ...v, vote: completedVoteValue } : v
            )
          );
        }
        return true;
      } else {
        // If the server rejected it or did not succeed
        const errMsg = result.data || result.error || "The server/script rejected the submission. Ensure your ID key is registered.";
        throw new Error(errMsg);
      }
    } catch (err: any) {
      console.error("Ballot posting failed", err);
      setSubmitError(err.message || "Failed to submit ballot due to network/server issue.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExplosionComplete = () => {
    setHasSubmitted(true);
  };

  const handleClearError = () => {
    setSubmitError(null);
  };

  // End active session to allow user to vote with another mock/regular ID immediately
  const handleResetSession = () => {
    setActiveVoter(null);
    setVotedCandidates({});
    setHasSubmitted(false);
    setSubmitError(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#1e1e2e] frosted-bg flex items-center justify-center overflow-x-hidden font-sans select-none p-0 sm:p-4 md:p-8">
      
      {/* Decorative background typography branding from the theme */}
      <div className="absolute top-20 right-20 hidden xl:flex flex-col items-center opacity-40 select-none z-0">
        <div className="text-[120px] font-black text-orange-200/5 leading-none">LUAU</div>
        <div className="text-[120px] font-black text-orange-200/5 leading-none mt-[-40px]">VOTES</div>
      </div>
      
      <div className="absolute bottom-20 left-20 hidden xl:flex flex-col items-center opacity-40 select-none z-0">
        <div className="text-[110px] font-black text-orange-200/5 leading-none">ALOHA</div>
        <div className="text-[110px] font-black text-orange-200/5 leading-none mt-[-40px]">CUP</div>
      </div>

      {/* Floating Sparkles and Ember particles effect */}
      <EmberEffect />

      {/* Main Container - Beautifully styled simulated Frosted Glass mobile frame container */}
      <div className="w-full sm:w-[410px] sm:h-[840px] sm:min-h-[800px] bg-white/10 backdrop-blur-2xl rounded-none sm:rounded-[48px] border-0 sm:border border-white/20 shadow-2xl flex flex-col relative z-10 overflow-hidden">
        
        {/* Simulated top notch/bar decoration from theme */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white/25 rounded-full z-20 hidden sm:block" />

        {/* Primary header branding bar integrated inside the frame */}
        <header className="w-full text-center pt-8 pb-4 px-6 z-10 bg-white/5 border-b border-white/10 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Palmtree className="w-6 h-6 text-orange-400" />
              <h1 className="font-script text-3xl text-amber-200 tracking-wide drop-shadow-sm">
                Summer Outing Best Outfit
              </h1>
            </div>
            
            <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-400/20 px-2.5 py-1 rounded-full">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="text-[9px] uppercase font-display font-semibold text-amber-200 tracking-wider">
                LIVE
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable interior content inside the device framework */}
        <main className="flex-1 flex flex-col justify-between items-center py-5 px-6 z-10 overflow-x-hidden overflow-y-auto">
          {loading ? (
            <LoadingScreen />
          ) : !activeVoter ? (
            <LoginScreen votersList={voters} onLoginSuccess={setActiveVoter} />
          ) : hasSubmitted ? (
            <SubmissionStatus
              voter={activeVoter}
              allCandidates={candidates}
              votedCandidateIds={Object.entries(votedCandidates)
                .filter(([_, voted]) => voted)
                .map(([id]) => id)}
              onResetSession={handleResetSession}
              message={submitMessage}
            />
          ) : activeVoter.vote ? (
            <AlreadyVotedScreen
              voter={activeVoter}
              allCandidates={candidates}
              onResetSession={handleResetSession}
            />
          ) : (
            /* Active Tinder card stack screen */
            <div className="w-full flex flex-col flex-1">
              
              {/* Authenticated active Voter Top Banner */}
              <div className="w-full text-center py-2.5 px-4 glass-card rounded-2xl mb-4 flex items-center justify-between border border-white/15 relative overflow-hidden group">
                <div className="absolute top-0 inset-y-0 left-0 w-1 bg-orange-400" />
                <div className="text-left">
                  <span className="text-[9px] font-display uppercase tracking-wider text-orange-200 font-bold block leading-none opacity-80">
                    Hello, Kinettix Voter
                  </span>
                  <span className="font-display text-base font-bold text-white drop-shadow-sm">
                    {activeVoter.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-orange-500/10 border border-orange-400/20 px-2.5 py-1 rounded-lg text-[9px] font-mono text-amber-300 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>KEY: {activeVoter.id}</span>
                  </div>
                  <button
                    onClick={handleResetSession}
                    className="p-1 px-2.5 hover:bg-rose-500/20 rounded-lg text-rose-300 hover:text-rose-200 transition-all text-xs flex items-center font-display gap-1 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Deck components */}
              <TinderCards
                candidates={candidates}
                votedCandidates={votedCandidates}
                onMarkVote={handleMarkVote}
                onSubmitVote={handleSubmitVote}
                onExplosionComplete={handleExplosionComplete}
                onClearError={handleClearError}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            </div>
          )}
        </main>

        {/* Footer brand alignment */}
        <footer className="w-full text-center py-3 px-6 z-10 bg-white/5 border-t border-white/10 text-[9px] text-orange-200/50 tracking-widest font-display font-medium">
          SUMMER SURGE 2026 • KINETTIX
        </footer>
      </div>
    </div>
  );
}
