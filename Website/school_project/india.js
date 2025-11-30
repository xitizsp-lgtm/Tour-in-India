import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({});

app.post("/travel", async (req, res) => {
  try {
    const data = req.body;

    const prompt = `
You are a professional Indian travel planner.

Create a detailed trip plan based on the following details:

Days of travel: ${data.days}
Starting point: ${data.start}
Destinations: ${data.destinations}
Adults: ${data.adults}
Children: ${data.children}
Budget (INR): ${data.budget}
Extra comments: ${data.comments}

Give:
- Full day-by-day itinerary
- Transport plan
- Hotels (budget friendly)
- Food cost estimate
- Sightseeing cost
- Total estimated cost
- Tips & warnings
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
