const learningCatalog = {
  physics: {
    title: "物理",
    description: "从现象、实验和模型理解初中物理核心概念。",
    topics: [
      { id: "buoyancy", title: "浮力", chapter: "压强与浮力", status: "完整", summary: "阿基米德原理、浮沉条件、实验测浮力和分层练习。" },
      { id: "speed", title: "速度", chapter: "运动和力", status: "预览", summary: "用路程和时间理解运动快慢，提供轻量交互模型。" },
      { id: "ohm", title: "欧姆定律", chapter: "电学", status: "规划中", summary: "电压、电阻、电流之间的关系，后续建设电路实验台。" },
      { id: "lens", title: "凸透镜成像", chapter: "光学", status: "规划中", summary: "通过拖动物距和焦距理解成像规律。" }
    ]
  },
  math: {
    title: "数学",
    description: "用图像、步骤和题型拆解初中数学核心方法。",
    topics: [
      { id: "linear-function", title: "一次函数", chapter: "函数", status: "规划中", summary: "理解 k、b 对图像的影响，训练图像与解析式互转。" },
      { id: "similar-triangle", title: "相似三角形", chapter: "几何", status: "规划中", summary: "相似判定、比例线段和综合几何证明。" },
      { id: "equation", title: "方程与不等式", chapter: "代数", status: "规划中", summary: "建模、求解和应用题条件翻译。" }
    ]
  }
};

let activeSubject = "physics";
let activeTopic = "buoyancy";
const topicList = document.querySelector("#topic-list");
const subjectTitle = document.querySelector("#subject-title");
const topicOverview = document.querySelector("#topic-overview");
const placeholderTitle = document.querySelector("#placeholder-title");
const placeholderCopy = document.querySelector("#placeholder-copy");

function getActiveTopicMeta() {
  return learningCatalog[activeSubject].topics.find((topic) => topic.id === activeTopic);
}

function renderTopicList() {
  const subject = learningCatalog[activeSubject];
  subjectTitle.textContent = subject.title;
  topicList.innerHTML = subject.topics
    .map(
      (topic) => `
        <button type="button" class="topic-button ${topic.id === activeTopic ? "is-active" : ""}" data-topic="${topic.id}">
          <span>
            <strong>${topic.title}</strong>
            <small>${topic.chapter}</small>
          </span>
          <em>${topic.status}</em>
        </button>
      `
    )
    .join("");
}

function renderTopicOverview() {
  const subject = learningCatalog[activeSubject];
  const topic = getActiveTopicMeta();
  topicOverview.innerHTML = `
    <div>
      <p class="eyebrow">${subject.title} · ${topic.chapter}</p>
      <h2>${topic.title}</h2>
      <p>${topic.summary}</p>
    </div>
    <div class="topic-status-badge">${topic.status}</div>
  `;
}

function showTopicPanel() {
  document.querySelectorAll("[data-topic-panel]").forEach((panel) => {
    panel.classList.remove("topic-content-active");
  });

  if (activeTopic === "buoyancy") {
    document.querySelector('[data-topic-panel="buoyancy"]').classList.add("topic-content-active");
    return;
  }

  if (activeTopic === "speed") {
    document.querySelector('[data-topic-panel="speed"]').classList.add("topic-content-active");
    updateSpeedLab();
    return;
  }

  const topic = getActiveTopicMeta();
  placeholderTitle.textContent = `${topic.title} · ${topic.status}`;
  placeholderCopy.textContent = `${topic.summary} 这个知识点会复用浮力页面的学习闭环：定义讲解、交互实验、例题、分层练习和复盘。`;
  document.querySelector('[data-topic-panel="placeholder"]').classList.add("topic-content-active");
}

function selectSubject(subjectId) {
  activeSubject = subjectId;
  activeTopic = learningCatalog[subjectId].topics[0].id;
  document.querySelectorAll(".subject-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.subject === subjectId);
  });
  renderPlatform();
}

function selectTopic(topicId) {
  activeTopic = topicId;
  renderPlatform();
}

function renderPlatform() {
  renderTopicList();
  renderTopicOverview();
  showTopicPanel();
}

function updateSpeedLab() {
  const form = document.querySelector("#speed-form");
  if (!form) {
    return;
  }

  const distance = Number(form.distance.value);
  const time = Number(form.time.value);
  const speed = Math.round((distance / time + Number.EPSILON) * 100) / 100;
  form.querySelector('[data-speed-value="distance"]').textContent = distance;
  form.querySelector('[data-speed-value="time"]').textContent = time;
  document.querySelector("#speed-result").textContent = `${speed} m/s`;
}

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
}

document.querySelectorAll(".subject-tab").forEach((tab) => {
  tab.addEventListener("click", () => selectSubject(tab.dataset.subject));
});

topicList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-topic]");
  if (button) {
    selectTopic(button.dataset.topic);
  }
});

const speedForm = document.querySelector("#speed-form");
if (speedForm) {
  speedForm.addEventListener("input", updateSpeedLab);
}

simulatorForm.addEventListener("input", updateSimulator);
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

renderPlatform();
renderQuiz();
updateSimulator();
updateSpeedLab();









