const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {};
let surveys = {};  // Para almacenar las encuestas

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', ({ room, name }) => {
        socket.join(room);
        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push(name);
        io.in(room).emit('message', `${name} joined the room ${room}`);
        io.emit('rooms', Object.keys(rooms));
        console.log(`User ${name} joined room: ${room}`);
        console.log('Rooms:', rooms);

        // Enviar las encuestas a los nuevos usuarios de la sala
        if (surveys[room]) {
            socket.emit('survey', surveys[room]);
        }
    });

    socket.on('createSurvey', ({ room, surveys: newSurveys }) => {
        surveys[room] = newSurveys;
        io.in(room).emit('survey', newSurveys);
        console.log(`Surveys created in room ${room}:`, newSurveys);
    });

    socket.on('submitResponse', ({ room, response }) => {
        console.log(`Response received in room ${room}:`, response);
        io.in(room).emit('message', `Response received: ${response}`);
    });

    socket.on('message', ({ room, message }) => {
        io.in(room).emit('message', message);
    });

    socket.on('disconnect', () => {
        for (const room in rooms) {
            rooms[room] = rooms[room].filter(name => name !== socket.id);
            if (rooms[room].length === 0) {
                delete rooms[room];
                delete surveys[room];
            }
        }
        io.emit('rooms', Object.keys(rooms));
        console.log('A user disconnected');
        console.log('Rooms:', rooms);
    });
});

app.get('/rooms', (req, res) => {
    res.json(Object.keys(rooms));
});

server.listen(3001, '0.0.0.0', () => {
    console.log('Server is running on port 3001');
});
