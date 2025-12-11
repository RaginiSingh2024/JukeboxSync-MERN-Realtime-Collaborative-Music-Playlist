import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../socket/socket';

const RoomContext = createContext();

export const useRoom = () => {
    const context = useContext(RoomContext);
    if (!context) {
        throw new Error('useRoom must be used within RoomProvider');
    }
    return context;
};

export const RoomProvider = ({ children }) => {
    const [roomData, setRoomData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [queue, setQueue] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentTrackStartTs, setCurrentTrackStartTs] = useState(null);
    const [users, setUsers] = useState([]);
    const [host, setHost] = useState(null);
    const [settings, setSettings] = useState({ skipThreshold: 0.5 });

    useEffect(() => {
        const socket = getSocket();

        socket.on('roomState', (state) => {
            setQueue(state.queue || []);
            setCurrentTrack(state.currentTrack);
            setCurrentTrackStartTs(state.currentTrackStartTs);
            setUsers(state.users || []);
            setHost(state.host);
            setSettings(state.settings || { skipThreshold: 0.5 });
        });

        socket.on('songAdded', ({ song }) => {
            // Room state will be updated via roomState event
        });

        socket.on('songVotesUpdated', ({ songId, voteCount, queue: updatedQueue }) => {
            setQueue(updatedQueue);
        });

        socket.on('trackChanged', ({ currentTrack: newTrack, currentTrackStartTs: newTs, queue: newQueue }) => {
            setCurrentTrack(newTrack);
            setCurrentTrackStartTs(newTs);
            setQueue(newQueue);
        });

        return () => {
            socket.off('roomState');
            socket.off('songAdded');
            socket.off('songVotesUpdated');
            socket.off('trackChanged');
        };
    }, []);

    const joinRoom = (room, userId) => {
        setRoomData(room);
        setCurrentUser(userId);

        const socket = getSocket();
        socket.emit('joinRoom', { roomCode: room.code, userId });
    };

    const addSong = (song) => {
        const socket = getSocket();
        socket.emit('addSong', {
            roomCode: roomData.code,
            song,
            userId: currentUser
        });
    };

    const voteSong = (songId, vote) => {
        const socket = getSocket();
        socket.emit('voteSong', {
            roomCode: roomData.code,
            songId,
            userId: currentUser,
            vote
        });
    };

    const skipTrack = () => {
        const socket = getSocket();
        if (host === currentUser) {
            socket.emit('hostSkip', {
                roomCode: roomData.code,
                userId: currentUser
            });
        } else {
            socket.emit('requestSkip', {
                roomCode: roomData.code,
                userId: currentUser
            });
        }
    };

    const value = {
        roomData,
        currentUser,
        queue,
        currentTrack,
        currentTrackStartTs,
        users,
        host,
        settings,
        joinRoom,
        addSong,
        voteSong,
        skipTrack,
        isHost: currentUser === host
    };

    return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
