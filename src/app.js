const simulatorForm = document.querySelector("#simulator-form");
const quizForm = document.querySelector("#quiz-form");
const results = {
  displaced: document.querySelector("#result-displaced"),
  buoyancy: document.querySelector("#result-buoyancy"),
  gravity: document.querySelector("#result-gravity"),
  density: document.querySelector("#result-density"),
  motion: document.querySelector("#result-motion"),
  state: document.querySelector("#result-state"),
  reason: document.querySelector("#result-reason")
};
const visualObject = document.querySelector("#visual-object");
const waterLine = document.querySelector("#water-line");
const formulaLine = document.querySelector("#formula-line");

function getSimulatorInput() {
  return {
    massKg: simulatorForm.massKg.value,
    volumeCm3: simulatorForm.volumeCm3.value,
    liquidDensity: simulatorForm.liquidDensity.value,
    submergedPercent: simulatorForm.submergedPercent.value
  };
}

function updateSimulator() {
  const data = Buoyancy.calculateBuoyancy(getSimulatorInput());
  results.displaced.textContent = `${data.display.displacedVolumeM3} m^3`;
  results.buoyancy.textContent = `${data.display.buoyantForceN} N`;
  results.gravity.textContent = `${data.display.gravityN} N`;
  results.density.textContent = `${data.display.objectDensity} kg/m^3`;
  results.motion.textContent = data.currentMotion;
  results.state.textContent = data.finalState;
  results.reason.textContent = `${data.currentReason} ${data.stateReason}`;

  simulatorForm.querySelectorAll("output[data-value-for]").forEach((output) => {
    const input = simulatorForm.elements[output.dataset.valueFor];
    output.textContent = input.value;
  });

  formulaLine.textContent = `F浮 = ${data.liquidDensity} * 10 * ${data.display.displacedVolumeM3} = ${data.display.buoyantForceN} N`;

  const depth = 18 + data.submergedPercent * 0.56;
  const volumeRatio = (data.volumeCm3 - 200) / (3000 - 200);
  const size = 54 + Math.sqrt(Math.max(0, volumeRatio)) * 104;
  visualObject.style.width = `${size}px`;
  visualObject.style.height = `${size}px`;
  visualObject.style.transform = `translateY(${depth}px)`;
  visualObject.dataset.state = data.finalState;
  waterLine.style.opacity = String(0.35 + data.submergedPercent / 180);
}

function renderAnswerControl(question) {
  if (question.type === "choice") {
    return `
      <fieldset class="option-list">
        <legend>选择答案</legend>
        ${question.options
          .map(
            (option) => `
              <label class="option-item">
                <input type="radio" name="${question.id}" value="${option.label}" />
                <span>${option.label}. ${option.text}</span>
              </label>
            `
          )
          .join("")}
      </fieldset>
    `;
  }

  return `
    <label>
      <span>你的答案</span>
      <input name="${question.id}" autocomplete="off" placeholder="输入答案" />
    </label>
  `;
}

function renderQuiz() {
  quizForm.innerHTML = Buoyancy.quizQuestions
    .map(
      (question, index) => `
        <article class="quiz-card" data-question-id="${question.id}">
          <div class="quiz-meta">
            <span class="level-pill">${question.level}</span>
            <span class="question-index">${index + 1} / ${Buoyancy.quizQuestions.length}</span>
          </div>
          <h4>${question.prompt}</h4>
          ${renderAnswerControl(question)}
          <button type="button" data-check="${question.id}">检查</button>
          <p class="feedback" id="feedback-${question.id}" aria-live="polite"></p>
        </article>
      `
    )
    .join("");
}

function getQuestionAnswer(questionId) {
  const field = quizForm.elements[questionId];
  if (!field) {
    return "";
  }

  if (field instanceof RadioNodeList) {
    return field.value;
  }

  return field.value;
}

function checkQuestion(questionId) {
  const question = Buoyancy.quizQuestions.find((item) => item.id === questionId);
  const feedback = document.querySelector(`#feedback-${questionId}`);
  const result = Buoyancy.evaluateAnswer(question, getQuestionAnswer(questionId));
  feedback.textContent = result.correct
    ? `${result.message} 详细解析：${result.explanation}`
    : `${result.message} 错误归因：${result.errorType}。详细解析：${result.explanation}`;
  feedback.dataset.correct = String(result.correct);
}

simulatorForm.addEventListener("input", updateSimulator);
quizForm.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-check]");
  if (button) {
    checkQuestion(button.dataset.check);
  }
});

renderQuiz();
updateSimulator();



