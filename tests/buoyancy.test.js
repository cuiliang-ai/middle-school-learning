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
  assert.equal(result.state, "下沉");
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
  assert.equal(result.state, "会上浮至漂浮");
});

test("detects suspension when max buoyancy approximately equals gravity", () => {
  const result = calculateBuoyancy({
    massKg: 1,
    volumeCm3: 1000,
    liquidDensity: 1000,
    submergedPercent: 100
  });

  assert.equal(result.state, "悬浮");
});

test("partial submersion reports floating trend when object can float", () => {
  const result = calculateBuoyancy({
    massKg: 0.8,
    volumeCm3: 1000,
    liquidDensity: 1000,
    submergedPercent: 40
  });

  assert.equal(result.display.buoyantForceN, 4);
  assert.equal(result.state, "漂浮趋势");
});

test("evaluates quiz answers with unit-tolerant normalization", () => {
  const question = quizQuestions.find((item) => item.id === "basic-force");
  const result = evaluateAnswer(question, "20 N");

  assert.equal(result.correct, true);
  assert.equal(result.errorType, "掌握");
});

test("accepts equivalent text answers", () => {
  const question = quizQuestions.find((item) => item.id === "middle-state");
  const result = evaluateAnswer(question, "上浮后漂浮");

  assert.equal(result.correct, true);
});

test("returns error type and explanation for incorrect quiz answers", () => {
  const question = quizQuestions.find((item) => item.id === "hard-depth");
  const result = evaluateAnswer(question, "变大");

  assert.equal(result.correct, false);
  assert.equal(result.errorType, "误把深度当成浮力决定因素");
  assert.match(result.explanation, /V排 不变/);
});
