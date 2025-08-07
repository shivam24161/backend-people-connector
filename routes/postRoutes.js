const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// POST /api/posts — with image
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    const { content, visibility } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await Post.create({
        content,
        image,
        author: req.user.id,
        visibility: visibility || 'friends',
    });

    res.json(post);
});

// Like a post
router.post('/:id/like', authMiddleware, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.id)) {
        post.likes.push(req.user.id);
        await post.save();
    }
    res.json({ message: 'Liked' });
});

// Comment on post
router.post('/:id/comment', authMiddleware, async (req, res) => {
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.user.id, text: req.body.text });
    await post.save();
    res.json({ message: 'Comment added' });
});

// POST /api/posts — with image
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await Post.create({
        content,
        author: req.user.id,
        image,
    });

    res.json(post);
});


router.get('/feed', authMiddleware, async (req, res) => {
    const currentUser = await User.findById(req.user.id).populate('friends');

    const posts = await Post.find({
        $or: [
            { visibility: 'public' },
            { visibility: 'friends', author: { $in: currentUser.friends } },
        ],
    })
        .populate('author', 'name')
        .populate('comments.user', 'name')
        .sort({ createdAt: -1 });

    res.json(posts);
});

router.get('/my-posts', authMiddleware, async (req, res) => {
    const posts = await Post.find({ author: req.user.id })
        .populate('author', 'name')
        .populate('comments.user', 'name')
        .sort({ createdAt: -1 });

    res.json(posts);
});

module.exports = router;
