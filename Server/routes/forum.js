const express = require("express");
const router = express.Router();

const Post = require("../models/post");
const authMiddleware = require("../middleware/auth");


// GET ALL POSTS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
    .populate("author", "username email")
    .populate("comments.user", "username email")
    .sort({ createdAt: -1 });


    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "error fetching posts" });
  }
});


// CREATE POST
router.post("/", authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = new Post({
      title,
      content,
      author: req.user.id,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "error creating post" });
  }
});


// LIKE / UNLIKE POST
router.put("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    const userId = req.user.id;

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "error liking post" });
  }
});


// COMMENT ON POST
router.post("/:id/comment", authMiddleware, async (req, res) => {
  const { text } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    post.comments.push({
      user: req.user.id,
      text,
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "error adding comment" });
  }
});


// GET MY POSTS
router.get("/myposts", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "error fetching my posts" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "not allowed" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "post deleted" });
  } catch (err) {
    res.status(500).json({ message: "error deleting post" });
  }
});


module.exports = router;
