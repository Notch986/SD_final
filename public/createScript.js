let socket;
let room;
let answers = [];
let surveys = [];
let isConnected = false;

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            parseSurveyFile(text);
        };
        reader.readAsText(file);
    }
}

function parseSurveyFile(text) {
    const lines = text.trim().split('\n');
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
}

function displaySurvey(surveys) {
    const contentContainer = document.getElementById('content');
    const surveyContainer = document.createElement("div");
    surveyContainer.innerHTML = `
                <div class="button-container">
                    <div class="accordion">Encuesta: Mostrar/Ocultar</div>
                    <button id="sendSurvey" onclick="startSurvey()">Iniciar Encuesta</button>
                </div>
                <div class="panel">
                    ${surveys.map((survey, surveyIndex) => `
                        <div class="survey-section">
                            <p>${survey.question}</p>
                            ${survey.options.map((option, index) => `
                                <div>
                                    <input type="radio" name="option${surveyIndex}" id="option${surveyIndex}_${index}" value="${option} disabled">
                                    <label for="option${surveyIndex}_${index}">${option}</label>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            `;

    contentContainer.appendChild(surveyContainer);
    setupAccordion(); // Inicializar la funcionalidad de acordeón
}

function startSurvey() {
    const btnSurvey = document.getElementById('sendSurvey');
    btnSurvey.disabled = true;
    btnSurvey.innerHTML = 'Encuesta iniciada';
    btnSurvey.style.backgroundColor = 'red';
    socket.emit('createSurvey', { room: room, surveys });
    alert('La encuesta ha comenzado');
}


function connectToRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
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

        // Escuchar mensajes del servidor
        socket.on('message', (message) => {
            console.log(message);
        });

        socket.on("response", ({ name, responses }) => {
            // Añadir o actualizar la respuesta en el array de answers
            if (answers.some((ans) => ans.name === name)) {
                answers = answers.map((ans) =>
                    ans.name === name ? { name, responses } : ans
                );
            } else {
                answers.push({ name, responses });
            }
            console.log(answers);

            // Mostrar respuestas en pantalla
            displayResponses();
        });
    }
}

function displayResponses() {
    const responseContainer = document.getElementById("responseContainer");
    responseContainer.innerHTML = `
                <h2>Respuestas Recibidas</h2>
                <div class="response-list">
                    ${answers
            .map(
                (answer) => `
                        <div class="response-item accordion">
                            ${answer.name}
                        </div>
                        <div class="panel">
                                    ${answer.responses
                        .map(
                            (response, index) => `
                                        <div>Respuesta ${index + 1}: ${response}</div>
                                    `
                        )
                        .join("")}
                            </div>
                    `
            )
            .join("")}
                </div>
            `;

    if (answers.length > 0) {
        const downloadButton = document.createElement('button');
        downloadButton.id = 'downloadResponses';
        downloadButton.innerHTML = 'Descargar Respuestas';
        downloadButton.onclick = downloadResponses;
        responseContainer.appendChild(downloadButton);
    }
    // Añadir eventos a cada nuevo acordeón de respuesta
    setupAccordion();
}

function downloadResponses() {
    // Crear el contenido del archivo de respuestas con preguntas
    let content = 'Preguntas y Respuestas Formuladas:\n\n';

    surveys.forEach((survey, surveyIndex) => {
        content += `Pregunta ${surveyIndex + 1}: ${survey.question}\n`;
        survey.options.forEach((option, optionIndex) => {
            content += ` - Opción ${optionIndex + 1}: ${option}\n`;
        });
        content += '\n';
    });

    content += 'Respuestas de Usuarios:\n\n';

    answers.forEach((answer, index) => {
        content += `Usuario: ${answer.name}\n`;
        answer.responses.forEach((response, i) => {
            content += ` - Respuesta ${i + 1}: ${response}\n`;
        });
        content += '\n';
    });

    // Crear un Blob y enlace para descargar el archivo
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'respuestas.txt';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function setupAccordion() {
    const accordions = document.querySelectorAll(".accordion");
    const panels = document.querySelectorAll(".panel");

    accordions.forEach((accordion, index) => {
        accordion.addEventListener("click", function () {
            this.classList.toggle("active");
            if (panels[index].style.display === "block") {
                panels[index].style.display = "none";
            } else {
                panels[index].style.display = "block";
            }
        });
    });
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