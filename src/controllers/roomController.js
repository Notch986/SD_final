const roomModel = require('../models/roomModel');

const createRoom = async (req, res) => {
  try {
    const room = {
      name: req.body.name,
      ownerId: req.user.id, // Obtener el ID del usuario autenticado del token
    };
    const newRoom = await roomModel.createRoom(room);
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRoomsByOwner = async (req, res) => {
  try {
    const rooms = await roomModel.getRoomsByOwnerId(req.user.id);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createRoom,
  getRoomsByOwner,
};
