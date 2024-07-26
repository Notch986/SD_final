let socket;
let room;
let name;
let isConnected = false;

function connectToRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    name = urlParams.get('name');
    room = urlParams.get('room');

    // Crear socket solo si no está conectado
    if (!socket) {
        socket = io();

        // Obtener el ID del socket después de la conexión
        socket.on('connect', () => {
            console.log('Socket connected with ID:', socket.id);

            // Emitir el evento joinRoom con nombre e ID del socket
            if (!isConnected) {
                socket.emit('joinRoom', { room, name });
                isConnected = true; // Actualizar el estado de conexión
            }
        });

        // Escuchar las encuestas que se envían al cliente
        socket.on('survey', (survey) => {
            displaySurvey(survey);
        });

        // Escuchar mensajes del servidor
        socket.on('message', (message) => {
            console.log(message);
        });

    }
}

function displaySurvey(surveys) {
    const surveyContainer = document.getElementById('survey');
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
            `).join('') + '<button onclick="submitResponse()">Enviar Respuesta</button>';
}

function submitResponse() {
    const responses = [];
    document.querySelectorAll('.survey-section').forEach((section, sectionIndex) => {
        const selectedOption = section.querySelector(`input[name="option${sectionIndex}"]:checked`);
        if (selectedOption) {
            responses.push(selectedOption.value);
        } else {
            // Si no hay opción seleccionada, agrega un valor predeterminado
            responses.push("No Respondida"); // o null, dependiendo de tu preferencia
        }
    });

    console.log(responses);

    socket.emit('submitResponse', { room, name, responses });
    alert("Respuestas enviadas correctamente");
}

function disconnectFromRoom() {
    if (socket && isConnected) {
        //socket.emit('disconnect', { room }); // Emitir un evento para salir de la sala
        socket.disconnect(); // Desconectar el socket
        isConnected = false; // Actualizar el estado de conexión
        alert('Desconectado de la sala');
        window.location.href = 'index.html'; // Redirigir al usuario a la página principal
    }
}

window.onload = connectToRoom;