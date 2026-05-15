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

function renderQuiz() {
  quizForm.innerHTML = Buoyancy.quizQuestions
    .map(
      (question) => `
        <article class="quiz-card" data-question-id="${question.id}">
          <div class="level-pill">${question.level}</div>
          <h4>${question.prompt}</h4>
          <label>
            <span>你的答案</span>
            <input name="${question.id}" autocomplete="off" placeholder="输入答案" />
          </label>
          <button type="button" data-check="${question.id}">检查</button>
          <p class="feedback" id="feedback-${question.id}" aria-live="polite"></p>
        </article>
      `
    )
    .join("");
}

function checkQuestion(questionId) {
  const question = Buoyancy.quizQuestions.find((item) => item.id === questionId);
  const input = quizForm.elements[questionId];
  const feedback = document.querySelector(`#feedback-${questionId}`);
  const result = Buoyancy.evaluateAnswer(question, input.value);
  feedback.textContent = result.correct
    ? `${result.message} ${result.explanation}`
    : `${result.message} 错误归因：${result.errorType}。解析：${result.explanation}`;
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

