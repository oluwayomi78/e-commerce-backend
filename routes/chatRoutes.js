const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({ error: "Message is required" });
        }

        const result = await model.generateContent(message);
        const botReply = result.response.text();

        res.json({ reply: botReply });
    } catch (error) {
        console.error("❌ Chat route error:", error);
        res.status(500).json({
            error: "Something went wrong while generating AI response",
        });
    }
});

module.exports = router;
