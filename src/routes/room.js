const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authenticate = require('../middleware/authMiddleware');

router.post('/', authenticate, roomController.createRoom);
router.get('/', authenticate, roomController.getRoomsByOwner);

module.exports = router;
