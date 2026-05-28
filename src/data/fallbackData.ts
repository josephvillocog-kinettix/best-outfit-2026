import { Candidate, Voter } from "../types";

export const FALLBACK_CANDIDATES: Candidate[] = [
  {
    id: "cand-1",
    name: "Nalani Rivera",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600" // Styled in retro summer look
  },
  {
    id: "cand-2",
    name: "Keanu Vance",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" // Beach vibe summer attire
  },
  {
    id: "cand-3",
    name: "Leilani Kahale",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600" // Flower garland & beautiful smile
  },
  {
    id: "cand-4",
    name: "Kai Takahashi",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600" // Classic tropical shirt
  },
  {
    id: "cand-5",
    name: "Malia Johnston",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600" // Island wrap summer dress
  }
];

export const FALLBACK_VOTERS: Voter[] = [
  { id: "A101", name: "Leo Joseph" },
  { id: "A102", name: "Belle Marie" },
  { id: "ALOHA", name: "Aloha Reviewer" },
  { id: "V001", name: "Keanu Reeves" },
  { id: "V002", name: "Lilo Pelekai" },
];
