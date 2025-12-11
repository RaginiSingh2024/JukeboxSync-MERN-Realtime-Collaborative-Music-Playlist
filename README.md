# 🎵 JukeboxSync

A real-time collaborative music playlist web application where users join a room and collectively control a synchronized playlist. Built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO.

## ✨ Features

- **Room Creation & Join** - Create or join rooms with unique 6-character codes
- **Real-time Synchronization** - All users listen to the same track at the same time (within 1 second)
- **Voting System** - Upvote/downvote songs to influence queue order
- **Collaborative Queue** - Add songs and see updates in real-time
- **Active Users List** - See who's in the room
- **Host Controls** - Host can skip tracks instantly
- **Vote Skip** - Non-hosts can vote to skip (threshold-based)
- **Latency Compensation** - Client-server sync with drift correction

## 🏗️ Project Structure

```
/JukeboxSync
  /client (React Frontend)
    /src
      /components
        - AudioPlayer.js (Synchronized playback)
        - NowPlaying.js
        - QueueList.js
        - SearchPanel.js
        - ActiveUsers.js
      /pages
        - Welcome.js
        - RoomDashboard.js
      /context
        - RoomContext.js
      /hooks
        - useSync.js (Sync logic)
      /socket
        - socket.js
      /utils
        - config.js
  /server (Node.js Backend)
    /models
      - Room.js
    /routes
      - roomRoutes.js
      - searchRoutes.js
    /controllers
      - roomController.js
      - searchController.js
    /socket
      - socketHandler.js
    /data
      - songs.json
    server.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd /Users/ragini/Desktop/JukeboxSync
```

2. **Install Server Dependencies**
```bash
cd server
npm install
```

3. **Install Client Dependencies**
```bash
cd ../client
npm install
```

4. **Configure Environment Variables**

Edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/jukeboxsync
PORT=5000
CLIENT_URL=http://localhost:3000
```

For MongoDB Atlas, replace MONGO_URI with your connection string.

### Running the Application

1. **Start MongoDB** (if using local MongoDB)
```bash
mongod
```

2. **Start the Server** (in `/server` directory)
```bash
npm run dev
```
Server will run on http://localhost:5000

3. **Start the Client** (in `/client` directory, new terminal)
```bash
npm start
```
Client will run on http://localhost:3000

## 🎮 How to Use

1. **Create a Room**
   - Click "Create Room"
   - Enter room name and your name
   - Share the 6-character room code with friends

2. **Join a Room**
   - Click "Join Room"
   - Enter the room code and your name

3. **Add Songs**
   - Click "Search Songs"
   - Search by title or artist
   - Click "+ Add" to add to queue

4. **Vote on Songs**
   - Use ▲ to upvote, ▼ to downvote
   - Queue automatically sorts by vote count

5. **Skip Tracks**
   - Host: Click "Skip" to skip instantly
   - Others: Click "Vote Skip" (requires threshold)

## 🔧 Technical Details

### Synchronized Playback

The app uses a server-authoritative timestamp system:

1. Server stores `currentTrackStartTs` when a track starts
2. Client measures latency via RTT (Round Trip Time)
3. Client calculates: `position = (now - startTs - latency) / 1000`
4. If drift > 1 second, client auto-corrects audio position

### Socket.IO Events

**Client → Server:**
- `joinRoom` - Join a room
- `addSong` - Add song to queue
- `voteSong` - Vote on a song
- `hostSkip` - Host skip
- `requestSkip` - Vote to skip
- `playerSyncPing` - Latency measurement

**Server → Client:**
- `roomState` - Full room state update
- `songAdded` - New song added
- `songVotesUpdated` - Votes changed
- `trackChanged` - Track changed
- `syncTime` - Sync response

### Database Schema

**Room Model:**
```javascript
{
  name: String,
  code: String (unique),
  host: String (userId),
  queue: [Song],
  currentTrack: Song,
  currentTrackStartTs: Number,
  users: [{ id, name, joinedAt }],
  settings: { skipThreshold: Number }
}
```

**Song Object:**
```javascript
{
  id: String,
  title: String,
  artist: String,
  duration: Number,
  addedBy: String,
  votes: Map<userId, vote>,
  voteCount: Number
}
```

## 📡 API Endpoints

- `POST /api/rooms` - Create a room
- `POST /api/rooms/:code/join` - Join a room
- `GET /api/rooms/:code` - Get room details
- `POST /api/search` - Search songs

## 🎨 Tech Stack

**Frontend:**
- React 18
- React Router
- Socket.IO Client
- Axios
- CSS3 with Gradients & Animations

**Backend:**
- Node.js
- Express
- Socket.IO
- MongoDB & Mongoose
- UUID

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check MONGO_URI in `.env`

**Socket Connection Failed:**
- Verify server is running on port 5000
- Check firewall settings

**Audio Not Syncing:**
- Check browser console for errors
- Ensure autoplay is allowed in browser

## 📝 License

MIT

## 👥 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using MERN Stack
