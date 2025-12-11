import React, { useState } from 'react';
import axios from 'axios';
import { useRoom } from '../context/RoomContext';
import { API_URL } from '../utils/config';
import './SearchPanel.css';

const SearchPanel = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { addSong } = useRoom();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/search`, { query });
            setResults(response.data.results || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSong = (song) => {
        addSong(song);
        // Show feedback
        const btn = document.querySelector(`[data-song-id="${song.id}"]`);
        if (btn) {
            btn.textContent = '✓ Added';
            setTimeout(() => {
                btn.textContent = '+ Add';
            }, 2000);
        }
    };

    return (
        <div className="search-panel">
            <h2>Search Songs</h2>
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search by title or artist..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-btn" disabled={loading}>
                    {loading ? '🔍' : 'Search'}
                </button>
            </form>

            <div className="search-results">
                {results.length === 0 && !loading && (
                    <div className="no-results">
                        <p>🎵 Search for songs to add to the queue</p>
                    </div>
                )}

                {results.map((song) => (
                    <div key={song.id} className="search-result-item">
                        <div className="result-artwork">♪</div>
                        <div className="result-info">
                            <h4>{song.title}</h4>
                            <p>{song.artist}</p>
                            <span className="duration">{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <button
                            className="add-song-btn"
                            onClick={() => handleAddSong(song)}
                            data-song-id={song.id}
                        >
                            + Add
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchPanel;
