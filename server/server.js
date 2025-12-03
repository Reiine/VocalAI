const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // specific origin ONLY
    credentials: true, // allow cookies
    methods: ["GET", "POST"], // allowed methods
    allowedHeaders: ["Content-Type"], // allowed headers
  })
);
app.use(express.json());

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";


app.post("/debate", async (req, res) => {
  try {
    const { message, topic } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const prompt = `
You are debating against the user. Reply in 3-5 lines. 

Topic: ${topic || "General"}
User said: "${message}"

Your job:
- Give a strong counter-argument
- Give clear reasoning
- End with ONE question to continue the debate
    `;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const aiReply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("Debate Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Gemini debate failed" });
  }
});


app.post("/feedback", async (req, res) => {
  try {
    const { replies } = req.body;
    const message = replies;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const prompt = `
Analyze the user's debate message: "${message}"
Focus more on the english and less on the content.
Don't include feedback for punctuations (like missing commas or fullstops). 
Return ONLY a raw JSON object:

{
  "grammar": number (rating out of 10),
  "clarity": number (rating out of 10) ,
  "confidence": number (rating out of 10),
  "average_score":number (average of grammar, clarity and confidence)
  "strengths": ["string"],
  "weaknesses": ["string"],
  "detailed_feedback": "string"
}

Do NOT add backticks, code blocks, or extra text.
`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );
    // Extract raw text
    let raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw || typeof raw !== "string") {
      throw new Error("Gemini returned empty feedback");
    }

    // Remove ```json and ```
    raw = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON safely using regex
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Gemini response");

    const jsonString = jsonMatch[0];

    // Parse safely
    const json = JSON.parse(jsonString);
    res.json({ feedback: json });
  } catch (err) {
    console.error("Feedback Error:", err);
    res.status(500).json({ error: err.message || "Gemini feedback failed" });
  }
});

app.post("/start-message", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const prompt = `
Generate ONLY the opening statement for a debate on the topic: "${title}".
Rules:
- Do NOT start with "Sure!", "Here's", "Absolutely", etc.
- Give only the debate introduction.
- Keep it sharp, neutral, and topic-focused.
- No explanations, no extra sentences outside the intro.
`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    // Extract text safely
    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Failed to generate start message";

    res.json({ startMessage: text });
  } catch (err) {
    console.error("Error generating start message:", err);
    res.status(500).json({ error: "Failed to generate start message" });
  }
});

app.post("/end-session", async (req, res) => {
  try {
    const {
      topic,
      duration,
      userReplies,
      feedback,
      user, 
    } = req.body;

    if (!user || !user.email) {
      return res.status(400).json({ error: "User data missing." });
    }

    const sessionData = {
      topic: topic || "",
      duration: duration || 0,
      userReplies: userReplies || [],
      feedback: feedback || null,
      user: {
        name: user.name,
        email: user.email,
      },
      timestamp: admin.firestore.Timestamp.now(),
    };

    await db.collection("debateSessions").add(sessionData);

    res.json({ success: true, saved: sessionData });
  } catch (err) {
    console.error("Error saving session:", err);
    res.status(500).json({ error: "Failed to store session" });
  }
});

// ------------------------------------------
// START SERVER
// ------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✔ Gemini server running on port ${PORT}`);
});
