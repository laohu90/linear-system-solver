export type Language = 'en' | 'es' | 'fr' | 'pt' | 'zh';
export type SupportedLang = Language;

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  navSolver: string;
  navPractice: string;
  navPresets: string;
  navKnowledge: string;
  exportHomework: string;
  metaBadge1: string;
  metaBadge2: string;
  metaPrecision: string;
  metaGraphDesc: string;
  
  // Input Panel
  inputTitle: string;
  inputSubtitle: string;
  inputHint: string;
  modeStandard: string;
  modeFreeform: string;
  eq1Label: string;
  eq2Label: string;
  currentSystem: string;
  btnRandom: string;
  btnPresets: string;
  btnSwap: string;
  btnReset: string;
  freeformPlaceholder1: string;
  freeformPlaceholder2: string;
  freeformHelp1: string;
  freeformHelp2: string;
  errorCoeffZero: string;

  // Graph
  graphTitle: string;
  graphHint: string;
  line1Legend: string;
  line2Legend: string;
  pointLegend: string;
  geoTitle: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;
  hyperplaneNotice: string;
  graph2dOnly: string;
  hyperplaneDesc: string;
  btnSwitchTo2d: string;

  // Steps View
  methodSub: string;
  methodElim: string;
  tagRecommended: string;
  viewAll: string;
  viewStepByStep: string;
  copyHomework: string;
  copied: string;
  coreIdeaTitle: string;
  stepOf: string;
  btnPrev: string;
  btnNext: string;
  drillComplete: string;
  finalSolutionTitle: string;
  pointCoord: string;
  integerSolution: string;
  fractionSolution: string;
  verificationTitle: string;
  verificationSuccess: string;

  // Quiz
  quizTitle: string;
  quizSubtitle: string;
  quizNext: string;
  quizLoadToSolver: string;
  quizStep1: string;
  quizElimX: string;
  quizElimY: string;
  quizStep2: string;
  quizStep3: string;
  quizSubmit: string;
  quizHint: string;
  quizHideHint: string;
  quizHintTitle: string;
  quizEmptyWarning: string;
  quizSuccessMsg: string;
  quizPartialMsg: string;
  quizErrorMsg: string;

  // Knowledge
  knowledgeTitle: string;
  knowledgeSubtitle: string;
  k1Title: string;
  k1DescSub: string;
  k1DescElim: string;
  k1Chant: string;
  k2Title: string;
  k2Desc: string;
  k2Diagram: string;
  k3Title: string;
  k3Trap1: string;
  k3Trap2: string;
  k3Trap3: string;
  k3Trap4: string;
  k4Title: string;
  k4Desc: string;
  k4Item1: string;
  k4Item2: string;
  k4Item3: string;

  // Homework Export
  exportTitle: string;
  exportDocHeader: string;
  exportDocSub: string;
  exportPrintBtn: string;
  exportCopyBtn: string;
  exportCopiedBtn: string;

  // Presets Modal
  presetsTitle: string;
  catAll: string;
  catBasic: string;
  catExam: string;
  catTransform: string;
  catSpecial: string;
  catApplied: string;
  btnLoadProblem: string;
  setupFormula: string;

  // Additional navigation & footer strings
  mobileNavSolver: string;
  mobileNavPractice: string;
  mobileNavPresets: string;
  mobileNavKnowledge: string;
  practiceHeading: string;
  practiceSub: string;
  practiceTransferred: string;
  defaultProblemTitle: string;
  footerDesc: string;
  footerApplied: string;
  footerKnowledge: string;
  footerExport: string;
  langName: string;
  switchLangPrompt: string;

  // n×n & Matrix Analysis
  btnAddEquation: string;
  btnRemoveEquation: string;
  dimSelector: string;
  methodGaussian: string;
  matrixAnalysisTitle: string;
  matrixRankTitle: string;
  detTitle: string;
  cramerTitle: string;
  roucheCapelliTitle: string;
  actionEliminate: string;
  actionSolve: string;
  actionSubstitute: string;
  actionPivot: string;
  rankA: string;
  rankAug: string;
  variablesCount: string;
  augmentedMatrix: string;

  // Columns & Errors i18n
  colVarHeader: string;
  colConstHeader: string;
  variableOrderNotice: string;
  errorCoeffsAllZero: string;
  errorInvalidNumberInput: string;
  errorParsingGeneric: string;

  // Problem Bank Page (/problem-bank)
  navProblemBank: string;
  problemBankHeading: string;
  problemBankSub: string;
  searchProblems: string;
  loadProblem: string;
  loadedToSolver: string;
  filterAll: string;

  // Privacy Policy Page (/privacy)
  navPrivacy: string;
  privacyHeading: string;
  privacySub: string;
  privacyP1Title: string;
  privacyP1Text: string;
  privacyP2Title: string;
  privacyP2Text: string;
  privacyP3Title: string;
  privacyP3Text: string;
  privacyP4Title: string;
  privacyP4Text: string;
}

const enData = {

  en: {
    appTitle: 'Linear System Solver',
    appSubtitle: 'System of 2 Linear Equations · Step-by-Step Substitution & Elimination',
    navSolver: 'Solver & Steps',
    navPractice: 'Interactive Practice',
    navPresets: 'Curated Problem Bank',
    navKnowledge: 'Key Concepts & Traps',
    exportHomework: 'Export Homework',
    metaBadge1: 'Standard 2x2 Linear System',
    metaBadge2: 'Substitution & Elimination Dual Paths',
    metaPrecision: 'Precision: Exact Fractions / Integers',
    metaGraphDesc: 'Graph: Real-time 2D Coordinate Intersection',

    inputTitle: 'Input System of Equations',
    inputSubtitle: '(Detailed step-by-step algebraic steps)',
    inputHint: 'Enter integers, decimals, or fractions (e.g. 2/3, -5/4). Exact rational math applied.',
    modeStandard: 'Coefficient Form',
    modeFreeform: 'Free Expression',
    eq1Label: 'Equation ①',
    eq2Label: 'Equation ②',
    currentSystem: 'Current System:',
    btnRandom: 'Random Problem',
    btnPresets: 'Problem Sets & Word Problems',
    btnSwap: 'Swap Equations',
    btnReset: 'Reset Default',
    freeformPlaceholder1: 'e.g. 2x + 3y = 7',
    freeformPlaceholder2: 'e.g. 3x - 2y = 4',
    freeformHelp1: 'Equation ① expression (supports brackets & fractions, e.g. 2(x-1) = 3y + 4):',
    freeformHelp2: 'Equation ② expression:',
    errorCoeffZero: 'Coefficients of x and y cannot both be zero.',

    graphTitle: 'Cartesian Coordinate System · Lines & Intersection',
    graphHint: 'Drag to pan · Scroll wheel to zoom',
    line1Legend: 'Line L₁ (Eq ①)',
    line2Legend: 'Line L₂ (Eq ②)',
    pointLegend: 'Intersection P (Solution)',
    geoTitle: 'Geometric Analysis',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetView: 'Center View',
    hyperplaneNotice: 'For n > 2, systems represent hyperplane intersections; use matrix rank analysis instead.',
    graph2dOnly: '2D Cartesian Coordinate Graph (2×2 Only)',
    hyperplaneDesc: 'When n > 2, equations geometrically represent hyperplanes in higher-dimensional space. Since multi-hyperplane intersections cannot be plotted in a 2D Cartesian plane, linear algebra utilizes matrix rank rank(A) and augmented rank rank([A|b]) for exact classification.',
    btnSwitchTo2d: 'Switch to 2×2 for 2D Graph',

    methodSub: 'Substitution Method',
    methodElim: 'Elimination Method',
    tagRecommended: 'Recommended',
    viewAll: 'Show All Steps',
    viewStepByStep: 'Step-by-Step',
    copyHomework: 'Copy Format',
    copied: 'Copied to Clipboard!',
    coreIdeaTitle: 'Core Mathematical Principle [Elimination]:',
    stepOf: 'Step',
    btnPrev: 'Previous',
    btnNext: 'Next Step',
    drillComplete: 'Walkthrough Complete',
    finalSolutionTitle: 'Standard Final Solution Set:',
    pointCoord: 'Intersection Point',
    integerSolution: '✓ Clean Integer Solution',
    fractionSolution: '✓ Exact Irreducible Fraction',
    verificationTitle: '【Verification】Substitute back into original equations:',
    verificationSuccess: 'Both left and right sides are equal. The solution is fully verified!',

    quizTitle: 'Elimination Mindset Challenge',
    quizSubtitle: 'Make active decisions on variable & method selection to master linear systems',
    quizNext: 'Next Problem',
    quizLoadToSolver: 'Open in Solver',
    quizStep1: '1. Looking at the coefficients, which variable do you prefer to eliminate first?',
    quizElimX: 'Eliminate x',
    quizElimY: 'Eliminate y',
    quizStep2: '2. Which method do you think is more efficient and less error-prone?',
    quizStep3: '3. Calculate on scratch paper and enter your solution values (integers or fractions like 7/3):',
    quizSubmit: 'Check Answer',
    quizHint: 'Hint',
    quizHideHint: 'Hide Hint',
    quizHintTitle: 'Teacher Tip:',
    quizEmptyWarning: 'Please enter values for both x and y before submitting!',
    quizSuccessMsg: 'Awesome! Clear elimination strategy and completely correct solution! 🎉',
    quizPartialMsg: 'One of the variables is correct. Check your back-substitution arithmetic!',
    quizErrorMsg: 'Values do not match. Check signs and transposition, or view the hint below.',

    knowledgeTitle: 'Mastering Systems of Linear Equations: Essential Guide',
    knowledgeSubtitle: 'Core algebra curriculum concepts, method selection criteria, and exam pitfalls',
    k1Title: 'Substitution vs. Elimination Selection Strategy',
    k1DescSub: 'Use Substitution when at least one variable has a coefficient of ±1 (e.g. x - 2y = 3), enabling clean transposition without messy fractions.',
    k1DescElim: 'Use Elimination when coefficients of a variable are equal, opposite, or have small LCMs.',
    k1Chant: 'Tip: "Coefficient ±1 choose Substitution; matching coefficients Subtract; opposite coefficients Add; otherwise align with LCM!"',
    k2Title: 'Core Mathematical Philosophy: Reduction to Simplicity',
    k2Desc: 'Elimination reduces an unfamiliar 2-variable problem to a familiar 1-variable equation:',
    k2Diagram: 'System of 2 Equations ──[Elimination]──▶ 1-Variable Equation ──[Solve]──▶ Back-Substitute',
    k3Title: 'Four Common Algebra Pitfalls to Avoid',
    k3Trap1: 'Distributive law omission: Forgetting to multiply constant terms on the right side.',
    k3Trap2: 'Sign error during subtraction: Subtracting negative terms must turn positive: -( -b ) = +b.',
    k3Trap3: 'Clearing denominators error: Forgetting to multiply non-fractional terms by the LCD.',
    k3Trap4: 'Incomplete answer format: Not combining into standard system brace notation { x = ..., y = ... }.',
    k4Title: 'Connection with Linear Functions & Geometry',
    k4Desc: 'Every linear equation ax + by = c represents a straight line in the coordinate plane:',
    k4Item1: '· Lines intersect at one point ⟺ Unique solution (x₀, y₀)',
    k4Item2: '· Parallel lines (no intersection) ⟺ No solution',
    k4Item3: '· Coincident lines (same line) ⟺ Infinitely many solutions',

    exportTitle: 'Export Homework Formatted Solution',
    exportDocHeader: 'Algebra Homework Solution Sheet',
    exportDocSub: 'System of Linear Equations in Two Variables',
    exportPrintBtn: 'Print / Save as PDF',
    exportCopyBtn: 'Copy Homework Format',
    exportCopiedBtn: 'Copied!',

    presetsTitle: 'Curated Linear System Problem Sets',
    catAll: 'All',
    catBasic: 'Foundations',
    catExam: 'Exam Standards',
    catTransform: 'Brackets & Fractions',
    catSpecial: 'Special Cases',
    catApplied: 'Word Problems',
    btnLoadProblem: 'Load to Solve',
    setupFormula: 'Variables & Setup:',

    mobileNavSolver: 'Solver',
    mobileNavPractice: 'Practice',
    mobileNavPresets: 'Problem Bank',
    mobileNavKnowledge: 'Guide',
    practiceHeading: 'Linear System Elimination Workshop',
    practiceSub: 'Master isolating variables and finding common multiples to choose the optimal path',
    practiceTransferred: 'Problem loaded from practice workshop',
    defaultProblemTitle: 'Classic Standard Linear System',
    footerDesc: 'Linear System Solver · Step-by-Step Educational Algebra Calculator',
    footerApplied: 'Word Problems',
    footerKnowledge: 'Curriculum Guide',
    footerExport: 'Export Homework',
    langName: 'English',
    switchLangPrompt: 'Switch Language',

    // n×n & Matrix Analysis
    btnAddEquation: 'Add Equation',
    btnRemoveEquation: 'Remove Equation',
    dimSelector: 'System Dimension',
    methodGaussian: 'Gaussian Elimination',
    matrixAnalysisTitle: 'Matrix & Determinant Analysis',
    matrixRankTitle: 'Matrix Rank & Rouché-Capelli Theorem',
    detTitle: 'Determinant D = det(A)',
    cramerTitle: "Cramer's Rule Determinants",
    roucheCapelliTitle: 'Rouché–Capelli Theorem Criterion',
    actionEliminate: 'Eliminate variable: ',
    actionSolve: 'Solve for variable: ',
    actionSubstitute: 'Substitute variable: ',
    actionPivot: 'Row operation: ',
    rankA: 'Rank of Coefficient Matrix rank(A)',
    rankAug: 'Rank of Augmented Matrix rank([A|b])',
    variablesCount: 'Number of Variables (n)',
    augmentedMatrix: 'Augmented Matrix [A | b]',

    // Columns & Errors i18n
    colVarHeader: 'Column',
    colConstHeader: 'Constant c',
    variableOrderNotice: 'Variable column order: ',
    errorCoeffsAllZero: 'All coefficients in Equation {n} cannot be zero.',
    errorInvalidNumberInput: 'Invalid number format: please enter integers, decimals, or fractions like 2/3',
    errorParsingGeneric: 'Equation parsing failed: please check equals sign and variable symbols',

    // Problem Bank Page (/problem-bank)
    navProblemBank: 'Problem Bank',
    problemBankHeading: 'Linear Systems Problem Repository',
    problemBankSub: 'Curated algebra problems, brackets & fraction simplifications, and classic word applications',
    searchProblems: 'Search problems by title, keywords or equations...',
    loadProblem: 'Load to Solver',
    loadedToSolver: 'Successfully loaded to Solver!',
    filterAll: 'All Categories',

    // Privacy Policy Page (/privacy)
    navPrivacy: 'Privacy Policy',
    privacyHeading: 'Privacy & Data Protection Policy',
    privacySub: '100% In-browser local computation. Zero tracking, zero external transmission.',
    privacyP1Title: '1. 100% In-Browser Local Processing',
    privacyP1Text: 'All mathematical operations, Gaussian elimination row reductions, exact rational fraction calculations, and 2D coordinate graphs are performed strictly within your device’s web browser. No equations, numbers, or problem texts are uploaded to any cloud server.',
    privacyP2Title: '2. No Cross-Site Tracking or Advertising Cookies',
    privacyP2Text: 'We do not employ tracking cookies, advertising identifiers, or analytics trackers that capture personal identifiable information (PII). This tool is built to strictly respect educational data privacy standards including COPPA and FERPA.',
    privacyP3Title: '3. Browser Local Storage',
    privacyP3Text: 'The only data saved on your device is your preferred interface language (e.g. English or Chinese), stored safely in your browser’s localStorage. You can clear this anytime through your browser settings.',
    privacyP4Title: '4. Non-Commercial Academic & Educational Mission',
    privacyP4Text: 'Linear System Solver is an open educational tool created to assist secondary and university mathematics students, teachers, and self-learners in understanding linear algebra and checking homework solutions.',
  },
  zh: {
    appTitle: '二元一次方程组求解器',
    appSubtitle: '初一数学重点：代入消元法与加减消元法详细步骤计算器',
    navSolver: '计算与分步步骤',
    navPractice: '消元互动演练',
    navPresets: '中考经典题库',
    navKnowledge: '核心考点速查',
    exportHomework: '导出作业格式',
    metaBadge1: '初中七年级下册核心内容',
    metaBadge2: '代入消元法与加减消元法双轨对照',
    metaPrecision: '精确度：既约分数 / 整数',
    metaGraphDesc: '图像：实时解析几何平面交点',

    inputTitle: '输入二元一次方程组',
    inputSubtitle: '（支持初一代入法与加减法解析）',
    inputHint: '可填入整数、小数或分数（如 2/3、-5/4），系统将进行精确代数化简。',
    modeStandard: '系数填空',
    modeFreeform: '自由整式输入',
    eq1Label: '方程 ①',
    eq2Label: '方程 ②',
    currentSystem: '当前方程组：',
    btnRandom: '随机练习题',
    btnPresets: '题库与应用题',
    btnSwap: '互换两式',
    btnReset: '恢复默认',
    freeformPlaceholder1: '例如: 2x + 3y = 7',
    freeformPlaceholder2: '例如: 3x - 2y = 4',
    freeformHelp1: '方程 ① 表达式（支持带括号、分数，如 2(x-1) = 3y + 4 或 x/2 + y/3 = 5）：',
    freeformHelp2: '方程 ② 表达式：',
    errorCoeffZero: '方程中 x 和 y 的系数不能同时为 0',

    graphTitle: '平面直角坐标系 · 函数图象与交点',
    graphHint: '支持拖拽平移与滚轮缩放',
    line1Legend: '直线 L₁ (方程①)',
    line2Legend: '直线 L₂ (方程②)',
    pointLegend: '交点 P (方程组的解)',
    geoTitle: '几何意义解读',
    zoomIn: '放大网格',
    zoomOut: '缩小网格',
    resetView: '居中焦点',
    hyperplaneNotice: 'n>2 时以超平面交集表示，改用矩阵秩判定',
    graph2dOnly: '平面直角坐标系（仅 2 维空间支持函数画图）',
    hyperplaneDesc: '方程未知数个数 n > 2 时，几何意义扩展为三维空间平面或更高维度的超平面。空间中多个超平面的相交情况无法投影至单一二维直角坐标系绘制，在线性代数中改用矩阵的秩 rank(A) 与增广矩阵秩 rank([A|b]) 以及克莱姆法则进行代数判定。',
    btnSwitchTo2d: '切换回二元 (2×2) 查看二维图像',

    methodSub: '代入消元法',
    methodElim: '加减消元法',
    tagRecommended: '推荐',
    viewAll: '全文展开',
    viewStepByStep: '逐步演示',
    copyHomework: '复制规范作业',
    copied: '已复制规范格式',
    coreIdeaTitle: '初一核心思想【消元】：',
    stepOf: '第',
    btnPrev: '上一步',
    btnNext: '下一步',
    drillComplete: '演练完成',
    finalSolutionTitle: '最终规范解集（中考标准规范书写）：',
    pointCoord: '对应点坐标',
    integerSolution: '✓ 整数解（初一常规题）',
    fractionSolution: '✓ 分数既约精确解',
    verificationTitle: '【验算】将求得的解代入原方程检验：',
    verificationSuccess: '左右两边均相等，所求结果真实无误！',

    quizTitle: '消元思维挑战与自测',
    quizSubtitle: '根据初一教学大纲设计：自主决策消元路径，巩固答题套路',
    quizNext: '换一题',
    quizLoadToSolver: '载入计算器解析',
    quizStep1: '1. 观察两方程系数，你打算优先消去哪一个未知数？',
    quizElimX: '消去 x',
    quizElimY: '消去 y',
    quizStep2: '2. 你认为使用哪种消元方法更省时不易错？',
    quizStep3: '3. 请在草稿纸上完成化简演算，并填入你求得的最终解（支持整数或分数如 7/3）：',
    quizSubmit: '提交核对',
    quizHint: '解题提示',
    quizHideHint: '隐藏提示',
    quizHintTitle: '老师点拨：',
    quizEmptyWarning: '请先在输入框中填入你计算得出的 x 和 y 的具体数值（如 3 或 7/3）！',
    quizSuccessMsg: '太棒了！消元思路清晰，最终解完全正确！🎉',
    quizPartialMsg: '其中一个未知数已算对，请仔细核对另一个代入计算过程！',
    quizErrorMsg: '解与标准答案不一致，请检查符号和移项计算，可点击下方“解题思路提示”。',

    knowledgeTitle: '初一数学《二元一次方程组》满分考点全景梳理',
    knowledgeSubtitle: '依据人教版、北师大版、苏教版七年级教材精炼整理',
    k1Title: '代入消元法 vs 加减消元法 选法秘籍',
    k1DescSub: '代入法适用特征：方程组中存在某一未知数的系数为 1 或 -1（如 x - 2y = 3），此时移项不会产生分数，代入最顺畅。',
    k1DescElim: '加减法适用特征：某一未知数的系数相同或互为相反数，或两系数较小且容易求出最小公倍数（LCM）。',
    k1Chant: '口诀：“系数有 1 选代入，系数相同直接减，系数相反直接加；都不相同求公倍，异号相加更稳当！”',
    k2Title: '核心数学思想：转化与化归',
    k2Desc: '“二元”是未知的难点，“一元”是已学掌握的熟知领域。通过代入或加减将两个未知数消为一个未知数：',
    k2Diagram: '二元一次方程组 ──【消元】──▶ 一元一次方程 ──【求解】──▶ 回代得全解',
    k3Title: '初一易错“四大陷阱”防范指南',
    k3Trap1: '两边乘数漏乘常数项：例如方程两边乘以 2 时，右边的常数项忘记乘 2。',
    k3Trap2: '减法消元括号未变号：计算 ③ - ④ 时，负项在括号内作差应变为正号。',
    k3Trap3: '去分母时整式项漏乘：含分母方程通分时，没有分母的单项忘记乘以公分母。',
    k3Trap4: '未规范写出答语：中考规范要求最终用大括号联立写出 x 和 y 的值。',
    k4Title: '二元一次方程组与一次函数的内在联系',
    k4Desc: '每个二元一次方程 ax + by = c 都可以改写为一次函数 y = kx + b 的形式，其所有解对应坐标平面上的一条直线：',
    k4Item1: '· 两直线相交于一点 ⟺ 方程组有唯一解 (x₀, y₀)',
    k4Item2: '· 两直线平行无交点 ⟺ 方程组无解',
    k4Item3: '· 两直线完全重合 ⟺ 方程组有无穷多组解',

    exportTitle: '作业标准作答格式导出',
    exportDocHeader: '初中数学课后作业解答规范',
    exportDocSub: '二元一次方程组求解 · 规范板书',
    exportPrintBtn: '打印 / 保存为 PDF',
    exportCopyBtn: '复制规范作业格式',
    exportCopiedBtn: '已复制文本',

    presetsTitle: '初中经典二元一次方程组精选题库',
    catAll: '全部',
    catBasic: '基础练习',
    catExam: '中考常考',
    catTransform: '变式去括号与去分母',
    catSpecial: '特殊解判定',
    catApplied: '经典实际应用题',
    btnLoadProblem: '载入求解',
    setupFormula: '设元与列式：',

    mobileNavSolver: '方程求解',
    mobileNavPractice: '消元演练',
    mobileNavPresets: '经典题库',
    mobileNavKnowledge: '考点总结',
    practiceHeading: '初一二元一次方程组消元演练场',
    practiceSub: '攻克“代入法变形”与“加减法找最小公倍数”两大难点，自主探索最优解题路径',
    practiceTransferred: '演练题目转入求解器',
    defaultProblemTitle: '典型初一整系数方程组',
    footerDesc: '二元一次方程组教学求解器 · 初中数学消元规范教学与自测工具',
    footerApplied: '经典应用题专题',
    footerKnowledge: '考点速查',
    footerExport: '作业导出',
    langName: '中文',
    switchLangPrompt: '切换语言',

    // n×n & Matrix Analysis
    btnAddEquation: '添加方程',
    btnRemoveEquation: '删除方程',
    dimSelector: '方程组阶数',
    methodGaussian: '高斯消元法（矩阵行变换）',
    matrixAnalysisTitle: '矩阵与行列式深度分析',
    matrixRankTitle: '矩阵的秩与解的存在唯一性定理',
    detTitle: '系数行列式 D = det(A)',
    cramerTitle: '克莱姆法则（各未知数行列式）',
    roucheCapelliTitle: '朗歇-卡佩利定理判定法则',
    actionEliminate: '消去未知数：',
    actionSolve: '求解未知数：',
    actionSubstitute: '选式变形代入：',
    actionPivot: '初等行变换操作：',
    rankA: '系数矩阵的秩 rank(A)',
    rankAug: '增广矩阵的秩 rank([A|b])',
    variablesCount: '未知数个数 (n)',
    augmentedMatrix: '增广矩阵 [A | b]',

    // Columns & Errors i18n
    colVarHeader: '未知数列',
    colConstHeader: '常数项 c',
    variableOrderNotice: '未知数列对齐顺序：',
    errorCoeffsAllZero: '方程 {n} 的所有未知数系数不能同时为 0。',
    errorInvalidNumberInput: '数字格式无效：请输入整数、小数或如 2/3 的分数',
    errorParsingGeneric: '方程整式解析失败：请检查等号及未知数变量符号',

    // Problem Bank Page (/problem-bank)
    navProblemBank: '经典题库',
    problemBankHeading: '一次方程组与多元方程题库精选',
    problemBankSub: '涵盖初中中考真题、典型易错去括号去分母变式题与现实建模实际应用题',
    searchProblems: '搜索题目名称、关键词或方程...',
    loadProblem: '载入到求解器',
    loadedToSolver: '已成功载入求解器！',
    filterAll: '全部类别',

    // Privacy Policy Page (/privacy)
    navPrivacy: '隐私政策',
    privacyHeading: '隐私与数据安全说明',
    privacySub: '100% 浏览器本地离线高精度计算，严格保护师生教育隐私',
    privacyP1Title: '1. 纯本地前端运算（零服务器留存）',
    privacyP1Text: '本求解器所有方程解析、高斯消元初等行变换、有理数分数精确运算与几何图象生成均在您的终端设备（浏览器）本地实时完成，不向任何远程服务器或第三方上传您输入的方程数据。',
    privacyP2Title: '2. 无第三方追踪与广告 Cookie',
    privacyP2Text: '我们不使用任何跨站跟踪 Cookie，不收集学生的个人身份信息（PII），完全符合青少年与学校教育隐私保护规范（COPPA / FERPA）。',
    privacyP3Title: '3. 本地存储配置说明',
    privacyP3Text: '仅在您的浏览器 localStorage 中保存语言偏好设置（如中英文切换），您可随时通过清理浏览器缓存彻底清除。',
    privacyP4Title: '4. 学术教育公益宗旨',
    privacyP4Text: '二元及多元一次方程组求解器专为初高中数学教学、大学线性代数启蒙及数学作业辅助自查设计，倡导清晰、严谨、规范的数学书写习惯。',
  },
};

export const translations: Record<Language, Translations> = {
  en: (enData as any).en as Translations,
  es: ((enData as any).es || (enData as any).en) as Translations,
  fr: ((enData as any).fr || (enData as any).en) as Translations,
  pt: ((enData as any).pt || (enData as any).en) as Translations,
  zh: (enData as any).zh as Translations,
};

export interface BrowserDetectionResult {
  detected: SupportedLang;
  rawLocale: string;
  source: 'browser' | 'default';
}

export function getBrowserLanguageInfo(): BrowserDetectionResult {
  if (typeof window === 'undefined') {
    return { detected: 'en', rawLocale: 'en', source: 'default' };
  }
  const rawList: string[] = [];
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    rawList.push(...navigator.languages);
  }
  if (navigator.language) {
    rawList.push(navigator.language);
  }
  const primaryRaw = rawList[0] || 'en';
  for (const raw of rawList) {
    const l = raw.toLowerCase().trim();
    if (l.startsWith('zh')) return { detected: 'zh', rawLocale: primaryRaw, source: 'browser' };
    if (l.startsWith('es')) return { detected: 'es', rawLocale: primaryRaw, source: 'browser' };
    if (l.startsWith('fr')) return { detected: 'fr', rawLocale: primaryRaw, source: 'browser' };
    if (l.startsWith('pt')) return { detected: 'pt', rawLocale: primaryRaw, source: 'browser' };
    if (l.startsWith('en')) return { detected: 'en', rawLocale: primaryRaw, source: 'browser' };
  }
  return { detected: 'en', rawLocale: primaryRaw, source: 'default' };
}

export function resolveInitialLanguage(): {
  lang: SupportedLang;
  isAuto: boolean;
  detectedLang: SupportedLang;
  rawLocale: string;
} {
  const browserInfo = getBrowserLanguageInfo();
  if (typeof window === 'undefined') {
    return { lang: 'en', isAuto: true, detectedLang: 'en', rawLocale: 'en' };
  }
  try {
    localStorage.removeItem('linear_system_lang');
    localStorage.removeItem('linear_system_pref_lang');
    localStorage.removeItem('linear_system_manual_lang');
  } catch {}

  try {
    const params = new URLSearchParams(window.location.search);
    const pLang = params.get('lang') as SupportedLang;
    if (pLang && ['en', 'es', 'fr', 'pt', 'zh'].includes(pLang)) {
      return { lang: pLang, isAuto: false, detectedLang: browserInfo.detected, rawLocale: browserInfo.rawLocale };
    }
  } catch {}

  try {
    const manual = localStorage.getItem('linear_system_user_chosen_lang_v3') as SupportedLang;
    if (manual && ['en', 'es', 'fr', 'pt', 'zh'].includes(manual)) {
      return { lang: manual, isAuto: false, detectedLang: browserInfo.detected, rawLocale: browserInfo.rawLocale };
    }
  } catch {}

  // Strict default is English ('en') for Google SEO & global accessibility
  return { lang: 'en', isAuto: true, detectedLang: browserInfo.detected, rawLocale: browserInfo.rawLocale };
}
