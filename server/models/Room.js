const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    duration: { type: Number, required: true },
    addedBy: { type: String, required: true },
    votes: { type: Map, of: Number, default: new Map() },
    voteCount: { type: Number, default: 0 }
}, { _id: false });

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    host: { type: String, required: true },
    queue: [songSchema],
    currentTrack: songSchema,
    currentTrackStartTs: { type: Number, default: null },
    users: [{
        id: String,
        name: String,
        joinedAt: { type: Date, default: Date.now }
    }],
    settings: {
        skipThreshold: { type: Number, default: 0.5 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

roomSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Room', roomSchema);
