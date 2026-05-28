const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweCuofvcOLUIYh5cePVup7tlvPMWVlA5YAr8GYtQ-KIqP0uqVzT1suRWO6MN3mAvc6Aw/exec";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { id, name, candidateId, candidateName, voterId, voterName, votedList } = req.body;
    console.log(`Submitting vote payload to Vercel api/vote: id=${id}, name=${name}`);

    if (!id || !name) {
      return res.status(400).json({ error: "Missing required fields: id (voter id) and/or name (candidate name)" });
    }

    // We resolve voter ID/Name and candidate ID/Name for safe and redundant delivery
    const resolvedVoterId = voterId || id || "";
    const resolvedVoterName = voterName || "";
    const resolvedCandidateId = candidateId || "";
    const resolvedCandidateName = candidateName || name || "";
    const votedCandidate = votedList && votedList.length > 0 ? votedList[0] : resolvedCandidateName;

    // Construct a URL with the query parameters to be extremely safe, 
    // as some legacy Google Apps Scripts read parameters from query params (e.parameter)
    const postUrl = new URL(GOOGLE_SCRIPT_URL);
    
    // Map id to voter's ID, and name to candidate's name as instructed
    postUrl.searchParams.append("id", resolvedVoterId);
    postUrl.searchParams.append("name", resolvedCandidateName);
    postUrl.searchParams.append("voterId", resolvedVoterId);
    postUrl.searchParams.append("voterName", resolvedVoterName);
    
    // Selection values for legacy parameter names and fallbacks
    postUrl.searchParams.append("vote", votedCandidate);
    postUrl.searchParams.append("candidate", votedCandidate);
    postUrl.searchParams.append("candidateId", resolvedCandidateId);
    postUrl.searchParams.append("candidateName", resolvedCandidateName);

    // Build a comprehensive, robust JSON payload
    const jsonPayload = {
      id: resolvedVoterId,         // id is for the voter's id
      name: resolvedCandidateName, // name is for the candidate's name
      candidateId: resolvedCandidateId,
      candidateName: resolvedCandidateName,
      voterId: resolvedVoterId,
      voterName: resolvedVoterName,
      votedList: votedList || [resolvedCandidateName],
      vote: votedCandidate,
      candidate: votedCandidate,
      votedCandidate: votedCandidate
    };

    console.log("Forwarding POST to Google Script from Vercel Serverless Function:", JSON.stringify(jsonPayload));

    const response = await fetch(postUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(jsonPayload)
    });

    console.log(`Google Script POST returned status: ${response.status}`);

    let resultText = "";
    try {
      resultText = await response.text();
    } catch (e) {
      console.warn("Could not read response text from POST", e);
    }

    res.json({
      success: response.ok,
      status: response.status,
      data: resultText
    });
  } catch (err: any) {
    console.error("Vercel Proxy POST Error:", err);
    res.status(500).json({ error: "Server error posting vote data", details: err.message });
  }
}
