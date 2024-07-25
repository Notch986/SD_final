let socket = io();

let room = localStorage.getItem('room'); // Assuming the room name is stored in local storage

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            parseSurveyFile(text);
        };
        reader.readAsText(file);
    }
}

function parseSurveyFile(text) {
    const lines = text.trim().split('\n');
    let surveys = [];
    let currentSurvey = null;

    lines.forEach(line => {
        if (line.startsWith('Pregunta: ')) {
            if (currentSurvey) {
                surveys.push(currentSurvey);
            }
            currentSurvey = {
                question: line.replace('Pregunta: ', '').trim(),
                options: []
            };
        } else if (line.startsWith('- ') && currentSurvey) {
            currentSurvey.options.push(line.replace('- ', '').trim());
        }
    });

    if (currentSurvey) {
        surveys.push(currentSurvey);
    }

    displaySurvey(surveys);

    // Send all surveys to the server
    socket.emit('createSurvey', { room: room, surveys });
}

function displaySurvey(surveys) {
    const surveyContainer = document.getElementById('surveyContainer');
    surveyContainer.innerHTML = surveys.map((survey, surveyIndex) => `
        <div class="survey-section">
            <p>${survey.question}</p>
            ${survey.options.map((option, index) => `
                <div>
                    <input type="radio" name="option${surveyIndex}" id="option${surveyIndex}_${index}" value="${option}">
                    <label for="option${surveyIndex}_${index}">${option}</label>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function startSurvey() {
    socket.emit('startSurvey', { room: room });
    alert('La encuesta ha comenzado');
}
function joinRoom(name, room) {
    if (!name || name.trim() === "") {
        alert("Tu nombre no puede estar vacío. Por favor, ingresa un nombre válido.");
        return;
    }
    socket.emit('joinRoom', { room, name });
    window.location.href = `respondSurvey.html?name=${name}&room=${room}`;
}

function createRoom(name, room) {
    if (!room || room.trim() === "") {
        alert("El nombre del room no puede estar vacío. Por favor, ingresa un nombre válido.");
        return;
    }

    if (!name || name.trim() === "") {
        alert("Tu nombre no puede estar vacío. Por favor, ingresa un nombre válido.");
        return;
    }

    socket.emit('createRoom', { room, name });
    window.location.href = `createSurvey.html?name=${name}&room=${room}`;
}
function loadRooms() {
    fetch('/rooms')
        .then(response => response.json())
        .then(data => {
            const roomsList = document.getElementById('rooms');
            roomsList.innerHTML = '';
            data.forEach(room => {
                const li = document.createElement('li');
                li.textContent = room;
                const button = document.createElement('button');
                button.textContent = 'Conectar';
                button.onclick = () => joinRoom(document.getElementById('name').value, room);
                li.appendChild(button);
                roomsList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error al cargar las salas:', error);
        });
}
