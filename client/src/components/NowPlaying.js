import React from 'react';
import { useRoom } from '../context/RoomContext';
import './NowPlaying.css';

const NowPlaying = () => {
    const { currentTrack, skipTrack, isHost } = useRoom();

    if (!currentTrack) {
        return (
            <div className="now-playing empty">
                <div className="empty-state">
                    <div className="music-icon">🎵</div>
                    <h3>No track playing</h3>
                    <p>Add songs to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="now-playing">
            <div className="now-playing-header">
                <h2>Now Playing</h2>
                <button className="skip-btn" onClick={skipTrack}>
                    {isHost ? 'Skip' : 'Vote Skip'}
                </button>
            </div>
            <div className="track-card">
                <div className="track-artwork">
                    <div className="artwork-placeholder">
                        <span className="music-note">♪</span>
                    </div>
                    <div className="playing-animation">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                </div>
                <div className="track-info">
                    <h3 className="track-title">{currentTrack.title}</h3>
                    <p className="track-artist">{currentTrack.artist}</p>
                    <p className="track-meta">Added by User</p>
                </div>
            </div>
        </div>
    );
};

export default NowPlaying;
