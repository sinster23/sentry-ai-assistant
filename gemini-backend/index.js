const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const chrono = require("chrono-node"); 

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const name= req.body.name;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = [
      `
You are Sentry, a smart AI assistant in a mobile app. The user's name is ${name}.

Respond in plain text if the message is a normal chat in short (like jokes, facts, questions).

If the user is asking you to perform a task (like opening an app, setting a reminder), respond ONLY in this strict JSON format:
{
  "command": "<commandName>",
  "args": {
    "key": "value"
  }
}

Valid commands: openApp, setReminder, saveNote, takePhoto, webSearch, searchYouTube, createSchedule, getweather, callContact
createShedule command  args should include "event" or "description" for the event title and "date" or "time" for the date/time.
If the command requires a date, it should be in ISO format and always update with current year 2025 if not provided and if the provided date is has already passed then fix it next year(e.g., "2025-10-01T10:00:00Z").
getweather command args should include "city" for the city name.
callContact command args should include "name" for the contact name.

Only return the JSON if it's a command. Otherwise, just reply with a normal sentence — no JSON, no formatting.`,
      `Respond to the user's message: "${userMessage}"`,
    ];

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    try {
      const commandObj = JSON.parse(reply);

      // Handle date parsing
      if (commandObj.command === "createSchedule" && commandObj.args.date) {
        const parsedDate = chrono.parseDate(commandObj.args.date);
        if (parsedDate) {
          commandObj.args.date = parsedDate.toISOString();
        }
      }

      return res.json({ reply: JSON.stringify(commandObj) }); 
    } catch (err) {
      return res.json({ reply }); 
    }

  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Something went wrong with Gemini AI." });
  }
});


app.listen(port, () => {
  console.log(`🧠 Gemini AI server running on http://localhost:${port}`);
});
