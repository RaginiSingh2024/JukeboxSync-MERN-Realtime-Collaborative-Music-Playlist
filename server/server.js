require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const roomRoutes = require('./routes/roomRoutes');
const searchRoutes = require('./routes/searchRoutes');
const socketHandler = require('./socket/socketHandler');
const roomController = require('./controllers/roomController');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/search', searchRoutes);

// Top-level REST aliases to match external spec
app.post('/create-room', roomController.createRoom);
app.post('/join-room', (req, res, next) => {
    // Expect body: { code, userName }
    const { code } = req.body || {};
    if (!code) {
        return res.status(400).json({ error: 'Room code is required' });
    }
    req.params.code = code;
    return roomController.joinRoom(req, res, next);
});
app.get('/room/:code', roomController.getRoomDetails);
app.post('/room/:code/add-song', roomController.addSongToRoom);
app.post('/room/:code/vote', roomController.voteInRoom);
app.post('/room/:code/skip', roomController.skipInRoom);
app.get('/room/:code/queue', roomController.getQueue);
app.get('/room/:code/active-users', roomController.getActiveUsers);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'JukeboxSync server is running' });
});

// Socket.IO handler
socketHandler(io);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jukeboxsync';
const PORT = process.env.PORT || 5001;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🎵 JukeboxSync is ready!`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

module.exports = { app, io };
