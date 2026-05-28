export interface Candidate {
  id: string;
  name: string;
  photoUrl: string;
}

export interface Voter {
  id: string;
  name: string;
  vote?: string;
}

export interface VoteState {
  voter: Voter | null;
  candidates: Candidate[];
  votedCandidates: Record<string, boolean>; // candidateId -> isVoted
  isSubmitting: boolean;
  hasSubmitted: boolean;
  submissionMessage?: string;
}
