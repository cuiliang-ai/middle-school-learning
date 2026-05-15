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

  for (const id of ["result-displaced", "result-buoyancy", "result-gravity", "result-density", "result-state", "result-reason"]) {
    assert.match(html, new RegExp(`id=\\"${id}\\"`));
  }
});

test("loads physics model before browser app script", () => {
  const modelIndex = html.indexOf('src="src/buoyancy.js"');
  const appIndex = html.indexOf('src="src/app.js"');

  assert.ok(modelIndex > 0);
  assert.ok(appIndex > modelIndex);
});
