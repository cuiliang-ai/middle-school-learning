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
      id: "easy-definition",
      level: "简单",
      type: "choice",
      prompt: "关于浮力，下列说法正确的是哪一项？",
      options: [
        { label: "A", text: "只有漂浮的物体才受到浮力" },
        { label: "B", text: "浸在液体中的物体受到液体对它向上的力" },
        { label: "C", text: "浮力方向总是竖直向下" },
        { label: "D", text: "浮力大小只由物体质量决定" }
      ],
      answers: ["B"],
      hint: "先回忆浮力定义：浸在液体或气体中的物体受到向上的力。",
      explanation: "正确答案是 B。浮力是液体或气体对浸在其中的物体产生的向上托力。下沉、悬浮、漂浮的物体都可能受到浮力；浮力方向通常竖直向上；浮力大小由液体密度和排开液体体积决定，不是只由质量决定。",
      errorType: "浮力定义不清"
    },
    {
      id: "easy-formula",
      level: "简单",
      type: "fill",
      prompt: "水的密度取 1000 kg/m^3，物体排开水的体积为 0.002 m^3，g 取 10 N/kg，浮力是多少 N？",
      answers: ["20", "20N", "20 N"],
      hint: "先写 F浮 = rho液 * g * V排，再代入 1000、10、0.002。",
      explanation: "根据阿基米德原理，F浮 = rho液 * g * V排。代入数据：F浮 = 1000 * 10 * 0.002 = 20 N。注意这里使用的是排开水的体积，不一定等于物体总体积。",
      errorType: "公式代入错误"
    },
    {
      id: "easy-unit",
      level: "简单",
      type: "fill",
      prompt: "某物体完全浸没在水中，排开水的体积是 500 cm^3。换算成 m^3 是多少？",
      answers: ["0.0005", "0.0005m^3", "0.0005 m^3", "5e-4", "5*10^-4"],
      hint: "1 cm^3 = 0.000001 m^3，500 cm^3 要乘以 0.000001。",
      explanation: "体积单位必须先统一。500 cm^3 = 500 * 0.000001 m^3 = 0.0005 m^3。很多浮力计算错误不是公式错，而是把 cm^3 直接代入了 kg/m^3、N/kg 组成的公式。",
      errorType: "体积单位换算错误"
    },
    {
      id: "middle-float-state",
      level: "中档",
      type: "choice",
      prompt: "一个物体重 6 N，完全浸没时受到的最大浮力是 8 N。松手后它最终会怎样？",
      options: [
        { label: "A", text: "下沉" },
        { label: "B", text: "悬浮" },
        { label: "C", text: "上浮并最终漂浮" },
        { label: "D", text: "保持原处静止" }
      ],
      answers: ["C", "上浮并最终漂浮", "漂浮", "上浮后漂浮"],
      hint: "比较最大浮力和重力。最大浮力大于重力时，物体会上浮，最终漂浮。",
      explanation: "正确答案是 C。完全浸没时最大浮力 8 N 大于重力 6 N，合力方向向上，所以物体会上浮。上浮过程中排开液体体积变小，浮力逐渐减小，直到漂浮时 F浮 = G = 6 N。",
      errorType: "浮沉条件判断错误"
    },
    {
      id: "middle-object-density",
      level: "中档",
      type: "choice",
      prompt: "甲、乙两个实心物体体积相同，都完全浸没在水中。甲的质量大于乙。它们受到的浮力大小关系是？",
      options: [
        { label: "A", text: "甲受到的浮力大" },
        { label: "B", text: "乙受到的浮力大" },
        { label: "C", text: "一样大" },
        { label: "D", text: "无法判断，因为不知道质量具体数值" }
      ],
      answers: ["C", "一样大", "相等"],
      hint: "完全浸没且体积相同，排开水的体积相同。",
      explanation: "正确答案是 C。浮力 F浮 = rho液 * g * V排。两物体都完全浸没在同种液体中，rho液 相同；体积相同，所以 V排 相同；因此浮力相同。质量大小会影响重力和浮沉趋势，但不直接决定此处的浮力。",
      errorType: "误把质量当成浮力决定因素"
    },
    {
      id: "middle-salt-water",
      level: "中档",
      type: "choice",
      prompt: "同一物体先后完全浸没在清水和盐水中，盐水密度较大。两次物体受到的浮力关系是？",
      options: [
        { label: "A", text: "清水中浮力大" },
        { label: "B", text: "盐水中浮力大" },
        { label: "C", text: "一样大" },
        { label: "D", text: "与液体密度无关" }
      ],
      answers: ["B", "盐水中浮力大"],
      hint: "完全浸没时 V排 相同，比较液体密度。",
      explanation: "正确答案是 B。完全浸没时，同一物体排开液体体积相同，g 也相同。由 F浮 = rho液 * g * V排 可知，液体密度越大，浮力越大。因此在盐水中受到的浮力更大。",
      errorType: "忽略液体密度影响"
    },
    {
      id: "middle-floating-force",
      level: "中档",
      type: "fill",
      prompt: "一木块重 12 N，静止漂浮在水面上。它受到的浮力是多少 N？",
      answers: ["12", "12N", "12 N"],
      hint: "漂浮静止时物体受力平衡，浮力等于重力。",
      explanation: "木块静止漂浮，说明它在竖直方向受力平衡。竖直向上的浮力等于竖直向下的重力，所以 F浮 = G = 12 N。此类题不需要先求 V排，漂浮状态本身已经给出 F浮 = G。",
      errorType: "没有使用漂浮平衡条件"
    },
    {
      id: "middle-spring-scale",
      level: "中档",
      type: "fill",
      prompt: "某物体在空气中用弹簧测力计测得重力为 5 N，浸没在水中时测力计示数为 3 N。物体受到的浮力是多少 N？",
      answers: ["2", "2N", "2 N"],
      hint: "弹簧测力计示数减少了多少，浮力就是多少。",
      explanation: "物体在空气中重力为 5 N，浸没后测力计示数为 3 N。此时物体受到向上的浮力，使测力计拉力减小。F浮 = G - F示 = 5 N - 3 N = 2 N。这是实验测浮力的常见考法。",
      errorType: "弹簧测力计读数关系不清"
    },
    {
      id: "hard-depth",
      level: "难",
      type: "choice",
      prompt: "物体已经完全浸没在水中，继续向更深处移动，若液体密度不变，它受到的浮力会怎样变化？",
      options: [
        { label: "A", text: "变大" },
        { label: "B", text: "变小" },
        { label: "C", text: "不变" },
        { label: "D", text: "先变大后变小" }
      ],
      answers: ["C", "不变"],
      hint: "完全浸没后，排开液体体积已经等于物体体积。继续加深不会改变 V排。",
      explanation: "正确答案是 C。F浮 = rho液 * g * V排。物体已经完全浸没，继续向深处移动时，如果液体密度不变，V排 仍等于物体体积，不再增加，所以浮力不变。深度会影响液体压强，但不直接让完全浸没物体的浮力继续增大。",
      errorType: "误把深度当成浮力决定因素"
    },
    {
      id: "hard-table-analysis",
      level: "难",
      type: "fill",
      prompt: "某实验中，物体逐渐浸入水中。弹簧测力计示数从 6 N 依次变为 5 N、4 N、3 N，完全浸没后继续下降仍为 3 N。物体完全浸没时受到的浮力是多少 N？",
      answers: ["3", "3N", "3 N"],
      hint: "完全浸没时的浮力等于空气中重力减去浸没后的测力计示数。",
      explanation: "空气中测力计示数为 6 N，可看作物体重力。完全浸没后示数稳定为 3 N，说明此后 V排 不变，浮力不变。完全浸没时 F浮 = G - F示 = 6 N - 3 N = 3 N。数据中示数先逐渐减小，是因为浸入体积增大、浮力增大；完全浸没后示数不再变，是因为排开液体体积不再变。",
      errorType: "实验数据与浮力关系分析错误"
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


