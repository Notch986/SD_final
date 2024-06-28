// models/itemsModel.js
const pool = require('../config/db');

const getItems = async () => {
  const res = await pool.query('SELECT * FROM items');
  return res.rows;
};

const addItem = async (item) => {
  const { name } = item;
  const res = await pool.query('INSERT INTO items (name) VALUES ($1) RETURNING *', [name]);
  return res.rows[0];
};

module.exports = {
  getItems,
  addItem,
};
