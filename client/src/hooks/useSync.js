import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../socket/socket';

export const useSync = (currentTrack, currentTrackStartTs) => {
    const [latency, setLatency] = useState(0);
    const [syncedPosition, setSyncedPosition] = useState(0);
    const audioRef = useRef(null);
    const lastSyncRef = useRef(0);

    // Measure latency
    useEffect(() => {
        const socket = getSocket();
        let pingInterval;

        const measureLatency = () => {
            const clientTimestamp = Date.now();
            socket.emit('playerSyncPing', { timestamp: clientTimestamp });
        };

        socket.on('playerSyncPong', ({ clientTimestamp, serverTimestamp }) => {
            const now = Date.now();
            const rtt = now - clientTimestamp;
            const estimatedLatency = rtt / 2;
            setLatency(estimatedLatency);
        });

        // Ping every 5 seconds
        pingInterval = setInterval(measureLatency, 5000);
        measureLatency(); // Initial ping

        return () => {
            clearInterval(pingInterval);
            socket.off('playerSyncPong');
        };
    }, []);

    // Calculate synced position
    useEffect(() => {
        if (!currentTrack || !currentTrackStartTs) {
            setSyncedPosition(0);
            return;
        }

        const updatePosition = () => {
            const now = Date.now();
            const adjustedStartTime = currentTrackStartTs + latency;
            const elapsed = (now - adjustedStartTime) / 1000; // Convert to seconds
            const position = Math.max(0, Math.min(elapsed, currentTrack.duration));
            setSyncedPosition(position);

            // Check drift and correct if needed
            if (audioRef.current && Math.abs(audioRef.current.currentTime - position) > 1) {
                console.log(`Drift detected: ${Math.abs(audioRef.current.currentTime - position)}s, correcting...`);
                audioRef.current.currentTime = position;
                lastSyncRef.current = now;
            }
        };

        const interval = setInterval(updatePosition, 100);
        updatePosition();

        return () => clearInterval(interval);
    }, [currentTrack, currentTrackStartTs, latency]);

    return { syncedPosition, latency, audioRef };
};
