const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const Application = require("../models/application");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const User = require("../models/User");
const nodemailer = require("nodemailer");



// GET ALL JOBS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "email");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "error fetching jobs" });
  }
});


// POST A JOB
router.post("/", authMiddleware, async (req, res) => {
  const { title, company, location, description } = req.body;

  try {
    const job = new Job({
      title,
      company,
      location,
      description,
      postedBy: req.user.id,
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: "error posting job" });
  }
});

router.post(
    "/:id/apply",
    authMiddleware,
    upload.single("resume"),
    async (req, res) => {
      try {
        const { name, email, phone } = req.body;
  
        const application = new Application({
          jobId: req.params.id,
          applicantName: name,
          applicantEmail: email,
          applicantPhone: phone,
          resumePath: req.file.path,
        });
  
        await application.save();
  
        // fetch job & poster
        const job = await Job.findById(req.params.id).populate(
          "postedBy",
          "email"
        );
  
        // send email
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
  
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: job.postedBy.email,
          subject: `New application for ${job.title}`,
          text: `
  Name: ${name}
  Email: ${email}
  Phone: ${phone}
          `,
          attachments: [
            {
              filename: req.file.originalname,
              path: req.file.path,
            },
          ],
        });
  
        res.status(201).json({ message: "application submitted" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "application failed" });
      }
    }
  );



module.exports = router;
