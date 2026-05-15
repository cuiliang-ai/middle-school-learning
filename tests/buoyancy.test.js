const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateBuoyancy, cm3ToM3, evaluateAnswer, quizQuestions } = require("../src/buoyancy");

test("converts cubic centimeters to cubic meters", () => {
  assert.equal(cm3ToM3(2000), 0.002);
});

test("calculates buoyancy from liquid density and displaced volume", () => {
  const result = calculateBuoyancy({
    massKg: 3,
    volumeCm3: 2000,
    liquidDensity: 1000,
    submergedPercent: 100
  });

  assert.equal(result.display.displacedVolumeM3, 0.002);
  assert.equal(result.display.buoyantForceN, 20);
  assert.equal(result.display.gravityN, 30);
  assert.equal(result.finalState, "下沉");
  assert.equal(result.currentMotion, "当前下沉");
});

test("detects objects that can float when max buoyancy exceeds gravity", () => {
  const result = calculateBuoyancy({
    massKg: 0.8,
    volumeCm3: 1000,
    liquidDensity: 1000,
    submergedPercent: 100
  });

  assert.equal(result.display.maxBuoyantForceN, 10);
  assert.equal(result.display.gravityN, 8);
  assert.equal(result.finalState, "漂浮");
  assert.equal(result.currentMotion, "当前上浮");
});

test("detects suspension when max buoyancy approximately equals gravity", () => {
  const result = calculateBuoyancy({
    massKg: 1,
    volumeCm3: 1000,
    liquidDensity: 1000,
    submergedPercent: 100
  });

  assert.equal(result.finalState, "悬浮");
});

test("partial submersion reports floating trend when object can float", () => {
  const result = calculateBuoyancy({
    massKg: 0.8,
    volumeCm3: 1000,
    liquidDensity: 1000,
    submergedPercent: 40
  });

  assert.equal(result.display.buoyantForceN, 4);
  assert.equal(result.finalState, "漂浮");
  assert.equal(result.state, "漂浮趋势");
  assert.equal(result.currentMotion, "当前下沉");
});

test("evaluates quiz answers with unit-tolerant normalization", () => {
  const question = quizQuestions.find((item) => item.id === "easy-formula");
  const result = evaluateAnswer(question, "20 N");

  assert.equal(result.correct, true);
  assert.equal(result.errorType, "掌握");
});

test("accepts equivalent text answers", () => {
  const question = quizQuestions.find((item) => item.id === "middle-float-state");
  const result = evaluateAnswer(question, "上浮后漂浮");

  assert.equal(result.correct, true);
});

test("returns error type and explanation for incorrect quiz answers", () => {
  const question = quizQuestions.find((item) => item.id === "hard-depth");
  const result = evaluateAnswer(question, "变大");

  assert.equal(result.correct, false);
  assert.equal(result.errorType, "误把深度当成浮力决定因素");
  assert.match(result.explanation, /V排 .*不变/);
});

test("large volume changes continue affecting calculations beyond the visual cap regression point", () => {
  const smaller = calculateBuoyancy({
    massKg: 1.2,
    volumeCm3: 2100,
    liquidDensity: 1000,
    submergedPercent: 75
  });
  const larger = calculateBuoyancy({
    massKg: 1.2,
    volumeCm3: 3000,
    liquidDensity: 1000,
    submergedPercent: 75
  });

  assert.ok(larger.buoyantForceN > smaller.buoyantForceN);
  assert.ok(larger.displacedVolumeM3 > smaller.displacedVolumeM3);
});

test("quiz contains 10 questions with expected difficulty distribution", () => {
  const distribution = quizQuestions.reduce((counts, question) => {
    counts[question.level] = (counts[question.level] || 0) + 1;
    return counts;
  }, {});

  assert.equal(quizQuestions.length, 10);
  assert.equal(distribution["简单"], 3);
  assert.equal(distribution["中档"], 5);
  assert.equal(distribution["难"], 2);
});

test("every quiz question has detailed explanation and error attribution", () => {
  for (const question of quizQuestions) {
    assert.ok(question.explanation.length >= 45, `${question.id} explanation is too short`);
    assert.ok(question.errorType.length > 0, `${question.id} missing error type`);
    assert.ok(question.hint.length > 0, `${question.id} missing hint`);
  }
});

test("choice questions include options and can be graded by label", () => {
  const choiceQuestions = quizQuestions.filter((question) => question.type === "choice");

  assert.ok(choiceQuestions.length >= 5);
  for (const question of choiceQuestions) {
    assert.ok(question.options.length >= 4, `${question.id} should have at least four options`);
    const result = evaluateAnswer(question, question.answers[0]);
    assert.equal(result.correct, true);
  }
});

