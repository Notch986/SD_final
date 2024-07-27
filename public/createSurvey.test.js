/**
 * @jest-environment jsdom
 */

const { createSurvey, parseSurveyFile, addQuestion } = require('./createSurvey');
const io = require('socket.io-client');

describe('createSurvey', () => {
  let socket;
  let room;

  beforeEach((done) => {
    document.body.innerHTML = '<div id="questionsContainer"></div>';

    socket = io('http://localhost:3002'); // Ajusta el puerto si es necesario

    socket.on('connect', () => {
      room = 'testRoom';
      localStorage.setItem('room', room);
      done();
    });
  });

  afterEach(() => {
    socket.disconnect();
  });

  test('debería crear una encuesta con preguntas y opciones', (done) => {
    document.getElementById('questionsContainer').innerHTML = `
      <div class="question">
        <input type="text" class="question-text" value="Pregunta 1">
        <input type="text" class="option" value="Opción A">
        <input type="text" class="option" value="Opción B">
      </div>
      <div class="question">
        <input type="text" class="question-text" value="Pregunta 2">
        <input type="text" class="option" value="Opción X">
        <input type="text" class="option" value="Opción Y">
      </div>
    `;

    createSurvey();

    socket.on('createSurvey', (data) => {
      expect(data).toEqual({
        room: 'testRoom',
        surveys: [
          { question: 'Pregunta 1', options: ['Opción A', 'Opción B'] },
          { question: 'Pregunta 2', options: ['Opción X', 'Opción Y'] },
        ]
      });
      done();
    });
  });

  test('debería manejar correctamente un archivo de encuesta', (done) => {
    const surveyFileText = `
      Pregunta: ¿Cuál es tu color favorito?
      - Rojo
      - Azul
      - Verde

      Pregunta: ¿Te gusta el helado?
      - Sí
      - No
    `;

    parseSurveyFile(surveyFileText);
    createSurvey();

    socket.on('createSurvey', (data) => {
      expect(data).toEqual({
        room: 'testRoom',
        surveys: [
          { question: '¿Cuál es tu color favorito?', options: ['Rojo', 'Azul', 'Verde'] },
          { question: '¿Te gusta el helado?', options: ['Sí', 'No'] },
        ]
      });
      done();
    });
  });

  test('addQuestion debería añadir una nueva pregunta con campos de opciones', () => {
    const initialQuestionCount = document.getElementsByClassName('question').length;

    addQuestion();

    const newQuestionCount = document.getElementsByClassName('question').length;
    expect(newQuestionCount).toBe(initialQuestionCount + 1);
  });
});

