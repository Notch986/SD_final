// ejemplo de controlador
const Item = require('../models/itemsModel');

const getItems = async (req, res) => {
  try {
    const items = await Item.findAll({attributes: ['id', 'name']});
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addItem = async (req, res) => {
  try {
    const newItem = await Item.create(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getItems,
  addItem,
};