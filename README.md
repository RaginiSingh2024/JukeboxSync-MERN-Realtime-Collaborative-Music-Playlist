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

**Frontend (React + Vite):**
- React.js
- Context API
- React Router
- Socket.IO Client
- CSS3 with Gradients & Animations

**Backend (Node + Express):**
- Node.js
- Express.js REST API
- Socket.IO Server
- MongoDB Atlas
- Mongoose

**Deployment:**
- 𝐅𝐫𝐨𝐧𝐭𝐞𝐧𝐝: Vercel

- 𝐁𝐚𝐜𝐤𝐞𝐧𝐝: Render

- 𝐃𝐚𝐭𝐚𝐛𝐚𝐬𝐞: MongoDB Atlas

# 🎯 Project Features

🔹 𝟏. 𝐂𝐫𝐞𝐚𝐭𝐞 𝐨𝐫 𝐉𝐨𝐢𝐧 𝐑𝐨𝐨𝐦𝐬

Each room has a unique Room Code.

Users join the same room and collaborate live.

🔹 𝟐. 𝐒𝐞𝐚𝐫𝐜𝐡 𝐒𝐨𝐧𝐠𝐬 (𝐃𝐮𝐦𝐦𝐲 𝐉𝐒𝐎𝐍)

Local dummy song data stored in backend.

Searching filters results in real-time.

🔹 𝟑. 𝐀𝐝𝐝 𝐒𝐨𝐧𝐠𝐬 𝐭𝐨 𝐐𝐮𝐞𝐮𝐞

Songs added by any user appear instantly for everyone.

Managed using Socket.io events.

🔹 𝟒. 𝐍𝐨𝐰 𝐏𝐥𝐚𝐲𝐢𝐧𝐠 𝐒𝐞𝐜𝐭𝐢𝐨𝐧

Shows current song, artist, duration.

🔹 𝟓. 𝐑𝐞𝐚𝐥-𝐓𝐢𝐦𝐞 𝐒𝐲𝐧𝐜

Queue changes

Song skip voting

User joining/leaving
Everything syncs instantly via WebSockets.

🔹 𝟔. 𝐕𝐨𝐭𝐞-𝐭𝐨-𝐒𝐤𝐢𝐩 𝐒𝐲𝐬𝐭𝐞𝐦

Users vote to skip the current song.

If majority votes reached → automatically skips to next track.

🔹 𝟕. 𝐃𝐚𝐭𝐚𝐛𝐚𝐬𝐞 𝐈𝐧𝐭𝐞𝐠𝐫𝐚𝐭𝐢𝐨𝐧 (𝐌𝐨𝐧𝐠𝐨𝐃𝐁 𝐀𝐭𝐥𝐚𝐬)
Stores:

Room details

Song queue

Active user IDs

Voting data

## 📌 Project Summary

JukeboxSync is a MERNG + Socket.io based real-time collaborative music playlist application where users can:

✔ Join a room using a room code

✔ Search songs

✔ Add songs to a shared queue

✔ Vote to skip songs

✔ See real-time updates for all users

✔ View active users in the room

This project demonstrates 𝐫𝐞𝐚𝐥-𝐭𝐢𝐦𝐞 𝐜𝐨𝐦𝐦𝐮𝐧𝐢𝐜𝐚𝐭𝐢𝐨𝐧, 𝐑𝐄𝐒𝐓 𝐀𝐏𝐈 𝐝𝐞𝐯𝐞𝐥𝐨𝐩𝐦𝐞𝐧𝐭, 𝐌𝐨𝐧𝐠𝐨𝐃𝐁 𝐢𝐧𝐭𝐞𝐠𝐫𝐚𝐭𝐢𝐨𝐧, 𝐟𝐫𝐨𝐧𝐭𝐞𝐧𝐝–𝐛𝐚𝐜𝐤𝐞𝐧𝐝 𝐜𝐨𝐦𝐦𝐮𝐧𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐚𝐧𝐝 𝐝𝐞𝐩𝐥𝐨𝐲𝐦𝐞𝐧𝐭 𝐬𝐤𝐢𝐥𝐥𝐬, as required in 𝐦𝐲 𝐒𝐞𝐦𝐞𝐬𝐭𝐞𝐫 𝟑 𝐅𝐢𝐧𝐚𝐥 𝐏𝐫𝐚𝐜𝐭𝐢𝐜𝐚𝐥 𝐒𝐮𝐛𝐦𝐢𝐬𝐬𝐢𝐨𝐧.

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


## 🎯 Live Deployment Links

🚀 𝐅𝐫𝐨𝐧𝐭𝐞𝐧𝐝 (𝐕𝐞𝐫𝐜𝐞𝐥): 
🔗 https://jukebox-sync-client.vercel.app

🌐 𝐁𝐚𝐜𝐤𝐞𝐧𝐝 𝐀𝐏𝐈 (𝐑𝐞𝐧𝐝𝐞𝐫): 
🔗 https://jukeboxsync-server.onrender.com

🎨 𝐅𝐢𝐠𝐦𝐚 𝐔𝐈 𝐃𝐞𝐬𝐢𝐠𝐧:
🔗 https://stitch.withgoogle.com/projects/9568568451094296032

📦 𝐌𝐚𝐢𝐧 𝐑𝐞𝐩𝐨𝐬𝐢𝐭𝐨𝐫𝐲: 🔗 https://github.com/RaginiSingh2024/JukeboxSync-MERN-Realtime-Collaborative-Music-Playlist

## 📄 Final Project Documentation: 
The complete project documentation for my **3rd Semester Final Exam** is available here:

🔗 **Google Docs (Final Report):** 
https://docs.google.com/document/d/131FAxowzHDDpkFV_0wDaWU-4Mar1FPPTrfKfk5x75dU/edit?usp=sharing

This document includes:
- Problem Statement & Solution
- MERN Stack Architecture
- Frontend (React) explanation
- Backend (Node & Express) explanation
- MongoDB Database design
- Real-time Socket.IO flow
- Figma UI Design
- Deployment links

# 👩‍💻 Author

𝑵𝒂𝒎𝒆: 𝑹𝒂𝒈𝒊𝒏𝒊 𝑺𝒊𝒏𝒈𝒉

𝑪𝒐𝒖𝒓𝒔𝒆: 𝑩.𝑻𝒆𝒄𝒉 𝑪𝑺𝑬 – 3𝒓𝒅 𝑺𝒆𝒎𝒆𝒔𝒕𝒆𝒓

𝑷𝒓𝒐𝒋𝒆𝒄𝒕: 𝑹𝒆𝒂𝒍-𝑻𝒊𝒎𝒆 𝑪𝒐𝒍𝒍𝒂𝒃𝒐𝒓𝒂𝒕𝒊𝒗𝒆 𝑴𝒖𝒔𝒊𝒄 𝑷𝒍𝒂𝒚𝒍𝒊𝒔𝒕 𝑺𝒚𝒔𝒕𝒆𝒎

## 👥 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using MERN Stack
