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

const quizState = {
  currentIndex: 0,
  answers: {},
  results: {},
  completed: false
};

function renderAnswerControl(question) {
  const savedAnswer = quizState.answers[question.id] || "";

  if (question.type === "choice") {
    return `
      <fieldset class="option-list">
        <legend>选择答案</legend>
        ${question.options
          .map(
            (option) => `
              <label class="option-item">
                <input type="radio" name="${question.id}" value="${option.label}" ${savedAnswer === option.label ? "checked" : ""} />
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
      <input name="${question.id}" autocomplete="off" placeholder="输入答案" value="${savedAnswer}" />
    </label>
  `;
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

function getAnsweredCount() {
  return Object.keys(quizState.results).length;
}

function renderProgress() {
  const total = Buoyancy.quizQuestions.length;
  const answered = getAnsweredCount();
  const percent = Math.round((answered / total) * 100);

  return `
    <div class="quiz-progress" aria-label="练习进度">
      <div class="progress-topline">
        <span>已完成 ${answered} / ${total}</span>
        <span>${percent}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width: ${percent}%"></div></div>
    </div>
  `;
}

function renderQuiz() {
  if (quizState.completed) {
    renderReview();
    return;
  }

  const question = Buoyancy.quizQuestions[quizState.currentIndex];
  const result = quizState.results[question.id];
  const isLast = quizState.currentIndex === Buoyancy.quizQuestions.length - 1;

  quizForm.innerHTML = `
    ${renderProgress()}
    <article class="quiz-focus-card" data-question-id="${question.id}">
      <div class="quiz-meta">
        <span class="level-pill">${question.level}</span>
        <span class="question-index">第 ${quizState.currentIndex + 1} 题 / 共 ${Buoyancy.quizQuestions.length} 题</span>
      </div>
      <h4>${question.prompt}</h4>
      ${renderAnswerControl(question)}
      <div class="quiz-actions">
        <button type="button" data-action="prev" ${quizState.currentIndex === 0 ? "disabled" : ""}>上一题</button>
        <button type="button" data-action="submit">提交本题</button>
        <button type="button" data-action="next" ${result ? "" : "disabled"}>${isLast ? "查看总复盘" : "下一题"}</button>
      </div>
      <div class="feedback-panel" aria-live="polite">
        ${result ? renderQuestionFeedback(result) : "<p>提交后会显示判定、错误归因和详细解析。</p>"}
      </div>
    </article>
  `;
}

function renderQuestionFeedback(result) {
  return `
    <p class="feedback" data-correct="${result.correct}">${result.correct ? "回答正确。" : `回答错误。错误归因：${result.errorType}。`}</p>
    <p><strong>详细解析：</strong>${result.explanation}</p>
  `;
}

function submitCurrentQuestion() {
  const question = Buoyancy.quizQuestions[quizState.currentIndex];
  const answer = getQuestionAnswer(question.id);
  quizState.answers[question.id] = answer;
  quizState.results[question.id] = {
    ...Buoyancy.evaluateAnswer(question, answer),
    answer
  };
  renderQuiz();
}

function goToNextQuestion() {
  const isLast = quizState.currentIndex === Buoyancy.quizQuestions.length - 1;
  if (isLast) {
    quizState.completed = true;
  } else {
    quizState.currentIndex += 1;
  }
  renderQuiz();
}

function goToPreviousQuestion() {
  quizState.currentIndex = Math.max(0, quizState.currentIndex - 1);
  renderQuiz();
}

function restartQuiz() {
  quizState.currentIndex = 0;
  quizState.answers = {};
  quizState.results = {};
  quizState.completed = false;
  renderQuiz();
}

function renderReview() {
  const total = Buoyancy.quizQuestions.length;
  const correctCount = Buoyancy.quizQuestions.filter((question) => quizState.results[question.id]?.correct).length;
  const percent = Math.round((correctCount / total) * 100);

  quizForm.innerHTML = `
    <section class="review-panel">
      <div class="review-hero">
        <div>
          <p class="eyebrow">练习复盘</p>
          <h3>${correctCount} / ${total} 题正确</h3>
          <p>正确率 ${percent}%。下面按题目列出你的答案、正确情况和详细讲解。</p>
        </div>
        <button type="button" data-action="restart">重新练习</button>
      </div>
      <div class="review-list">
        ${Buoyancy.quizQuestions.map((question, index) => renderReviewItem(question, index)).join("")}
      </div>
    </section>
  `;
}

function renderReviewItem(question, index) {
  const result = quizState.results[question.id];
  const answer = result?.answer || "未作答";
  const correctAnswer = question.answers[0];

  return `
    <article class="review-item" data-correct="${Boolean(result?.correct)}">
      <div class="quiz-meta">
        <span class="level-pill">${question.level}</span>
        <span class="question-index">第 ${index + 1} 题</span>
      </div>
      <h4>${question.prompt}</h4>
      <p><strong>你的答案：</strong>${answer || "未作答"}</p>
      <p><strong>参考答案：</strong>${correctAnswer}</p>
      <p><strong>判定：</strong>${result?.correct ? "正确" : "错误"}</p>
      ${result?.correct ? "" : `<p><strong>错误归因：</strong>${result?.errorType || question.errorType}</p>`}
      <p><strong>详细解析：</strong>${question.explanation}</p>
    </article>
  `;
}simulatorForm.addEventListener("input", updateSimulator);
quizForm.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const actions = {
    submit: submitCurrentQuestion,
    next: goToNextQuestion,
    prev: goToPreviousQuestion,
    restart: restartQuiz
  };

  actions[button.dataset.action]?.();
});

renderQuiz();
updateSimulator();





