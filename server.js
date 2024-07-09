require('dotenv').config();
const { sequelize } = require('./src/config/db');
const PORT = process.env.PORT || 3001;

const express = require('express');
const app = express();

app.use(express.json());

// publica los archivos de la carpeta public
// modificar para utilizar vue o react
app.use(express.static('public'));

// agregando rutas de la api
// ver ejemplo de rutas en src/routes/items
const itemsRouter = require('./src/routes/items');
const authRouter = require('./src/routes/auth');
const authenticate = require('./src/middleware/authMiddleware');

app.use('/api/items', authenticate, itemsRouter); // Proteger las rutas de items
app.use('/api/auth', authRouter);

sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });