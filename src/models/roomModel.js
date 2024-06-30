const pool = require('../config/db');

const createRoom = async (room) => {
  const { name, ownerId } = room;
  const result = await pool.query(
    'INSERT INTO rooms (name, owner_id) VALUES ($1, $2) RETURNING *',
    [name, ownerId]
  );
  return result.rows[0];
};

const getRoomsByOwnerId = async (ownerId) => {
  const result = await pool.query(
    'SELECT * FROM rooms WHERE owner_id = $1',
    [ownerId]
  );
  return result.rows;
};

module.exports = {
  createRoom,
  getRoomsByOwnerId,
};
