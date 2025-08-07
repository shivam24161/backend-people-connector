const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    image: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    visibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends',
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: String,
            createdAt: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);