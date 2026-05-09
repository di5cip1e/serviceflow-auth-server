import { QUESTIONS, GOVERNMENT_TYPES } from './config.js';

export class QuizScene {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.currentQuestionIndex = 0;
    this.scores = {
      autocracy: 0,
      democracy: 0,
      theocracy: 0,
      oligarchy: 0,
      militarism: 0,
      diplomacy: 0,
      populism: 0
    };
    
    this.container = null;
    this.init();
  }

  init() {
    const uiContainer = document.getElementById('ui-container');
    
    this.container = document.createElement('div');
    this.container.className = 'ui-panel';
    this.container.innerHTML = `
      <h1>The Counsel</h1>
      <p class="subtitle">Shape the ruler you will serve</p>
      <div id="quiz-content"></div>
    `;
    
    uiContainer.appendChild(this.container);
    
    this.showQuestion();
  }

  showQuestion() {
    const question = QUESTIONS[this.currentQuestionIndex];
    const content = document.getElementById('quiz-content');
    
    content.innerHTML = `
      <div class="question">
        <div class="question-text">${question.text}</div>
        ${question.options.map((option, index) => `
          <button class="option-button" data-index="${index}">
            ${option.text}
          </button>
        `).join('')}
      </div>
    `;
    
    // Add event listeners to option buttons
    content.querySelectorAll('.option-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const optionIndex = parseInt(e.target.dataset.index);
        this.selectOption(optionIndex);
      });
    });
  }

  selectOption(optionIndex) {
    const question = QUESTIONS[this.currentQuestionIndex];
    const option = question.options[optionIndex];
    
    // Add weights to scores
    Object.entries(option.weights).forEach(([key, value]) => {
      this.scores[key] += value;
    });
    
    // Move to next question
    this.currentQuestionIndex++;
    
    if (this.currentQuestionIndex < QUESTIONS.length) {
      this.showQuestion();
    } else {
      this.showResults();
    }
  }

  showResults() {
    const governmentType = this.calculateGovernmentType();
    const govData = GOVERNMENT_TYPES[governmentType];
    
    const content = document.getElementById('quiz-content');
    content.innerHTML = `
      <div class="government-result">
        <p style="font-size: 1.2rem; color: #a89070;">Your realm shall be governed as a...</p>
        <div class="government-type">${govData.name}</div>
        <div class="government-description">${govData.description}</div>
      </div>
      <button class="action-button" id="continue-button">Continue to Ruler Stats</button>
    `;
    
    document.getElementById('continue-button').addEventListener('click', () => {
      this.destroy();
      this.onComplete(governmentType);
    });
  }

  calculateGovernmentType() {
    // Determine primary government type based on highest score
    const primaryTypes = ['autocracy', 'democracy', 'theocracy', 'oligarchy', 'militarism'];
    
    let highestScore = 0;
    let governmentType = 'autocracy';
    
    primaryTypes.forEach(type => {
      if (this.scores[type] > highestScore) {
        highestScore = this.scores[type];
        governmentType = type;
      }
    });
    
    return governmentType;
  }

  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
