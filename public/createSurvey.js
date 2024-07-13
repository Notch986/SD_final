let socket;
let room;

document.addEventListener('DOMContentLoaded', (event) => {
    socket = io();
    room = localStorage.getItem('room');
});

function addQuestion() {
    const questionsContainer = document.getElementById('questionsContainer');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
        <input type="text" placeholder="Pregunta" class="question-text">
        <input type="text" placeholder="Opción 1" class="option">
        <input type="text" placeholder="Opción 2" class="option">
        <input type="text" placeholder="Opción 3" class="option">
        <input type="text" placeholder="Opción 4" class="option">
        <input type="text" placeholder="Opción 5" class="option">
    `;
    questionsContainer.appendChild(questionDiv);
}

function createSurvey() {
    const questions = Array.from(document.getElementsByClassName('question')).map(questionDiv => {
        const questionText = questionDiv.querySelector('.question-text').value;
        const options = Array.from(questionDiv.getElementsByClassName('option')).map(optionInput => optionInput.value);
        return { question: questionText, options };
    });

    socket.emit('createSurvey', { room, surveys: questions });
}

function startSurvey() {
    alert("La encuesta ha comenzado");
}

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

    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = ''; // Clear existing questions
    surveys.forEach(survey => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `
            <input type="text" placeholder="Pregunta" class="question-text" value="${survey.question}">
            ${survey.options.map(option => `<input type="text" placeholder="Opción" class="option" value="${option}">`).join('')}
        `;
        questionsContainer.appendChild(questionDiv);
    });
}
