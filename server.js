require('dotenv').config();
const port = process.env.PORT || 3001;

const express = require('express');
const app = express();

app.use(express.json());

// publica los archivos de la carpeta public
// modificar para utilizar vue o react
app.use(express.static('public'));

// agregando rutas de la api
// ver ejemplo de rutas en src/routes/items
const itemRouter = require('./src/routes/item');
const authRouter = require('./src/routes/auth');
const roomRouter = require('./src/routes/room');
const authenticate = require('./src/middleware/authMiddleware');

app.use('/api/items', authenticate, itemRouter); // Proteger las rutas de items
app.use('/api/rooms', authenticate, roomRouter);
app.use('/api/auth', authRouter);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
