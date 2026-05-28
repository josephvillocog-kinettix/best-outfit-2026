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

  try {
    console.log("Fetching Google Apps Script data via Vercel Serverless Function...");
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
    console.error("Vercel Proxy GET Error:", err);
    res.status(500).json({ error: "Server error contact proxying API", details: err.message });
  }
}
