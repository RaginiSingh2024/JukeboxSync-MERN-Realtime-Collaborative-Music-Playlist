import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/config';
import { useRoom } from '../context/RoomContext';
import { initSocket } from '../socket/socket';
import './Welcome.css';

const Welcome = () => {
    const [mode, setMode] = useState('welcome'); // welcome, create, join
    const [roomName, setRoomName] = useState('');
    const [userName, setUserName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { joinRoom } = useRoom();

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!roomName.trim() || !userName.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            initSocket();
            const response = await axios.post(`${API_URL}/api/rooms`, {
                name: roomName,
                hostName: userName
            });

            if (response.data.success) {
                joinRoom(response.data.room, response.data.userId);
                navigate(`/room/${response.data.room.code}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        if (!roomCode.trim() || !userName.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            initSocket();
            const response = await axios.post(`${API_URL}/api/rooms/${roomCode}/join`, {
                userName
            });

            if (response.data.success) {
                joinRoom(response.data.room, response.data.userId);
                navigate(`/room/${response.data.room.code}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to join room');
        } finally {
            setLoading(false);
        }
    };

    if (mode === 'welcome') {
        return (
            <div className="welcome-page">
                <div className="welcome-container">
                    <div className="welcome-header">
                        <h1 className="app-title">🎵 JukeboxSync</h1>
                        <p className="app-subtitle">Listen together, vote together, vibe together</p>
                    </div>

                    <div className="welcome-actions">
                        <button className="action-btn primary" onClick={() => setMode('create')}>
                            <span className="btn-icon">🎸</span>
                            <span className="btn-text">Create Room</span>
                        </button>
                        <button className="action-btn secondary" onClick={() => setMode('join')}>
                            <span className="btn-icon">🎧</span>
                            <span className="btn-text">Join Room</span>
                        </button>
                    </div>

                    <div className="features">
                        <div className="feature">
                            <div className="feature-icon">🔄</div>
                            <h3>Real-time Sync</h3>
                            <p>Everyone hears the same thing at the same time</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">🗳️</div>
                            <h3>Democratic Voting</h3>
                            <p>Vote on songs to shape the playlist</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">👥</div>
                            <h3>Collaborative</h3>
                            <p>Add songs and enjoy music together</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'create') {
        return (
            <div className="welcome-page">
                <div className="form-container">
                    <button className="back-btn" onClick={() => setMode('welcome')}>← Back</button>
                    <h2>Create a Room</h2>
                    <form onSubmit={handleCreateRoom}>
                        <div className="form-group">
                            <label>Room Name</label>
                            <input
                                type="text"
                                placeholder="My Awesome Playlist"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Your Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Room'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (mode === 'join') {
        return (
            <div className="welcome-page">
                <div className="form-container">
                    <button className="back-btn" onClick={() => setMode('welcome')}>← Back</button>
                    <h2>Join a Room</h2>
                    <form onSubmit={handleJoinRoom}>
                        <div className="form-group">
                            <label>Room Code</label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="form-input"
                                maxLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label>Your Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Joining...' : 'Join Room'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
};

export default Welcome;
