const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "please type something" });
  }

  const msg = message.toLowerCase();

  let reply =
    "i understand. can you tell me a bit more so i can guide you properly?";

  if (msg.includes("harassment") || msg.includes("abuse") || msg.includes("violence")) {
    reply =
      "i’m really sorry you’re dealing with this. if you are in immediate danger, please contact 112 or women helpline 181. you can also check the verified resources page. do you want legal guidance, emotional support, or emergency steps?";
  } else if (msg.includes("job") || msg.includes("internship") || msg.includes("resume")) {
    reply =
      "for jobs and internships, go to the job portal. you can apply directly and upload your resume. if you want, i can also suggest how to improve your resume.";
  } else if (msg.includes("cyber") || msg.includes("online") || msg.includes("blackmail") || msg.includes("scam")) {
    reply =
      "for cyber issues, you should report on cybercrime.gov.in or call 1930 immediately if it’s financial fraud. do you want steps to report or safety tips?";
  } else if (msg.includes("health") || msg.includes("medical") || msg.includes("period") || msg.includes("pregnant")) {
    reply =
      "for health concerns, i can share general guidance, but i recommend consulting a doctor for proper advice. if you want, tell me your symptoms and i’ll guide you on next steps.";
  } else if (msg.includes("legal") || msg.includes("law") || msg.includes("rights")) {
    reply =
      "i can help explain legal rights in simple terms. can you tell me which issue you’re facing (workplace harassment, domestic violence, cybercrime, or something else)?";
  }

  res.json({ reply });
});

module.exports = router;
