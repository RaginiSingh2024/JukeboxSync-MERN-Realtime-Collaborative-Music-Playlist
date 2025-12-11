const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.post('/', roomController.createRoom);
router.post('/:code/join', roomController.joinRoom);
router.get('/:code', roomController.getRoomDetails);

// Additional REST endpoints for queue and control actions
router.post('/:code/add-song', roomController.addSongToRoom);
router.post('/:code/vote', roomController.voteInRoom);
router.post('/:code/skip', roomController.skipInRoom);
router.get('/:code/queue', roomController.getQueue);
router.get('/:code/active-users', roomController.getActiveUsers);

module.exports = router;
