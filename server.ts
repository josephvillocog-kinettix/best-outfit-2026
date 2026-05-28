import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Helper to fetch Google Apps Script
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweCuofvcOLUIYh5cePVup7tlvPMWVlA5YAr8GYtQ-KIqP0uqVzT1suRWO6MN3mAvc6Aw/exec";

  // API Route - Get candidates & voters data
  app.get("/api/data", async (req, res) => {
    try {
      console.log("Fetching Google Apps Script data...");
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`Google Script API returned status: ${response.status}`);
        return res.status(response.status).json({
          error: `Error from Google script API: Status ${response.status}`,
        });
      }

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (parseError) {
        console.error("Failed to parse Google Apps response as JSON", text);
        res.status(500).json({
          error: "Failed to parse API response as JSON",
          rawResponse: text.substring(0, 500)
        });
      }
    } catch (err: any) {
      console.error("Proxy GET Error:", err);
      res.status(500).json({ error: "Server error contact proxying API", details: err.message });
    }
  });

  // API Route - Submit vote (doPost proxy)
  app.post("/api/vote", async (req, res) => {
    try {
      const { id, name, candidateId, candidateName, voterId, voterName, votedList } = req.body;
      console.log(`Submitting vote payload: id (voterId)=${id}, name (candidateName)=${name}, voterId=${voterId}, voterName=${voterName}`);

      if (!id || !name) {
        return res.status(400).json({ error: "Missing required fields: id (voter id) and/or name (candidate name)" });
      }

      // We resolve voter ID/Name and candidate ID/Name for safe and redundant delivery
      const resolvedVoterId = voterId || id || "";
      const resolvedVoterName = voterName || "";
      const resolvedCandidateId = candidateId || "";
      const resolvedCandidateName = candidateName || name || "";
      const votedCandidate = votedList && votedList.length > 0 ? votedList.join(", ") : resolvedCandidateName;

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

      // Build a comprehensive, robust JSON payload as requested: "make sure id and name is passed as parameter in json format"
      // Map 'id' to voter's ID and 'name' to candidate's name
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

      console.log("Forwarding POST to Google Script as JSON body:", JSON.stringify(jsonPayload));

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
      console.error("Proxy POST Error:", err);
      res.status(500).json({ error: "Server error posting vote data", details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
