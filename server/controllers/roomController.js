const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');

// Generate unique 6-character room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new room
exports.createRoom = async (req, res) => {
    try {
        const { name, hostName } = req.body;

        if (!name || !hostName) {
            return res.status(400).json({ error: 'Room name and host name are required' });
        }

        let code;
        let isUnique = false;

        // Generate unique code
        while (!isUnique) {
            code = generateRoomCode();
            const existing = await Room.findOne({ code });
            if (!existing) isUnique = true;
        }

        const hostId = uuidv4();

        const room = new Room({
            name,
            code,
            host: hostId,
            queue: [],
            users: [{ id: hostId, name: hostName }],
            settings: { skipThreshold: 0.5 }
        });

        await room.save();

        res.status(201).json({
            success: true,
            room: {
                id: room._id,
                name: room.name,
                code: room.code,
                host: room.host
            },
            userId: hostId
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
};

// Join an existing room
exports.joinRoom = async (req, res) => {
    try {
        const { code } = req.params;
        const { userName } = req.body;

        if (!userName) {
            return res.status(400).json({ error: 'User name is required' });
        }

        const room = await Room.findOne({ code: code.toUpperCase() });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const userId = uuidv4();

        room.users.push({ id: userId, name: userName });
        await room.save();

        res.status(200).json({
            success: true,
            room: {
                id: room._id,
                name: room.name,
                code: room.code,
                host: room.host
            },
            userId
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ error: 'Failed to join room' });
    }
};

// Get room details
exports.getRoomDetails = async (req, res) => {
    try {
        const { code } = req.params;

        const room = await Room.findOne({ code: code.toUpperCase() });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.status(200).json({
            success: true,
            room
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({ error: 'Failed to get room details' });
    }
};

// Add song to room queue via REST
exports.addSongToRoom = async (req, res) => {
    try {
        const { code } = req.params;
        const { song, userId } = req.body;

        if (!song || !userId) {
            return res.status(400).json({ error: 'Song and userId are required' });
        }

        const room = await Room.findOne({ code: code.toUpperCase() });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const newSong = {
            id: song.id,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            addedBy: userId,
            votes: new Map(),
            voteCount: 0
        };

        room.queue.push(newSong);

        if (!room.currentTrack && room.queue.length > 0) {
            room.currentTrack = room.queue.shift();
            room.currentTrackStartTs = Date.now();
        }

        await room.save();

        res.status(201).json({ success: true, queue: room.queue, currentTrack: room.currentTrack, currentTrackStartTs: room.currentTrackStartTs });
    } catch (error) {
        console.error('Add song (REST) error:', error);
        res.status(500).json({ error: 'Failed to add song to room' });
    }
};

// Vote on a song in the room queue via REST
exports.voteInRoom = async (req, res) => {
    try {
        const { code } = req.params;
        const { songId, userId, vote } = req.body;

        if (!songId || !userId || typeof vote !== 'number') {
            return res.status(400).json({ error: 'songId, userId and numeric vote are required' });
        }

        const room = await Room.findOne({ code: code.toUpperCase() });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const song = room.queue.find((s) => s.id === songId);
        if (!song) {
            return res.status(404).json({ error: 'Song not found in queue' });
        }

        if (vote === 0) {
            song.votes.delete(userId);
        } else {
            song.votes.set(userId, vote);
        }

        song.voteCount = Array.from(song.votes.values()).reduce((sum, v) => sum + v, 0);
        room.queue.sort((a, b) => b.voteCount - a.voteCount);

        await room.save();

        res.status(200).json({ success: true, queue: room.queue });
    } catch (error) {
        console.error('Vote (REST) error:', error);
        res.status(500).json({ error: 'Failed to vote on song' });
    }
};

// Skip current track via REST (host only)
exports.skipInRoom = async (req, res) => {
    try {
        const { code } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const room = await Room.findOne({ code: code.toUpperCase() });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (room.host !== userId) {
            return res.status(403).json({ error: 'Only host can skip' });
        }

        if (room.queue.length > 0) {
            room.currentTrack = room.queue.shift();
            room.currentTrackStartTs = Date.now();
        } else {
            room.currentTrack = null;
            room.currentTrackStartTs = null;
        }

        await room.save();

        res.status(200).json({ success: true, currentTrack: room.currentTrack, currentTrackStartTs: room.currentTrackStartTs, queue: room.queue });
    } catch (error) {
        console.error('Skip (REST) error:', error);
        res.status(500).json({ error: 'Failed to skip track' });
    }
};

// Get queue for a room
exports.getQueue = async (req, res) => {
    try {
        const { code } = req.params;
        const room = await Room.findOne({ code: code.toUpperCase() });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.status(200).json({ success: true, queue: room.queue, currentTrack: room.currentTrack, currentTrackStartTs: room.currentTrackStartTs });
    } catch (error) {
        console.error('Get queue error:', error);
        res.status(500).json({ error: 'Failed to get queue' });
    }
};

// Get active users for a room
exports.getActiveUsers = async (req, res) => {
    try {
        const { code } = req.params;
        const room = await Room.findOne({ code: code.toUpperCase() });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.status(200).json({ success: true, users: room.users, host: room.host });
    } catch (error) {
        console.error('Get active users error:', error);
        res.status(500).json({ error: 'Failed to get active users' });
    }
};
