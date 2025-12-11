# 🚀 JukeboxSync - Quick Start Guide

## ✅ Installation Complete!

Your JukeboxSync MERN stack application has been successfully created and is now running!

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Socket.IO**: http://localhost:5001

## 📂 Project Structure Created

```
/JukeboxSync
├── README.md
├── .gitignore
├── /client (React Frontend)
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       ├── index.css
│       ├── /components
│       │   ├── AudioPlayer.js (Synchronized playback)
│       │   ├── AudioPlayer.css
│       │   ├── NowPlaying.js
│       │   ├── NowPlaying.css
│       │   ├── QueueList.js
│       │   ├── QueueList.css
│       │   ├── SearchPanel.js
│       │   ├── SearchPanel.css
│       │   ├── ActiveUsers.js
│       │   └── ActiveUsers.css
│       ├── /pages
│       │   ├── Welcome.js
│       │   ├── Welcome.css
│       │   ├── RoomDashboard.js
│       │   └── RoomDashboard.css
│       ├── /context
│       │   └── RoomContext.js
│       ├── /hooks
│       │   └── useSync.js (Sync logic with latency compensation)
│       ├── /socket
│       │   └── socket.js
│       └── /utils
│           └── config.js
└── /server (Node.js Backend)
    ├── package.json
    ├── .env
    ├── .env.example
    ├── server.js
    ├── /models
    │   └── Room.js
    ├── /routes
    │   ├── roomRoutes.js
    │   └── searchRoutes.js
    ├── /controllers
    │   ├── roomController.js
    │   └── searchController.js
    ├── /socket
    │   └── socketHandler.js
    └── /data
        └── songs.json (10 sample songs)
```

## ✨ Features Implemented

### ✅ Core Features
- [x] Room Creation & Join with unique 6-character codes
- [x] Real-time synchronization using Socket.IO
- [x] Shared playlist queue with live updates
- [x] Voting system (upvote/downvote)
- [x] Queue sorting by vote count
- [x] Active users list
- [x] Host controls (instant skip)
- [x] Vote skip for non-hosts

### ✅ Synchronized Playback
- [x] Server-authoritative timestamps
- [x] Client-server latency measurement (RTT)
- [x] Automatic drift correction (>1 second)
- [x] Position calculation with latency compensation
- [x] Real-time sync indicator

### ✅ Backend (Node.js + Express)
- [x] REST API endpoints
- [x] MongoDB integration with Mongoose
- [x] Socket.IO server
- [x] Room management
- [x] Song search from local JSON

### ✅ Frontend (React)
- [x] React Router for navigation
- [x] Context API for state management
- [x] Custom hooks (useSync)
- [x] Socket.IO client integration
- [x] Dark theme UI with gradients
- [x] Responsive design
- [x] Micro-animations

## 🎮 How to Use

### 1. Create a Room
1. Open http://localhost:3000
2. Click "Create Room"
3. Enter a room name and your name
4. Click "Create Room"
5. Share the 6-character room code with friends

### 2. Join a Room
1. Click "Join Room"
2. Enter the room code
3. Enter your name
4. Click "Join Room"

### 3. Add Songs
1. Click "🔍 Search Songs"
2. Type a song title or artist
3. Click "+ Add" to add to queue

### 4. Vote on Songs
- Click ▲ to upvote
- Click ▼ to downvote
- Queue automatically reorders by votes

### 5. Skip Tracks
- **Host**: Click "Skip" button
- **Others**: Click "Vote Skip" (50% threshold)

## 🔧 Technical Implementation

### Synchronized Playback Algorithm

```javascript
// Server stores track start timestamp
currentTrackStartTs = Date.now()

// Client measures latency
RTT = (responseTime - requestTime)
latency = RTT / 2

// Client calculates position
adjustedStartTime = currentTrackStartTs + latency
elapsed = (Date.now() - adjustedStartTime) / 1000
position = Math.max(0, Math.min(elapsed, duration))

// Auto-correct if drift > 1 second
if (Math.abs(audioElement.currentTime - position) > 1) {
  audioElement.currentTime = position
}
```

### Socket.IO Events

**Client → Server:**
- `joinRoom` - Join a room
- `addSong` - Add song to queue
- `voteSong` - Vote on song
- `hostSkip` - Host skip track
- `requestSkip` - Vote to skip
- `playerSyncPing` - Measure latency

**Server → Client:**
- `roomState` - Full room state
- `songAdded` - Song added notification
- `songVotesUpdated` - Vote update
- `trackChanged` - Track changed
- `playerSyncPong` - Latency response

## 📊 Database Schema

### Room Model
```javascript
{
  name: String,
  code: String (unique, 6 chars),
  host: String (userId),
  queue: [Song],
  currentTrack: Song,
  currentTrackStartTs: Number,
  users: [{ id, name, joinedAt }],
  settings: { skipThreshold: 0.5 }
}
```

### Song Object
```javascript
{
  id: String,
  title: String,
  artist: String,
  duration: Number (seconds),
  addedBy: String (userId),
  votes: Map<userId, vote>,
  voteCount: Number
}
```

## 🛠️ Development Commands

### Server
```bash
cd server
npm run dev    # Start with nodemon (auto-restart)
npm start      # Start normally
```

### Client
```bash
cd client
npm start      # Start development server
npm build      # Build for production
```

## 🔍 API Endpoints

- `POST /api/rooms` - Create a new room
- `POST /api/rooms/:code/join` - Join a room
- `GET /api/rooms/:code` - Get room details
- `POST /api/search` - Search songs
- `GET /api/health` - Health check

## 🎨 UI Features

- **Dark Theme** - Modern dark gradient backgrounds
- **Glassmorphism** - Frosted glass effects
- **Animations** - Smooth transitions and micro-animations
- **Responsive** - Works on desktop and mobile
- **Real-time Updates** - Instant UI updates via Socket.IO
- **Visual Feedback** - Loading states, hover effects

## 📝 Environment Variables

### Server (.env)
```env
MONGO_URI=mongodb://localhost:27017/jukeboxsync
PORT=5001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in server/.env
- For MongoDB Atlas, use your connection string

### Port Already in Use
- Server uses port 5001 (changed from 5000)
- Client uses port 3000
- Change PORT in .env if needed

### Socket Connection Failed
- Verify server is running on port 5001
- Check browser console for errors
- Ensure CORS is configured correctly

### Audio Not Playing
- Check browser autoplay policy
- Click on page to enable audio
- Verify audio URLs in songs.json

## 🚀 Next Steps

### Enhancements You Can Add:
1. **User Authentication** - Add login/signup
2. **Spotify Integration** - Real music playback
3. **Chat Feature** - In-room messaging
4. **Playlist History** - Track played songs
5. **Room Settings** - Customize skip threshold, etc.
6. **User Profiles** - Avatars, preferences
7. **Analytics** - Track popular songs
8. **Mobile App** - React Native version

## 📚 Technologies Used

- **Frontend**: React 18, React Router, Socket.IO Client, Axios
- **Backend**: Node.js, Express, Socket.IO, Mongoose
- **Database**: MongoDB
- **Styling**: CSS3 with Gradients, Animations
- **Real-time**: Socket.IO
- **State Management**: React Context API

## ✅ Testing Checklist

- [x] Server starts successfully
- [x] Client starts successfully
- [x] MongoDB connection works
- [x] Can create a room
- [x] Can join a room
- [x] Can search songs
- [x] Can add songs to queue
- [x] Can vote on songs
- [x] Queue reorders by votes
- [x] Can skip tracks
- [x] Real-time sync works
- [x] Multiple users can join
- [x] Active users list updates

## 🎉 Success!

Your JukeboxSync application is now fully functional and running!

**Access it at**: http://localhost:3000

Enjoy building and customizing your collaborative music experience! 🎵
