import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import NowPlaying from '../components/NowPlaying';
import QueueList from '../components/QueueList';
import SearchPanel from '../components/SearchPanel';
import ActiveUsers from '../components/ActiveUsers';
import AudioPlayer from '../components/AudioPlayer';
import './RoomDashboard.css';

const RoomDashboard = () => {
    const { code } = useParams();
    const { roomData } = useRoom();
    const [showSearch, setShowSearch] = useState(false);

    const copyRoomCode = () => {
        navigator.clipboard.writeText(code);
        alert('Room code copied to clipboard!');
    };

    return (
        <div className="room-dashboard">
            <header className="room-header">
                <div className="room-info">
                    <h1>{roomData?.name || 'Room'}</h1>
                    <div className="room-code-display" onClick={copyRoomCode}>
                        <span className="code-label">Room Code:</span>
                        <span className="code-value">{code}</span>
                        <span className="copy-icon">📋</span>
                    </div>
                </div>
                <button className="search-toggle-btn" onClick={() => setShowSearch(!showSearch)}>
                    {showSearch ? '✕ Close Search' : '🔍 Search Songs'}
                </button>
            </header>

            <div className="dashboard-content">
                <div className="main-section">
                    {showSearch && <SearchPanel />}
                    <NowPlaying />
                    <QueueList />
                </div>
                <aside className="sidebar">
                    <ActiveUsers />
                </aside>
            </div>

            <AudioPlayer />
        </div>
    );
};

export default RoomDashboard;
