import React, { useEffect } from 'react';
import { useRoom } from '../context/RoomContext';
import { useSync } from '../hooks/useSync';
import './AudioPlayer.css';

const AudioPlayer = () => {
    const { currentTrack, currentTrackStartTs } = useRoom();
    const { syncedPosition, latency, audioRef } = useSync(currentTrack, currentTrackStartTs);

    useEffect(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.currentTime = syncedPosition;
            audioRef.current.play().catch(err => {
                console.log('Autoplay prevented:', err);
            });
        }
    }, [currentTrack, syncedPosition, audioRef]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentTrack) {
        return null;
    }

    return (
        <div className="audio-player">
            <audio
                ref={audioRef}
                src={currentTrack.url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
                onEnded={() => {
                    // Track will auto-advance via server
                }}
            />
            <div className="player-info">
                <div className="sync-indicator">
                    <span className="sync-dot"></span>
                    <span className="sync-text">Synced (latency: {Math.round(latency)}ms)</span>
                </div>
                <div className="time-display">
                    {formatTime(syncedPosition)} / {formatTime(currentTrack.duration)}
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
