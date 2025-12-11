import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import './QueueList.css';

const QueueList = () => {
    const { queue, voteSong } = useRoom();
    const [userVotes, setUserVotes] = useState({});

    const handleVote = (songId, vote) => {
        const currentVote = userVotes[songId] || 0;
        let newVote;

        if (currentVote === vote) {
            newVote = 0; // Remove vote
        } else {
            newVote = vote; // Set new vote
        }

        setUserVotes({ ...userVotes, [songId]: newVote });
        voteSong(songId, newVote);
    };

    if (queue.length === 0) {
        return (
            <div className="queue-list empty">
                <div className="empty-queue">
                    <div className="queue-icon">📝</div>
                    <h3>Queue is empty</h3>
                    <p>Search and add songs to the queue</p>
                </div>
            </div>
        );
    }

    return (
        <div className="queue-list">
            <h2>Up Next ({queue.length})</h2>
            <div className="queue-items">
                {queue.map((song, index) => (
                    <div key={song.id} className="queue-item">
                        <div className="queue-number">{index + 1}</div>
                        <div className="song-info">
                            <h4>{song.title}</h4>
                            <p>{song.artist}</p>
                        </div>
                        <div className="vote-controls">
                            <button
                                className={`vote-btn upvote ${userVotes[song.id] === 1 ? 'active' : ''}`}
                                onClick={() => handleVote(song.id, 1)}
                            >
                                ▲
                            </button>
                            <span className="vote-count">{song.voteCount || 0}</span>
                            <button
                                className={`vote-btn downvote ${userVotes[song.id] === -1 ? 'active' : ''}`}
                                onClick={() => handleVote(song.id, -1)}
                            >
                                ▼
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QueueList;
