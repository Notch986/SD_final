// ejemplo de rutas
const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');

// Ruta para obtener todos los elementos
router.get('/', itemsController.getItems);

// Ruta para agregar un nuevo elemento
router.post('/', itemsController.addItem);

module.exports = router;
