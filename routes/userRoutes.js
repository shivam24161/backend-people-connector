const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Get all users (except self)
router.get('/', authMiddleware, async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('name email');
    res.json(users);
});

// Send friend request
router.post('/friend-request/:id', authMiddleware, async (req, res) => {
    const receiver = await User.findById(req.params.id);
    if (!receiver.friendRequests.includes(req.user.id)) {
        receiver.friendRequests.push(req.user.id);
        await receiver.save();
    }
    res.json({ message: 'Friend request sent' });
});

// Accept friend request
router.post('/accept-friend/:id', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    const sender = await User.findById(req.params.id);

    if (!user.friends.includes(sender._id)) {
        user.friends.push(sender._id);
        sender.friends.push(user._id);
    }

    user.friendRequests = user.friendRequests.filter(
        id => id.toString() !== sender._id.toString()
    );

    await user.save();
    await sender.save();

    res.json({ message: 'Friend request accepted' });
});

// Cancel sent friend request
router.post('/cancel-request/:id', authMiddleware, async (req, res) => {
    const receiver = await User.findById(req.params.id);
    if (!receiver) return res.status(404).json({ message: 'User not found' });

    receiver.friendRequests = receiver.friendRequests.filter(
        id => id.toString() !== req.user.id
    );

    await receiver.save();
    res.json({ message: 'Friend request canceled' });
});

// Unfriend a user
router.post('/unfriend/:id', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(req.params.id);
    if (!friend) return res.status(404).json({ message: 'User not found' });

    user.friends = user.friends.filter(id => id.toString() !== friend._id.toString());
    friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());

    await user.save();
    await friend.save();

    res.json({ message: 'Unfriended successfully' });
});


// Block user
router.post('/block/:id', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user.blockedUsers.includes(req.params.id)) {
        user.blockedUsers.push(req.params.id);
        await user.save();
    }
    res.json({ message: 'User blocked' });
});

// Get current user profile with friends & friendRequests
router.get('/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate('friends', 'name email')
        .populate('friendRequests', 'name email');
    res.json(user);
});

module.exports = router;
