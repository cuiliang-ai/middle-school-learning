(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Buoyancy = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const G = 10;

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function cm3ToM3(value) {
    return value / 1000000;
  }

  function calculateBuoyancy(input) {
    const massKg = Number(input.massKg);
    const volumeCm3 = Number(input.volumeCm3);
    const liquidDensity = Number(input.liquidDensity);
    const submergedPercent = Number(input.submergedPercent);
    const g = Number(input.g || G);

    if ([massKg, volumeCm3, liquidDensity, submergedPercent, g].some((value) => Number.isNaN(value))) {
      throw new Error("All buoyancy inputs must be numeric.");
    }

    const objectVolumeM3 = cm3ToM3(volumeCm3);
    const submergedRatio = Math.min(Math.max(submergedPercent / 100, 0), 1);
    const displacedVolumeM3 = objectVolumeM3 * submergedRatio;
    const buoyantForceN = liquidDensity * g * displacedVolumeM3;
    const gravityN = massKg * g;
    const maxBuoyantForceN = liquidDensity * g * objectVolumeM3;
    const objectDensity = massKg / objectVolumeM3;

    const tolerance = 0.05;

    let currentMotion = "当前下沉";
    let currentReason = "当前浮力小于重力，若不外力托住，物体会继续下沉。";
    if (Math.abs(buoyantForceN - gravityN) < tolerance) {
      currentMotion = "当前平衡";
      currentReason = "当前浮力约等于重力，物体此刻受力平衡。";
    } else if (buoyantForceN > gravityN) {
      currentMotion = "当前上浮";
      currentReason = "当前浮力大于重力，物体此刻会向上运动。";
    }

    let finalState = "下沉";
    let stateReason = "最大浮力小于重力，物体不能被托住，最终下沉。";
    if (Math.abs(maxBuoyantForceN - gravityN) < tolerance) {
      finalState = "悬浮";
      stateReason = "最大浮力约等于重力，物体可以悬浮在液体中。";
    } else if (maxBuoyantForceN > gravityN) {
      finalState = "漂浮";
      stateReason = "最大浮力大于重力，物体最终会浮起来；漂浮时浮力等于重力。";
    }

    const state = submergedRatio < 1 && finalState === "漂浮" ? "漂浮趋势" : finalState;

    return {
      massKg,
      volumeCm3,
      liquidDensity,
      submergedPercent: round(submergedPercent, 0),
      objectVolumeM3,
      displacedVolumeM3,
      buoyantForceN,
      gravityN,
      maxBuoyantForceN,
      objectDensity,
      currentMotion,
      currentReason,
      finalState,
      state,
      stateReason,
      display: {
        displacedVolumeM3: round(displacedVolumeM3, 5),
        buoyantForceN: round(buoyantForceN, 2),
        gravityN: round(gravityN, 2),
        maxBuoyantForceN: round(maxBuoyantForceN, 2),
        objectDensity: round(objectDensity, 0)
      }
    };
  }

  function normalizeAnswer(value) {
    return String(value).trim().toLowerCase().replace(/\s+/g, "");
  }

  function evaluateAnswer(question, answer) {
    const normalized = normalizeAnswer(answer);
    const acceptedAnswers = question.answers.map(normalizeAnswer);
    const correct = acceptedAnswers.includes(normalized);

    return {
      correct,
      message: correct ? "回答正确。" : question.hint,
      explanation: question.explanation,
      errorType: correct ? "掌握" : question.errorType
    };
  }

  const quizQuestions = [
    {
      id: "basic-force",
      level: "简单",
      prompt: "水的密度取 1000 kg/m^3，物体排开水的体积为 0.002 m^3，g 取 10 N/kg，浮力是多少 N？",
      answers: ["20", "20N", "20 N"],
      hint: "先写 F浮 = rho液 * g * V排，再代入 1000、10、0.002。",
      explanation: "F浮 = 1000 * 10 * 0.002 = 20 N。",
      errorType: "公式代入错误"
    },
    {
      id: "middle-state",
      level: "中档",
      prompt: "一个物体重 6 N，完全浸没时受到的最大浮力是 8 N。松手后它最终会漂浮、悬浮还是下沉？",
      answers: ["漂浮", "上浮后漂浮"],
      hint: "比较最大浮力和重力。最大浮力大于重力时，物体会上浮，最终漂浮。",
      explanation: "最大浮力 8 N 大于重力 6 N，物体会上浮，最终漂浮。漂浮时 F浮 = G。",
      errorType: "浮沉条件判断错误"
    },
    {
      id: "hard-depth",
      level: "难",
      prompt: "物体已经完全浸没在水中，继续向更深处移动，若液体密度不变，它受到的浮力会变大、变小还是不变？",
      answers: ["不变"],
      hint: "完全浸没后，排开液体体积已经等于物体体积。继续加深不会改变 V排。",
      explanation: "F浮 = rho液 * g * V排。浸没后 V排 不变，液体密度不变，所以浮力不变。",
      errorType: "误把深度当成浮力决定因素"
    }
  ];

  return {
    G,
    round,
    cm3ToM3,
    calculateBuoyancy,
    evaluateAnswer,
    quizQuestions
  };
});

