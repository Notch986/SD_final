const pool = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async (user) => {
  const { name, username, password } = user;
  const hashedPassword = await bcrypt.hash(password, 10);
  const res = await pool.query(
    'INSERT INTO users (name, username, password) VALUES ($1, $2, $3) RETURNING *',
    [name, username, hashedPassword]
  );
  return res.rows[0];
};

const getUserByUsername = async (username) => {
  const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return res.rows[0];
};

module.exports = {
  createUser,
  getUserByUsername,
};
