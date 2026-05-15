const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("page includes required buoyancy learning sections", () => {
  for (const text of ["定义与核心公式", "易错点", "浮力实验台", "典型例题", "做题思路模板", "实验探究", "分层练习"]) {
    assert.match(html, new RegExp(text));
  }
});

test("simulator exposes all required controls and result targets", () => {
  for (const name of ["massKg", "volumeCm3", "liquidDensity", "submergedPercent"]) {
    assert.match(html, new RegExp(`name=\\"${name}\\"`));
  }

  for (const id of ["result-displaced", "result-buoyancy", "result-gravity", "result-density", "result-motion", "result-state", "result-reason"]) {
    assert.match(html, new RegExp(`id=\\"${id}\\"`));
  }
});

test("loads physics model before browser app script", () => {
  const modelIndex = html.indexOf('src="src/buoyancy.js');
  const appIndex = html.indexOf('src="src/app.js');

  assert.ok(modelIndex > 0);
  assert.ok(appIndex > modelIndex);
});

test("controls display live numeric outputs", () => {
  for (const name of ["massKg", "volumeCm3", "liquidDensity", "submergedPercent"]) {
    assert.match(html, new RegExp(`data-value-for=\\"${name}\\"`));
  }
});

test("page supports rendered choice questions", () => {
  const app = fs.readFileSync(path.join(__dirname, "..", "src", "app.js"), "utf8");

  assert.match(app, /type === "choice"/);
  assert.match(app, /option-list/);
  assert.match(app, /type="radio"/);
  assert.match(app, /详细解析/);
  assert.match(app, /quizState/);
  assert.match(app, /renderReview/);
  assert.match(app, /data-action="submit"/);
  assert.match(app, /data-action="next"/);
  assert.match(app, /重新练习/);
});


test("page includes focused quiz flow styles", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "src", "styles.css"), "utf8");

  assert.match(css, /quiz-focus-card/);
  assert.match(css, /quiz-progress/);
  assert.match(css, /review-panel/);
  assert.match(css, /progress-fill/);
});


test("static assets include cache-busting versions", () => {
  assert.match(html, /src\/styles\.css\?v=/);
  assert.match(html, /src\/buoyancy\.js\?v=/);
  assert.match(html, /src\/app\.js\?v=/);
});
