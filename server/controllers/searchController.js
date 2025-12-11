const fs = require('fs');
const path = require('path');

// Search songs from local JSON
exports.searchSongs = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // Read songs from JSON file
        const songsPath = path.join(__dirname, '../data/songs.json');
        const songsData = fs.readFileSync(songsPath, 'utf8');
        const songs = JSON.parse(songsData);

        // Filter songs based on query
        const searchQuery = query.toLowerCase();
        const results = songs.filter(song =>
            song.title.toLowerCase().includes(searchQuery) ||
            song.artist.toLowerCase().includes(searchQuery)
        );

        res.status(200).json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search songs' });
    }
};
