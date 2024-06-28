// ejemplo de controlador
const itemsModel = require('../models/itemsModel');

const getItems = async (req, res) => {
  try {
    const items = await itemsModel.getItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addItem = async (req, res) => {
  try {
    const newItem = await itemsModel.addItem(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getItems,
  addItem,
};