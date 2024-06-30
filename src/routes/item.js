// ejemplo de rutas
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Ruta para obtener todos los elementos
router.get('/', itemController.getItems);

// Ruta para agregar un nuevo elemento
router.post('/', itemController.addItem);

module.exports = router;
