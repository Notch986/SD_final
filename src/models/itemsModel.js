const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
});

console.log(Item === sequelize.models.Item);

module.exports = Item;