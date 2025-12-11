const Room = require('../models/Room');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Join room (primary event used by client)
        const handleJoinRoom = async ({ roomCode, userId }) => {
            try {
                const room = await Room.findOne({ code: roomCode });
                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                socket.join(roomCode);
                socket.roomCode = roomCode;
                socket.userId = userId;

                // Send current room state
                io.to(roomCode).emit('roomState', {
                    queue: room.queue,
                    currentTrack: room.currentTrack,
                    currentTrackStartTs: room.currentTrackStartTs,
                    users: room.users,
                    host: room.host,
                    settings: room.settings
                });

                console.log(`User ${userId} joined room ${roomCode}`);
            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        };

        socket.on('joinRoom', handleJoinRoom);
        // Alias to support `join_room` naming
        socket.on('join_room', handleJoinRoom);

        // Add song to queue
        socket.on('addSong', async ({ roomCode, song, userId }) => {
            try {
                const room = await Room.findOne({ code: roomCode });
                if (!room) return;

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

                // If no current track, start playing
                if (!room.currentTrack && room.queue.length > 0) {
                    room.currentTrack = room.queue.shift();
                    room.currentTrackStartTs = Date.now();
                }

                await room.save();

                io.to(roomCode).emit('songAdded', { song: newSong });
                const statePayload = {
                    queue: room.queue,
                    currentTrack: room.currentTrack,
                    currentTrackStartTs: room.currentTrackStartTs,
                    users: room.users,
                    host: room.host,
                    settings: room.settings
                };

                io.to(roomCode).emit('roomState', statePayload);
                // Additional granular events per spec
                io.to(roomCode).emit('update_queue', { queue: room.queue });
                io.to(roomCode).emit('now_playing', { currentTrack: room.currentTrack, currentTrackStartTs: room.currentTrackStartTs });
                io.to(roomCode).emit('active_users_update', { users: room.users, host: room.host });

                console.log(`Song added to room ${roomCode}:`, song.title);
            } catch (error) {
                console.error('Add song error:', error);
            }
        });

        // Vote on song
        socket.on('voteSong', async ({ roomCode, songId, userId, vote }) => {
            try {
                const room = await Room.findOne({ code: roomCode });
                if (!room) return;

                const song = room.queue.find(s => s.id === songId);
                if (!song) return;

                // Update vote
                const previousVote = song.votes.get(userId) || 0;

                if (vote === 0) {
                    song.votes.delete(userId);
                } else {
                    song.votes.set(userId, vote);
                }

                // Recalculate vote count
                song.voteCount = Array.from(song.votes.values()).reduce((sum, v) => sum + v, 0);

                // Sort queue by vote count
                room.queue.sort((a, b) => b.voteCount - a.voteCount);

                await room.save();

                const votePayload = {
                    songId,
                    voteCount: song.voteCount,
                    queue: room.queue
                };

                io.to(roomCode).emit('songVotesUpdated', votePayload);
                io.to(roomCode).emit('vote_update', votePayload);

                console.log(`Vote updated for song ${songId} in room ${roomCode}`);
            } catch (error) {
                console.error('Vote song error:', error);
            }
        });

        // Host skip
        socket.on('hostSkip', async ({ roomCode, userId }) => {
            try {
                const room = await Room.findOne({ code: roomCode });
                if (!room || room.host !== userId) {
                    socket.emit('error', { message: 'Only host can skip' });
                    return;
                }

                await skipToNextTrack(room, roomCode, io);
            } catch (error) {
                console.error('Host skip error:', error);
            }
        });

        // Alias for host skip per spec
        socket.on('host_skip', async ({ roomCode, userId }) => {
            try {
                const room = await Room.findOne({ code: roomCode });
                if (!room || room.host !== userId) {
                    socket.emit('error', { message: 'Only host can skip' });
                    return;
                }

                await skipToNextTrack(room, roomCode, io);
            } catch (error) {
                console.error('Host skip (alias) error:', error);
            }
        });

        // Request skip (voting)
        socket.on('requestSkip', async ({ roomCode, userId }) => {
            try {
                const room = await Room.findOne({ code: roomCode });
                if (!room) return;

                // Track skip votes (in-memory for simplicity)
                if (!room.skipVotes) room.skipVotes = new Set();
                room.skipVotes.add(userId);

                const skipThreshold = room.settings.skipThreshold;
                const requiredVotes = Math.ceil(room.users.length * skipThreshold);

                if (room.skipVotes.size >= requiredVotes) {
                    await skipToNextTrack(room, roomCode, io);
                    room.skipVotes.clear();
                } else {
                    io.to(roomCode).emit('skipVoteUpdate', {
                        votes: room.skipVotes.size,
                        required: requiredVotes
                    });
                }
            } catch (error) {
                console.error('Request skip error:', error);
            }
        });

        // Sync ping for latency calculation
        socket.on('playerSyncPing', ({ timestamp }) => {
            socket.emit('playerSyncPong', {
                clientTimestamp: timestamp,
                serverTimestamp: Date.now()
            });
        });

        // Disconnect
        socket.on('disconnect', async () => {
            console.log('Client disconnected:', socket.id);

            if (socket.roomCode && socket.userId) {
                try {
                    const room = await Room.findOne({ code: socket.roomCode });
                    if (room) {
                        room.users = room.users.filter(u => u.id !== socket.userId);

                        // If host left, assign new host
                        if (room.host === socket.userId && room.users.length > 0) {
                            room.host = room.users[0].id;
                        }

                        await room.save();

                        io.to(socket.roomCode).emit('roomState', {
                            queue: room.queue,
                            currentTrack: room.currentTrack,
                            currentTrackStartTs: room.currentTrackStartTs,
                            users: room.users,
                            host: room.host,
                            settings: room.settings
                        });
                    }
                } catch (error) {
                    console.error('Disconnect cleanup error:', error);
                }
            }
        });
    });
};

// Helper function to skip to next track
async function skipToNextTrack(room, roomCode, io) {
    if (room.queue.length > 0) {
        room.currentTrack = room.queue.shift();
        room.currentTrackStartTs = Date.now();
    } else {
        room.currentTrack = null;
        room.currentTrackStartTs = null;
    }

    await room.save();

    io.to(roomCode).emit('trackChanged', {
        currentTrack: room.currentTrack,
        currentTrackStartTs: room.currentTrackStartTs,
        queue: room.queue
    });

    io.to(roomCode).emit('skipResult', { success: true });
}
