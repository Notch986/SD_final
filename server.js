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
    socket.on('joinRoom', ({ room, name }) => {
        console.log("======== JOINING ROOM ==========");
        if (rooms[room]) {
            socket.join(room);
            rooms[room].push({id: socket.id, name});
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
        console.log("======== JOINING ROOM ==========");
    });

    socket.on('createRoom', ({ room, name}) => {
        console.log("======== CREATING ROOM ==========");
        if (!rooms[room]) {
            rooms[room] = [];
            rooms[room].push({id: socket.id, name});
            socket.join(room);
            io.emit('rooms', Object.keys(rooms)); // Notificar a todos sobre la lista actualizada de rooms
            io.in(room).emit('message', `${name} created and joined the room ${room}`);
            console.log(`User ${name} created and joined room: ${room}`);
            console.log('Rooms:', rooms);
        } else {
            socket.emit('error', `Room ${room} already exists. Please choose another name.`);
        }
        console.log("======== CREATING ROOM ==========");
    });

    socket.on('createSurvey', ({ room, surveys: newSurveys }) => {
        console.log("======== CREATING SURVEY ==========");
        surveys[room] = newSurveys;
        io.in(room).emit('survey', newSurveys);
        console.log(`Surveys created in room ${room}:`, newSurveys);
        console.log("======== CREATING SURVEY ==========");
    });

    socket.on('submitResponse', ({ room, name, responses }) => {
        console.log("======== SUBMITING RESPONSE ==========");
        console.log(`Response received from ${name} in room ${room}:`, responses);
        io.in(room).emit('response', {name, responses});
        console.log("======== SUBMITING RESPONSE ==========");
    });

    socket.on('message', ({ room, message }) => {
        io.in(room).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log("======== DISCONNECTING ROOM ==========");
        for (const room in rooms) {
            if (rooms[room].filter(user => user.id === socket.id).length > 0) {
                rooms[room] = rooms[room].filter(user => user.id !== socket.id);
                io.in(room).emit('message', `User with socket ID: ${socket.id} disconnected`);  
            }
        }
        io.emit('rooms', Object.keys(rooms));
        console.log(`User with socket ID: ${socket.id} disconnected`);
        console.log('Rooms:', rooms);
        console.log("======== DISCONNECTING ROOM ==========");
    });
});

app.get('/rooms', (req, res) => {
    res.json(Object.keys(rooms));
});

server.listen(3002, '0.0.0.0', () => {
    console.log('Server is running on port 3002');
});
