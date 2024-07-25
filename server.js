const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {};
let surveys = {};  // Para almacenar las encuestas

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', ({ room, name }) => {
        if (rooms[room]) {
            socket.join(room);
            rooms[room].push(name);
            io.in(room).emit('message', `${name} joined the room ${room}`);
            io.to(room).emit('updateUsers', rooms[room]); // Notificar a todos en el room sobre la lista actualizada de usuarios
            console.log(`User ${name} joined room: ${room}`);
            console.log('Rooms:', rooms);
    
            // Enviar las encuestas a los nuevos usuarios de la sala
            if (surveys[room]) {
                socket.emit('survey', surveys[room]);
            }
        } else {
            socket.emit('error', `Room ${room} does not exist. Please create it first.`);
        }
    });

    socket.on('createRoom', ({ room, name }) => {
        if (!rooms[room]) {
            socket.join(room);
            rooms[room] = [name];
            io.emit('rooms', Object.keys(rooms)); // Notificar a todos sobre la lista actualizada de rooms
            io.in(room).emit('message', `${name} created and joined the room ${room}`);
            console.log(`User ${name} created and joined room: ${room}`);
            console.log('Rooms:', rooms);
        } else {
            socket.emit('error', `Room ${room} already exists. Please choose another name.`);
        }
    });

    socket.on('createSurvey', ({ room, surveys: newSurveys }) => {
        surveys[room] = newSurveys;
        io.in(room).emit('survey', newSurveys);
        console.log(`Surveys created in room ${room}:`, newSurveys);
    });

    socket.on('submitResponse', ({ room, responses }) => {
        console.log(`Response received in room ${room}:`, responses);
        io.in(room).emit('message', `Response received: ${responses}`);
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

server.listen(3002, '0.0.0.0', () => {
    console.log('Server is running on port 3002');
});
