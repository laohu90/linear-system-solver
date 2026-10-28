import { Fraction } from './fraction';

export interface EquationStandard {
  a: Fraction;
  b: Fraction;
  c: Fraction;
  rawStr?: string;
}

export interface EquationGeneral {
  coeffs: Fraction[];
  c: Fraction;
  rawStr?: string;
}

export type SolutionType = 'unique' | 'none' | 'infinite';

export interface StepExplanation {
  title: string;
  mathTeX?: string;
  desc: string;
  highlightVar?: string;
  highlightAction?: 'eliminate' | 'solve' | 'pivot' | 'substitute';
  annotation?: string;
}

export interface MethodSolution {
  name: string;
  methodKey: 'substitution' | 'elimination' | 'gaussian';
  coreIdea: string;
  recommended: boolean;
  steps: StepExplanation[];
  solutionTeX: string;
}

export interface CramerDeterminant {
  varName: string;
  symbol: string; // e.g. "D_x", "D_y", "D_z"
  value: Fraction;
  matrixTeX: string;
  formulaTeX: string;
}

export interface MatrixAnalysis {
  dim: number;
  varNames: string[];
  detA: Fraction;
  detTeX: string;
  cramerDets?: CramerDeterminant[];
  rankA: number;
  rankAug: number;
  roucheCapelliResult: 'unique' | 'none' | 'infinite';
  roucheCapelliExplanation: string;
  matrixATeX: string;
  matrixAugTeX: string;
}

export interface SystemAnalysis {
  dim: number;
  varNames: string[];
  type: SolutionType;
  determinant: Fraction;
  typeDescription: string;
  geometricInterpretation: string;
  matrixAnalysis: MatrixAnalysis;
  solution?: {
    vars: { name: string; value: Fraction; tex: string }[];
    // For 2x2 backward compatibility
    x: Fraction;
    y: Fraction;
    xTeX: string;
    yTeX: string;
  };
  substitutionMethod?: MethodSolution;
  eliminationMethod?: MethodSolution;
  gaussianMethod?: MethodSolution;
  verification?: {
    eqChecks: { label: string; checkTeX: string; isCorrect: boolean }[];
    // For 2x2 backward compatibility
    eq1Check: string;
    eq2Check: string;
    isCorrect: boolean;
  };
  // For 2x2 geometric representation
  line1?: {
    slope?: number;
    intercept?: number;
    isVertical: boolean;
    xIntercept?: number;
    texForm: string;
    slopeInterceptTeX: string;
  };
  line2?: {
    slope?: number;
    intercept?: number;
    isVertical: boolean;
    xIntercept?: number;
    texForm: string;
    slopeInterceptTeX: string;
  };
}

/**
 * Get variable names for dimension n
 */
export function getDefaultVarNames(n: number): string[] {
  if (n === 2) return ['x', 'y'];
  if (n === 3) return ['x', 'y', 'z'];
  if (n === 4) return ['x', 'y', 'z', 'w'];
  return Array.from({ length: n }, (_, i) => `x_{${i + 1}}`);
}

/**
 * Clean formula combination helper to prevent glitched strings
 */
export function formatLinearCombinationTeX(
  c1: Fraction,
  c2: Fraction,
  op: '+' | '-',
  varName: string
): string {
  const c1Str = c1.toTeX();
  const c2Str = c2.isNegative() ? `(${c2.toTeX()})` : c2.toTeX();
  return `\\left(${c1Str} ${op} ${c2Str}\\right)${varName}`;
}

export function formatConstCombinationTeX(c1: Fraction, c2: Fraction, op: '+' | '-'): string {
  const c1Str = c1.toTeX();
  const c2Str = c2.isNegative() ? `(${c2.toTeX()})` : c2.toTeX();
  return `${c1Str} ${op} ${c2Str}`;
}

/**
 * Format a general linear equation into clean LaTeX
 */
export function formatGeneralEquationTeX(coeffs: Fraction[], c: Fraction, varNames: string[]): string {
  let left = '';
  for (let i = 0; i < coeffs.length; i++) {
    const coeff = coeffs[i];
    const vName = varNames[i] || `x_{${i + 1}}`;
    if (coeff.isZero()) continue;

    if (left === '') {
      if (coeff.isOne()) left += `${vName}`;
      else if (coeff.isMinusOne()) left += `-${vName}`;
      else left += `${coeff.toTeX()}${vName}`;
    } else {
      if (coeff.isOne()) left += ` + ${vName}`;
      else if (coeff.isMinusOne()) left += ` - ${vName}`;
      else if (coeff.isPositive()) left += ` + ${coeff.toTeX()}${vName}`;
      else left += ` - ${coeff.abs().toTeX()}${vName}`;
    }
  }

  if (left === '') left = '0';
  return `${left} = ${c.toTeX()}`;
}

/**
 * Format a single 2-var equation ax + by = c into clean LaTeX
 */
export function formatEquationTeX(a: Fraction, b: Fraction, c: Fraction): string {
  return formatGeneralEquationTeX([a, b], c, ['x', 'y']);
}

/**
 * Format system of equations in curly brace LaTeX
 */
export function formatSystemTeX(eq1: EquationStandard, eq2: EquationStandard): string {
  const line1 = formatEquationTeX(eq1.a, eq1.b, eq1.c);
  const line2 = formatEquationTeX(eq2.a, eq2.b, eq2.c);
  return `\\begin{cases} ${line1} & \\text{①} \\\\ ${line2} & \\text{②} \\end{cases}`;
}

export function formatGeneralSystemTeX(equations: EquationGeneral[], varNames: string[]): string {
  const lines = equations.map((eq, idx) => {
    const circleNum = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][idx] || `(${idx + 1})`;
    return `${formatGeneralEquationTeX(eq.coeffs, eq.c, varNames)} & \\text{${circleNum}}`;
  });
  return `\\begin{cases} ${lines.join(' \\\\ ')} \\end{cases}`;
}

/**
 * Parses free-form mathematical string to coefficients and constant
 * Supports inputs like:
 * "2x + 3y = 7"
 * "3x - 5y = -1"
 * "2(x - 1) = 3y + 4"
 * "x/2 + y/3 = 5"
 * "x = 2y - 3"
 */
export function parseLinearEquation(
  input: string,
  allowedVars: string[] = ['x', 'y'],
  lang: string = 'en'
): { a: Fraction; b: Fraction; c: Fraction; coeffs: Fraction[] } {
  const isZh = lang === 'zh';
  const cleaned = input.replace(/\s+/g, '').replace(/（/g, '(').replace(/）/g, ')');
  if (!cleaned.includes('=')) {
    throw new Error(isZh ? '方程必须包含等号 "="' : 'Equation must contain an equals sign "="');
  }

  const [leftSide, rightSide] = cleaned.split('=');

  // Check for foreign variables outside allowedVars
  // Find all alphabetic letters
  const foundVars = new Set<string>();
  const letterMatches = cleaned.match(/[a-zA-Z]/g) || [];
  for (const letter of letterMatches) {
    foundVars.add(letter);
  }

  const disallowed = Array.from(foundVars).filter((v) => !allowedVars.includes(v));
  if (disallowed.length > 0) {
    if (allowedVars.length === 2) {
      throw new Error(
        isZh
          ? `检测到未知数 "${disallowed.join(', ')}"。当前二元方程组仅支持 2 个未知数 (${allowedVars.join(
              ', '
            )})。如需解多元方程组，请先点击"添加方程"扩充方程维度。`
          : `Detected variable "${disallowed.join(', ')}". Current system only supports 2 variables (${allowedVars.join(
              ', '
            )}). Click "Add Equation" to solve higher dimension systems.`
      );
    } else {
      throw new Error(
        isZh
          ? `检测到未知数 "${disallowed.join(', ')}"。当前方程组仅支持未知数 (${allowedVars.join(', ')})。`
          : `Detected variable "${disallowed.join(', ')}". Allowed variables are (${allowedVars.join(', ')}).`
      );
    }
  }

  // Tokenize & expand expressions into polynomial in allowedVars + constant
  const leftPoly = parseExpressionGeneral(leftSide, allowedVars);
  const rightPoly = parseExpressionGeneral(rightSide, allowedVars);

  const coeffs: Fraction[] = allowedVars.map((_, i) => leftPoly.coeffs[i].sub(rightPoly.coeffs[i]));
  const c = rightPoly.constant.sub(leftPoly.constant);

  const allZero = coeffs.every((coeff) => coeff.isZero());
  if (allZero) {
    throw new Error(
      isZh
        ? `方程至少需要包含一个有效未知数 (${allowedVars.join(' 或 ')})`
        : `Equation must contain at least one variable from (${allowedVars.join(' or ')})`
    );
  }

  const a = coeffs[0] || new Fraction(0n);
  const b = coeffs[1] || new Fraction(0n);

  return { a, b, c, coeffs };
}

interface PolyGeneral {
  coeffs: Fraction[];
  constant: Fraction;
}

function parseExpressionGeneral(expr: string, allowedVars: string[]): PolyGeneral {
  let poly: PolyGeneral = {
    coeffs: allowedVars.map(() => new Fraction(0n)),
    constant: new Fraction(0n),
  };
  if (!expr) return poly;

  let normalized = expr;

  // Expand simple brackets: k(Ax + By + C) or (Ax + By + C)/d or k(Ax + By + C)/d
  const bracketRegex = /([+-]?\d*(?:\.\d+)?|\b)\(([^()]+)\)(?:\/(\d+(?:\.\d+)?))?/;
  let safety = 25;
  while (bracketRegex.test(normalized) && safety > 0) {
    safety--;
    normalized = normalized.replace(bracketRegex, (_, multStr, inner, divStr) => {
      let multiplier = new Fraction(1n);
      if (multStr === '-' || multStr === '-1') multiplier = new Fraction(-1n);
      else if (multStr === '+' || multStr === '+1' || multStr === '') multiplier = new Fraction(1n);
      else multiplier = Fraction.from(multStr);

      if (divStr) {
        multiplier = multiplier.div(Fraction.from(divStr));
      }

      const innerPoly = parseExpressionGeneral(inner, allowedVars);
      const newCoeffs = innerPoly.coeffs.map((coeff) => coeff.mul(multiplier));
      const newConst = innerPoly.constant.mul(multiplier);

      let res = '';
      for (let i = 0; i < allowedVars.length; i++) {
        const vCoeff = newCoeffs[i];
        if (!vCoeff.isZero()) {
          res += `${vCoeff.num < 0n ? '' : '+'}${vCoeff.toString()}${allowedVars[i]}`;
        }
      }
      if (!newConst.isZero()) {
        res += `${newConst.num < 0n ? '' : '+'}${newConst.toString()}`;
      }
      if (!res) res = '+0';
      return res;
    });
  }

  // Tokenize by + and -
  const tokenStr = normalized.replace(/([+-])/g, ' $1').trim();
  const tokens = tokenStr.split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    if (!token) continue;
    let matchedVarIdx = -1;

    for (let i = 0; i < allowedVars.length; i++) {
      const vName = allowedVars[i];
      if (token.includes(vName)) {
        matchedVarIdx = i;
        break;
      }
    }

    if (matchedVarIdx !== -1) {
      const vName = allowedVars[matchedVarIdx];
      const coeffStr = token.replace(vName, '');
      let coeff = new Fraction(1n);
      if (coeffStr === '' || coeffStr === '+') coeff = new Fraction(1n);
      else if (coeffStr === '-') coeff = new Fraction(-1n);
      else coeff = Fraction.from(coeffStr);

      poly.coeffs[matchedVarIdx] = poly.coeffs[matchedVarIdx].add(coeff);
    } else {
      // Must be a constant number
      poly.constant = poly.constant.add(Fraction.from(token));
    }
  }

  return poly;
}

/**
 * 2D Line analysis for coordinate graph
 */
function getLineProperties(eq: EquationStandard) {
  const { a, b, c } = eq;
  if (b.isZero()) {
    const xVal = c.div(a);
    return {
      isVertical: true,
      xIntercept: xVal.toNumber(),
      texForm: `x = ${xVal.toTeX()}`,
      slopeInterceptTeX: `x = ${xVal.toTeX()}`,
    };
  }

  const slopeFrac = a.negate().div(b);
  const interceptFrac = c.div(b);
  const slope = slopeFrac.toNumber();
  const intercept = interceptFrac.toNumber();

  let slopeInterceptTeX = 'y = ';
  if (!slopeFrac.isZero()) {
    if (slopeFrac.isOne()) slopeInterceptTeX += 'x';
    else if (slopeFrac.isMinusOne()) slopeInterceptTeX += '-x';
    else slopeInterceptTeX += `${slopeFrac.toTeX()}x`;

    if (!interceptFrac.isZero()) {
      slopeInterceptTeX += ` ${interceptFrac.toSignedTeX()}`;
    }
  } else {
    slopeInterceptTeX += interceptFrac.toTeX();
  }

  return {
    slope,
    intercept,
    isVertical: false,
    xIntercept: a.isZero() ? undefined : c.div(a).toNumber(),
    texForm: formatEquationTeX(a, b, c),
    slopeInterceptTeX,
  };
}

/**
 * Format matrix to LaTeX
 */
export function matrixToTeX(mat: Fraction[][], isAugmented: boolean = false): string {
  const rows = mat.map((row) => {
    if (isAugmented && row.length > 1) {
      const leftPart = row.slice(0, row.length - 1).map((x) => x.toTeX()).join(' & ');
      const rightPart = row[row.length - 1].toTeX();
      return `${leftPart} & ${rightPart}`;
    }
    return row.map((x) => x.toTeX()).join(' & ');
  });

  if (isAugmented) {
    const colsPattern = `c`.repeat(mat[0].length - 1) + '|c';
    return `\\left[\\begin{array}{${colsPattern}} ${rows.join(' \\\\ ')} \\end{array}\\right]`;
  }
  return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`;
}

/**
 * Compute Determinant of square matrix using exact fraction row reduction
 */
export function computeDeterminant(mat: Fraction[][]): { det: Fraction; steps: string[] } {
  const n = mat.length;
  const a: Fraction[][] = mat.map((row) => row.map((x) => Fraction.from(x)));
  let detMultiplier = new Fraction(1n);
  const steps: string[] = [];

  for (let k = 0; k < n; k++) {
    // Find pivot
    let pivotRow = k;
    while (pivotRow < n && a[pivotRow][k].isZero()) {
      pivotRow++;
    }

    if (pivotRow === n) {
      return { det: new Fraction(0n), steps };
    }

    if (pivotRow !== k) {
      // Swap rows, negate determinant
      const temp = a[k];
      a[k] = a[pivotRow];
      a[pivotRow] = temp;
      detMultiplier = detMultiplier.negate();
      steps.push(`R_{${k + 1}} \\leftrightarrow R_{${pivotRow + 1}}`);
    }

    const pivotVal = a[k][k];

    for (let i = k + 1; i < n; i++) {
      if (!a[i][k].isZero()) {
        const factor = a[i][k].div(pivotVal);
        for (let j = k; j < n; j++) {
          a[i][j] = a[i][j].sub(factor.mul(a[k][j]));
        }
      }
    }
  }

  let diagProduct = new Fraction(1n);
  for (let i = 0; i < n; i++) {
    diagProduct = diagProduct.mul(a[i][i]);
  }

  const det = diagProduct.mul(detMultiplier);
  return { det, steps };
}

/**
 * Compute matrix rank via Gaussian elimination
 */
export function computeRank(mat: Fraction[][]): number {
  const rows = mat.length;
  if (rows === 0) return 0;
  const cols = mat[0].length;
  const a: Fraction[][] = mat.map((row) => row.map((x) => Fraction.from(x)));

  let rank = 0;
  for (let col = 0; col < cols && rank < rows; col++) {
    let pivot = rank;
    while (pivot < rows && a[pivot][col].isZero()) {
      pivot++;
    }
    if (pivot === rows) continue;

    if (pivot !== rank) {
      const temp = a[rank];
      a[rank] = a[pivot];
      a[pivot] = temp;
    }

    const pivotVal = a[rank][col];
    for (let r = rank + 1; r < rows; r++) {
      if (!a[r][col].isZero()) {
        const factor = a[r][col].div(pivotVal);
        for (let c = col; c < cols; c++) {
          a[r][c] = a[r][c].sub(factor.mul(a[rank][c]));
        }
      }
    }
    rank++;
  }
  return rank;
}

/**
 * Solve n×n system using Gaussian Elimination with complete pedagogical step generation
 */
export function solveGaussianSystem(
  equations: EquationGeneral[],
  varNames: string[],
  lang: 'en' | 'zh' = 'en'
): {
  type: SolutionType;
  solution?: { name: string; value: Fraction; tex: string }[];
  steps: StepExplanation[];
  matrixAnalysis: MatrixAnalysis;
  solutionTeX: string;
} {
  const isZh = lang === 'zh';
  const n = equations.length;
  const steps: StepExplanation[] = [];

  // Build matrix A and augmented matrix [A | b]
  const matA: Fraction[][] = equations.map((eq) => eq.coeffs.map((c) => Fraction.from(c)));
  const aug: Fraction[][] = equations.map((eq) => [...eq.coeffs.map((c) => Fraction.from(c)), Fraction.from(eq.c)]);

  // Initial Step 0: Set up Augmented Matrix
  const initMatrixTeX = matrixToTeX(aug, true);
  steps.push({
    title: isZh ? `第 1 步：构造增广矩阵` : `Step 1: Construct Augmented Matrix [A | b]`,
    desc: isZh
      ? `将方程组的各项系数和常数项提取，写出增广矩阵 $[A \\mid \\mathbf{b}]$：`
      : `Extract the coefficients and constant vector into the augmented matrix $[A \\mid \\mathbf{b}]$:`,
    mathTeX: `[A \\mid \\mathbf{b}] = ${initMatrixTeX}`,
    highlightAction: 'pivot',
    annotation: isZh
      ? `线性代数思想：将多元一次方程组转化为矩阵，利用矩阵初等行变换消元，消去书写未知数的繁琐。`
      : `Matrix formulation allows elementary row operations to reduce the system systematically without tracking variables manually.`,
  });

  // Calculate Determinants & Ranks
  const { det: detA } = computeDeterminant(matA);
  const rankA = computeRank(matA);
  const rankAug = computeRank(aug);

  // Compute Cramer's determinants if n <= 3
  const cramerDets: CramerDeterminant[] = [];
  if (n <= 3) {
    for (let col = 0; col < n; col++) {
      const vName = varNames[col];
      const matSub: Fraction[][] = matA.map((row, rIdx) => {
        const newRow = [...row];
        newRow[col] = equations[rIdx].c;
        return newRow;
      });
      const { det: subDet } = computeDeterminant(matSub);
      const symbol = `D_{${vName.replace(/[{}]/g, '')}}`;
      cramerDets.push({
        varName: vName,
        symbol,
        value: subDet,
        matrixTeX: matrixToTeX(matSub, false),
        formulaTeX: `${symbol} = ${matrixToTeX(matSub, false)} = ${subDet.toTeX()}`,
      });
    }
  }

  // Rouché-Capelli analysis
  let rcResult: SolutionType = 'unique';
  let rcExplanation = '';
  if (rankA < rankAug) {
    rcResult = 'none';
    rcExplanation = isZh
      ? `增广矩阵的秩 rank([A|b]) = ${rankAug} 大于系数矩阵的秩 rank(A) = ${rankA}，出现 0 = c (c ≠ 0) 的矛盾行，方程组无解。`
      : `rank([A|b]) = ${rankAug} > rank(A) = ${rankA}. An inconsistent equation 0 = c (c ≠ 0) exists, so the system has No Solution.`;
  } else if (rankA === rankAug && rankA < n) {
    rcResult = 'infinite';
    rcExplanation = isZh
      ? `系数矩阵与增广矩阵的秩相等 rank(A) = rank([A|b]) = ${rankA} < 未知数个数 ${n}，有效独立方程数不足，方程组有无穷多组解（自由度为 ${n - rankA}）。`
      : `rank(A) = rank([A|b]) = ${rankA} < ${n} variables. The system is underdetermined with ${n - rankA} free variables, yielding Infinitely Many Solutions.`;
  } else {
    rcResult = 'unique';
    rcExplanation = isZh
      ? `系数矩阵的秩 rank(A) = rank([A|b]) = 未知数个数 ${n}，行列式 D = ${detA.toTeX()} ≠ 0，根据克莱姆法则与朗歇-卡佩利定理，方程组有且仅有唯一解。`
      : `rank(A) = rank([A|b]) = ${n} (number of variables) and determinant D = ${detA.toTeX()} ≠ 0. By Rouché–Capelli Theorem & Cramer's Rule, the system has a Unique Solution.`;
  }

  const matrixAnalysis: MatrixAnalysis = {
    dim: n,
    varNames,
    detA,
    detTeX: `D = \\det(A) = ${detA.toTeX()}`,
    cramerDets,
    rankA,
    rankAug,
    roucheCapelliResult: rcResult,
    roucheCapelliExplanation: rcExplanation,
    matrixATeX: matrixToTeX(matA, false),
    matrixAugTeX: initMatrixTeX,
  };

  // Perform Forward Elimination (Triangularization)
  let stepCounter = 2;
  const currentAug: Fraction[][] = aug.map((r) => [...r]);

  for (let k = 0; k < n; k++) {
    // 1. Find pivot
    let pivotRow = k;
    while (pivotRow < n && currentAug[pivotRow][k].isZero()) {
      pivotRow++;
    }

    if (pivotRow >= n) {
      // Column has no pivot
      continue;
    }

    if (pivotRow !== k) {
      const temp = currentAug[k];
      currentAug[k] = currentAug[pivotRow];
      currentAug[pivotRow] = temp;

      steps.push({
        title: isZh
          ? `第 ${stepCounter++} 步：行交换 (R_${k + 1} ↔ R_${pivotRow + 1})`
          : `Step ${stepCounter++}: Row Swap (R_${k + 1} ↔ R_${pivotRow + 1})`,
        desc: isZh
          ? `第 ${k + 1} 行主元为 0，与第 ${pivotRow + 1} 行互换，使主对角线上元非零：`
          : `Pivot in row ${k + 1} is zero. Swap Row ${k + 1} with Row ${pivotRow + 1} to obtain a non-zero pivot:`,
        mathTeX: `R_{${k + 1}} \\longleftrightarrow R_{${pivotRow + 1}} \\implies ${matrixToTeX(currentAug, true)}`,
        highlightAction: 'pivot',
      });
    }

    const pivotVal = currentAug[k][k];

    // 2. Eliminate all rows below k
    for (let i = k + 1; i < n; i++) {
      if (!currentAug[i][k].isZero()) {
        const factor = currentAug[i][k].div(pivotVal);
        for (let j = k; j <= n; j++) {
          currentAug[i][j] = currentAug[i][j].sub(factor.mul(currentAug[k][j]));
        }

        const opStr = factor.isPositive()
          ? `R_{${i + 1}} - ${factor.isOne() ? '' : factor.toTeX()} R_{${k + 1}}`
          : `R_{${i + 1}} + ${factor.abs().isOne() ? '' : factor.abs().toTeX()} R_{${k + 1}}`;

        steps.push({
          title: isZh
            ? `第 ${stepCounter++} 步：初等行变换消元 (R_${i + 1})`
            : `Step ${stepCounter++}: Eliminate in Row ${i + 1}`,
          desc: isZh
            ? `用第 ${k + 1} 行消去第 ${i + 1} 行第 ${k + 1} 列的未知数 $${varNames[k]}$：`
            : `Subtract a multiple of Row ${k + 1} from Row ${i + 1} to eliminate variable $${varNames[k]}$:`,
          mathTeX: `R_{${i + 1}} \\leftarrow ${opStr} \\implies ${matrixToTeX(currentAug, true)}`,
          highlightVar: varNames[k],
          highlightAction: 'eliminate',
        });
      }
    }
  }

  // Row Echelon Form reached
  steps.push({
    title: isZh ? `第 ${stepCounter++} 步：已化为上阶梯形矩阵 (REF)` : `Step ${stepCounter++}: Row Echelon Form (REF) Achieved`,
    desc: isZh
      ? `前向消元完成，增广矩阵已成功化为上三角阶梯形矩阵。各未知数系数已呈阶梯状解耦：`
      : `Forward elimination completed. The augmented matrix is now in upper triangular echelon form:`,
    mathTeX: matrixToTeX(currentAug, true),
    annotation: isZh
      ? `定理判定：系数矩阵秩 rank(A) = ${rankA}，增广矩阵秩 rank([A|b]) = ${rankAug}。`
      : `Rank analysis: rank(A) = ${rankA}, rank([A|b]) = ${rankAug}.`,
  });

  if (rcResult !== 'unique') {
    return {
      type: rcResult,
      steps,
      matrixAnalysis,
      solutionTeX: rcResult === 'none' ? '\\text{无解}' : '\\text{无穷多解}',
    };
  }

  // Backward Substitution
  const solValues: Fraction[] = new Array(n);

  for (let i = n - 1; i >= 0; i--) {
    let sum = currentAug[i][n];
    let substDetails = '';

    for (let j = i + 1; j < n; j++) {
      const term = currentAug[i][j].mul(solValues[j]);
      sum = sum.sub(term);
      substDetails += ` - (${currentAug[i][j].toTeX()}) \\times (${solValues[j].toTeX()})`;
    }

    const solVal = sum.div(currentAug[i][i]);
    solValues[i] = solVal;

    steps.push({
      title: isZh
        ? `第 ${stepCounter++} 步：回代求解 $${varNames[i]}$`
        : `Step ${stepCounter++}: Back-Substitute for $${varNames[i]}$`,
      desc: isZh
        ? `由第 ${i + 1} 行对应的方程，将已求得的未知数代入计算 $${varNames[i]}$：`
        : `Using Equation from Row ${i + 1}, substitute the solved unknowns to solve for $${varNames[i]}$:`,
      mathTeX: `${varNames[i]} = \\frac{${currentAug[i][n].toTeX()}${substDetails}}{${currentAug[i][
        i
      ].toTeX()}} = ${solVal.toTeX()}`,
      highlightVar: varNames[i],
      highlightAction: 'solve',
    });
  }

  const solutionList = varNames.map((name, idx) => ({
    name,
    value: solValues[idx],
    tex: solValues[idx].toTeX(),
  }));

  const solutionTeX = `\\begin{cases} ${solutionList.map((s) => `${s.name} = ${s.tex}`).join(' \\\\ ')} \\end{cases}`;

  // Final conclusion step
  steps.push({
    title: isZh ? `最终步：规范写出方程组的解` : `Final Step: State the System Solution`,
    desc: isZh ? `联立写出最终解向量：` : `State the solution in standard vector/system notation:`,
    mathTeX: `\\therefore \\mathbf{x} = ${solutionTeX}`,
  });

  return {
    type: 'unique',
    solution: solutionList,
    steps,
    matrixAnalysis,
    solutionTeX,
  };
}

/**
 * Generate full solver analysis with n×n Gaussian elimination and 2x2 substitution/elimination methods
 */
export function solveLinearSystem(
  eq1: EquationStandard,
  eq2: EquationStandard,
  lang: any = 'en'
): SystemAnalysis {
  return solveGeneralLinearSystem([
    { coeffs: [eq1.a, eq1.b], c: eq1.c, rawStr: eq1.rawStr },
    { coeffs: [eq2.a, eq2.b], c: eq2.c, rawStr: eq2.rawStr },
  ], ['x', 'y'], lang);
}

/**
 * Solve general n×n linear system
 */
export function solveGeneralLinearSystem(
  equations: EquationGeneral[],
  varNames: string[] = ['x', 'y'],
  lang: any = 'en'
): SystemAnalysis {
  const isZh = lang === 'zh';
  const n = equations.length;

  // Run Gaussian elimination core
  const gaussResult = solveGaussianSystem(equations, varNames, lang);
  const matrixAnalysis = gaussResult.matrixAnalysis;
  const D = matrixAnalysis.detA;

  // If 2x2, also provide lines, substitution and elimination methods
  let line1: any = undefined;
  let line2: any = undefined;
  let substitutionMethod: MethodSolution | undefined = undefined;
  let eliminationMethod: MethodSolution | undefined = undefined;

  if (n === 2) {
    const eq1: EquationStandard = { a: equations[0].coeffs[0], b: equations[0].coeffs[1], c: equations[0].c };
    const eq2: EquationStandard = { a: equations[1].coeffs[0], b: equations[1].coeffs[1], c: equations[1].c };
    line1 = getLineProperties(eq1);
    line2 = getLineProperties(eq2);

    if (gaussResult.type === 'unique' && gaussResult.solution) {
      const x = gaussResult.solution[0].value;
      const y = gaussResult.solution[1].value;

      const hasUnitCoeff =
        eq1.a.abs().isOne() || eq1.b.abs().isOne() || eq2.a.abs().isOne() || eq2.b.abs().isOne();
      const hasAlignedX = eq1.a.abs().equals(eq2.a.abs());
      const hasAlignedY = eq1.b.abs().equals(eq2.b.abs());
      const recommendSub = hasUnitCoeff && !hasAlignedX && !hasAlignedY;

      substitutionMethod = buildSubstitutionSteps(eq1, eq2, x, y, gaussResult.solutionTeX, recommendSub, lang);
      eliminationMethod = buildEliminationSteps(eq1, eq2, x, y, gaussResult.solutionTeX, !recommendSub, lang);
    }
  }

  const gaussianMethod: MethodSolution = {
    name: isZh ? '高斯消元法（矩阵行变换）' : 'Gaussian Elimination (Row Operations)',
    methodKey: 'gaussian',
    coreIdea: isZh
      ? '利用增广矩阵初等行变换将方程组化为上三角阶梯形（REF），再逆序回代，通用求解任意 n×n 方程组。'
      : 'Transform the augmented matrix into Row Echelon Form (REF) via elementary row operations, then back-substitute.',
    recommended: n > 2,
    steps: gaussResult.steps,
    solutionTeX: gaussResult.solutionTeX,
  };

  // Type descriptions
  let typeDescription = '';
  let geometricInterpretation = '';

  if (gaussResult.type === 'unique') {
    typeDescription = isZh
      ? `方程组有唯一解 (秩 rank = ${matrixAnalysis.rankA})`
      : `Unique Solution (Rank = ${matrixAnalysis.rankA})`;
    geometricInterpretation = isZh
      ? n === 2
        ? `两直线的斜率不同，在平面直角坐标系中有且只有一个交点，交点坐标为 (${gaussResult.solution?.[0].tex}, ${gaussResult.solution?.[1].tex})。`
        : `在 ${n} 维欧几里得空间中，各超平面交于唯一的公共点。`
      : n === 2
      ? `The lines have different slopes and intersect at exactly one point in the Cartesian coordinate plane at (${gaussResult.solution?.[0].tex}, ${gaussResult.solution?.[1].tex}).`
      : `In ${n}-dimensional space, the hyperplanes intersect at a unique point.`;
  } else if (gaussResult.type === 'none') {
    typeDescription = isZh
      ? `方程组无解（两方程矛盾，超平面平行或无公共交点）`
      : `No Solution (Inconsistent, Parallel Hyperplanes)`;
    geometricInterpretation = isZh
      ? matrixAnalysis.roucheCapelliExplanation
      : matrixAnalysis.roucheCapelliExplanation;
  } else {
    typeDescription = isZh
      ? `方程组有无穷多组解（存在自由未知量）`
      : `Infinitely Many Solutions (Underdetermined System)`;
    geometricInterpretation = isZh
      ? matrixAnalysis.roucheCapelliExplanation
      : matrixAnalysis.roucheCapelliExplanation;
  }

  // Verification checks
  let eqChecks: { label: string; checkTeX: string; isCorrect: boolean }[] = [];
  let allCorrect = true;

  if (gaussResult.type === 'unique' && gaussResult.solution) {
    eqChecks = equations.map((eq, idx) => {
      let lhs = new Fraction(0n);
      let exprTeX = '';
      for (let j = 0; j < n; j++) {
        const coeff = eq.coeffs[j];
        const solVal = gaussResult.solution![j].value;
        lhs = lhs.add(coeff.mul(solVal));

        const coeffTeX = coeff.toTeX();
        const solTeX = solVal.toTeX();
        if (exprTeX === '') {
          exprTeX += `${coeffTeX} \\times (${solTeX})`;
        } else {
          exprTeX += ` + ${coeffTeX} \\times (${solTeX})`;
        }
      }

      const isEqCorrect = lhs.equals(eq.c);
      if (!isEqCorrect) allCorrect = false;

      const circleNum = ['①', '②', '③', '④', '⑤', '⑥'][idx] || `(${idx + 1})`;
      const checkTeX = isZh
        ? `\\text{方程}${circleNum}\\text{：左边} = ${exprTeX} = ${lhs.toTeX()} = \\text{右边}`
        : `\\text{Eq }${circleNum}\\text{: LHS} = ${exprTeX} = ${lhs.toTeX()} = \\text{RHS}`;

      return { label: circleNum, checkTeX, isCorrect: isEqCorrect };
    });
  }

  const solVars = gaussResult.solution;
  const x = solVars?.[0]?.value || new Fraction(0n);
  const y = solVars?.[1]?.value || new Fraction(0n);

  return {
    dim: n,
    varNames,
    type: gaussResult.type,
    determinant: D,
    typeDescription,
    geometricInterpretation,
    matrixAnalysis,
    solution: solVars
      ? {
          vars: solVars,
          x,
          y,
          xTeX: x.toTeX(),
          yTeX: y.toTeX(),
        }
      : undefined,
    substitutionMethod,
    eliminationMethod,
    gaussianMethod,
    verification: {
      eqChecks,
      eq1Check: eqChecks[0]?.checkTeX || '',
      eq2Check: eqChecks[1]?.checkTeX || '',
      isCorrect: allCorrect,
    },
    line1,
    line2,
  };
}

/**
 * Generate Step-by-Step for Substitution Method (代入消元法规范解题步骤)
 */
function buildSubstitutionSteps(
  eq1: EquationStandard,
  eq2: EquationStandard,
  xSol: Fraction,
  ySol: Fraction,
  solutionTeX: string,
  recommended: boolean,
  lang: 'en' | 'zh' = 'en'
): MethodSolution {
  const steps: StepExplanation[] = [];
  const isZh = lang === 'zh';

  interface ExpressChoice {
    fromEq: 1 | 2;
    varName: 'x' | 'y';
    otherVar: 'x' | 'y';
    coeff: Fraction;
    score: number;
  }

  const choices: ExpressChoice[] = [
    { fromEq: 1, varName: 'x', otherVar: 'y', coeff: eq1.a, score: scoreCoeff(eq1.a) },
    { fromEq: 1, varName: 'y', otherVar: 'x', coeff: eq1.b, score: scoreCoeff(eq1.b) },
    { fromEq: 2, varName: 'x', otherVar: 'y', coeff: eq2.a, score: scoreCoeff(eq2.a) },
    { fromEq: 2, varName: 'y', otherVar: 'x', coeff: eq2.b, score: scoreCoeff(eq2.b) },
  ];

  choices.sort((a, b) => b.score - a.score);
  const best = choices[0];

  const sourceEq = best.fromEq === 1 ? eq1 : eq2;
  const targetEq = best.fromEq === 1 ? eq2 : eq1;
  const targetEqNum = best.fromEq === 1 ? '②' : '①';
  const sourceEqNum = best.fromEq === 1 ? '①' : '②';

  let exprTeX = '';
  const otherCoeff = best.varName === 'x' ? sourceEq.b : sourceEq.a;
  const varCoeff = best.coeff;
  const constTerm = sourceEq.c;

  if (varCoeff.isOne()) {
    const negOther = otherCoeff.negate();
    if (negOther.isZero()) {
      exprTeX = `${best.varName} = ${constTerm.toTeX()}`;
    } else {
      let t = '';
      if (!constTerm.isZero()) t += `${constTerm.toTeX()} `;
      if (negOther.isOne()) t += (t ? '+ ' : '') + `${best.otherVar}`;
      else if (negOther.isMinusOne()) t += (t ? '- ' : '-') + `${best.otherVar}`;
      else if (negOther.isPositive()) t += (t ? '+ ' : '') + `${negOther.toTeX()}${best.otherVar}`;
      else t += (t ? '- ' : '-') + `${negOther.abs().toTeX()}${best.otherVar}`;
      exprTeX = `${best.varName} = ${t}`;
    }
  } else if (varCoeff.isMinusOne()) {
    const posOther = otherCoeff;
    const negConst = constTerm.negate();
    let t = '';
    if (posOther.isOne()) t += `${best.otherVar}`;
    else if (posOther.isMinusOne()) t += `-${best.otherVar}`;
    else if (!posOther.isZero()) t += `${posOther.toTeX()}${best.otherVar}`;

    if (!negConst.isZero()) {
      t += (t ? ' ' : '') + negConst.toSignedTeX();
    }
    exprTeX = `${best.varName} = ${t || '0'}`;
  } else {
    const negOther = otherCoeff.negate();
    let numStr = '';
    if (!constTerm.isZero()) numStr += `${constTerm.toTeX()}`;
    if (!negOther.isZero()) {
      if (negOther.isOne()) numStr += `${numStr ? ' + ' : ''}${best.otherVar}`;
      else if (negOther.isMinusOne()) numStr += `${numStr ? ' - ' : '-'}${best.otherVar}`;
      else if (negOther.isPositive()) numStr += `${numStr ? ' + ' : ''}${negOther.toTeX()}${best.otherVar}`;
      else numStr += `${numStr ? ' - ' : '-'}${negOther.abs().toTeX()}${best.otherVar}`;
    }
    exprTeX = `${best.varName} = \\frac{${numStr || '0'}}{${varCoeff.toTeX()}}`;
  }

  // Step 1: 变形
  steps.push({
    title: isZh ? `第一步：观察系数，选式变形` : `Step 1: Express one variable in terms of the other`,
    desc: isZh
      ? `观察原方程组中各未知数的系数，方程${sourceEqNum}中未知数 $${best.varName}$ 的系数最易化简。用含 $${best.otherVar}$ 的代数式表示 $${best.varName}$：`
      : `Examine the coefficients. Express variable $${best.varName}$ in terms of $${best.otherVar}$ using Equation ${sourceEqNum}:`,
    mathTeX: isZh
      ? `\\text{由}${sourceEqNum}\\text{，得：}\\quad ${exprTeX} \\quad \\text{③}`
      : `\\text{From }${sourceEqNum}\\text{, we obtain: }\\quad ${exprTeX} \\quad \\text{③}`,
    highlightVar: best.varName,
    highlightAction: 'substitute',
    annotation: isZh
      ? `提示：优先选用系数为 1 或 -1 的未知数，可避免出现复杂分数，减少后续计算差错。`
      : `Strategy: Choosing a variable with coefficient ±1 avoids fractional expressions at this stage.`,
  });

  // Step 2: 代入
  const targetVarCoeff = best.varName === 'x' ? targetEq.a : targetEq.b;
  const targetOtherCoeff = best.varName === 'x' ? targetEq.b : targetEq.a;

  const subExprInner = exprTeX.split('=')[1].trim();
  let substitutedMath = '';
  if (best.varName === 'x') {
    substitutedMath = `${targetVarCoeff.toTeX()} \\cdot \\left(${subExprInner}\\right) + ${targetOtherCoeff.toTeX()}y = ${targetEq.c.toTeX()}`;
  } else {
    substitutedMath = `${targetOtherCoeff.toTeX()}x + ${targetVarCoeff.toTeX()} \\cdot \\left(${subExprInner}\\right) = ${targetEq.c.toTeX()}`;
  }

  steps.push({
    title: isZh ? `第二步：代入消元，化二元为一元` : `Step 2: Substitute expression into the other equation`,
    desc: isZh
      ? `把 ③ 代入方程${targetEqNum}，成功消去未知数 $${best.varName}$，得到关于 $${best.otherVar}$ 的一元一次方程：`
      : `Substitute ③ into Equation ${targetEqNum} to eliminate $${best.varName}$, producing a single-variable linear equation in $${best.otherVar}$:`,
    mathTeX: isZh
      ? `\\text{把③代入}${targetEqNum}\\text{，得：}\\quad ${substitutedMath}`
      : `\\text{Substitute ③ into }${targetEqNum}\\text{: }\\quad ${substitutedMath}`,
    highlightVar: best.varName,
    highlightAction: 'eliminate',
    annotation: isZh
      ? `消元核心：将式③作为整体代入另一个方程中，实现未知数由两个化为一个。`
      : `Core concept: Substituting the algebraic expression reduces the two-variable system to one variable.`,
  });

  // Step 3: 解一元一次方程
  const solvedOtherVal = best.otherVar === 'x' ? xSol : ySol;
  steps.push({
    title: isZh ? `第三步：解一元一次方程，求出 $${best.otherVar}$` : `Step 3: Solve the single-variable equation for $${best.otherVar}$`,
    desc: isZh
      ? `按照去括号、移项、合并同类项、系数化为 1 的标准步骤求解：`
      : `Expand parentheses, collect like terms, and isolate the unknown:`,
    mathTeX: isZh
      ? `\\text{解这个方程，得：}\\quad ${best.otherVar} = ${solvedOtherVal.toTeX()}`
      : `\\text{Solving yields: }\\quad ${best.otherVar} = ${solvedOtherVal.toTeX()}`,
    highlightVar: best.otherVar,
    highlightAction: 'solve',
    annotation: isZh ? `注意去括号时的符号变化以及移项要变号。` : `Pay close attention to signs when distributing across parentheses.`,
  });

  // Step 4: 回代
  const solvedMainVal = best.varName === 'x' ? xSol : ySol;
  steps.push({
    title: isZh ? `第四步：回代求值，求出 $${best.varName}$` : `Step 4: Back-substitute to find $${best.varName}$`,
    desc: isZh
      ? `把求得的 $${best.otherVar} = ${solvedOtherVal.toTeX()}$ 代入变形方程③中，计算 $${best.varName}$ 的值：`
      : `Substitute $${best.otherVar} = ${solvedOtherVal.toTeX()}$ into Equation ③ to compute $${best.varName}$:`,
    mathTeX: `${best.varName} = ${subExprInner.replace(
      new RegExp(best.otherVar, 'g'),
      `(${solvedOtherVal.toTeX()})`
    )} = ${solvedMainVal.toTeX()}`,
    highlightVar: best.varName,
    highlightAction: 'solve',
    annotation: isZh
      ? `代入③比代入原方程①或②更加直接，因为③已经将 ${best.varName} 单独隔离在等号左边。`
      : `Substituting into ③ is direct because ${best.varName} is already isolated on the left side.`,
  });

  // Step 5: 写出规范答语
  steps.push({
    title: isZh ? `第五步：规范写出方程组的解` : `Step 5: Conclude the final system solution`,
    desc: isZh ? `用大括号将两个未知数的值联立，写出最终答案：` : `State the solution set using standard system brace notation:`,
    mathTeX: isZh
      ? `\\therefore \\text{原方程组的解为：}\\quad ${solutionTeX}`
      : `\\therefore \\text{The solution to the system is: }\\quad ${solutionTeX}`,
  });

  return {
    name: isZh ? '代入消元法' : 'Substitution Method',
    methodKey: 'substitution',
    coreIdea: isZh
      ? '抓准系数为 ±1 的未知数，先变出一元代数式，再整体代入另一个方程，实现“二元变一元”。'
      : 'Isolate one variable with coefficient ±1, substitute it into the other equation, and solve the resulting single-variable equation.',
    recommended,
    steps,
    solutionTeX,
  };
}

function scoreCoeff(coeff: Fraction): number {
  if (coeff.isZero()) return -9999;
  if (coeff.isOne()) return 100;
  if (coeff.isMinusOne()) return 90;
  if (coeff.isInteger()) {
    const absVal = Number(coeff.abs().num);
    return 80 - absVal;
  }
  return 10;
}

/**
 * Generate Step-by-Step for Addition/Subtraction Elimination Method (加减消元法规范解题步骤)
 * Fixed:
 * 1. Step 2 & 3 variable name logic: Step 2 eliminates `eliminateVar`, Step 3 solves for `otherVar`.
 * 2. Formula string glitch: Clean template concatenation without stray $ or missing plus.
 */
function buildEliminationSteps(
  eq1: EquationStandard,
  eq2: EquationStandard,
  xSol: Fraction,
  ySol: Fraction,
  solutionTeX: string,
  recommended: boolean,
  lang: 'en' | 'zh' = 'en'
): MethodSolution {
  const steps: StepExplanation[] = [];
  const isZh = lang === 'zh';

  const xCoeff1 = eq1.a;
  const xCoeff2 = eq2.a;
  const yCoeff1 = eq1.b;
  const yCoeff2 = eq2.b;

  const canEliminateX = !xCoeff1.isZero() && !xCoeff2.isZero();
  const canEliminateY = !yCoeff1.isZero() && !yCoeff2.isZero();

  if (!canEliminateX && !canEliminateY) {
    const var1 = eq1.b.isZero() ? 'x' : 'y';
    const val1 = var1 === 'x' ? xSol : ySol;
    const var2 = eq2.b.isZero() ? 'x' : 'y';
    const val2 = var2 === 'x' ? xSol : ySol;

    steps.push({
      title: isZh ? '第一步：观察方程，未知数已天然分离' : 'Step 1: Variables already isolated',
      desc: isZh
        ? `方程①只含未知数 $${var1}$，方程②只含未知数 $${var2}$，两方程已分别化为一元一次方程，无需加减消元即可直接求解。`
        : `Equation ① contains only $${var1}$ and Equation ② contains only $${var2}$. The variables are already separated, so each equation can be solved directly.`,
      mathTeX: `\\begin{cases} ${formatEquationTeX(eq1.a, eq1.b, eq1.c)} & \\text{①} \\\\ ${formatEquationTeX(
        eq2.a,
        eq2.b,
        eq2.c
      )} & \\text{②} \\end{cases}`,
    });

    steps.push({
      title: isZh ? '第二步：分别解一元一次方程' : 'Step 2: Solve each linear equation directly',
      desc: isZh
        ? `解方程①得 $${var1} = ${val1.toTeX()}$；解方程②得 $${var2} = ${val2.toTeX()}$。`
        : `Solving Equation ① yields $${var1} = ${val1.toTeX()}$; solving Equation ② yields $${var2} = ${val2.toTeX()}$.`,
      mathTeX: `${var1} = ${val1.toTeX()}, \\quad ${var2} = ${val2.toTeX()}`,
      highlightVar: var1,
      highlightAction: 'solve',
    });

    steps.push({
      title: isZh ? '第三步：写出方程组的解' : 'Step 3: State the final solution',
      desc: isZh ? '联立写出最终结果：' : 'Combine the values into the solution set:',
      mathTeX: isZh
        ? `\\therefore \\text{原方程组的解为：}\\quad ${solutionTeX}`
        : `\\therefore \\text{The solution to the system is: }\\quad ${solutionTeX}`,
    });

    return {
      name: isZh ? '加减消元法' : 'Elimination Method',
      methodKey: 'elimination',
      coreIdea: isZh
        ? '当两方程各仅含一个不同未知数时，实质已完成消元，直接分别求解即可。'
        : 'When variables are already decoupled across equations, solve each independent equation directly.',
      recommended,
      steps,
      solutionTeX,
    };
  }

  // Check LCM for x vs y
  const xLcm = canEliminateX
    ? Fraction.lcm(xCoeff1.abs().num * xCoeff2.abs().den, xCoeff2.abs().num * xCoeff1.abs().den)
    : 999999n;
  const yLcm = canEliminateY
    ? Fraction.lcm(yCoeff1.abs().num * yCoeff2.abs().den, yCoeff2.abs().num * yCoeff1.abs().den)
    : 999999n;

  let eliminateVar: 'x' | 'y' = 'y';
  if (canEliminateX && !canEliminateY) {
    eliminateVar = 'x';
  } else if (!canEliminateX && canEliminateY) {
    eliminateVar = 'y';
  } else {
    if (xCoeff1.abs().equals(xCoeff2.abs())) {
      eliminateVar = 'x';
    } else if (yCoeff1.abs().equals(yCoeff2.abs())) {
      eliminateVar = 'y';
    } else if (xLcm < yLcm) {
      eliminateVar = 'x';
    } else {
      eliminateVar = 'y';
    }
  }

  const c1 = eliminateVar === 'x' ? xCoeff1 : yCoeff1;
  const c2 = eliminateVar === 'x' ? xCoeff2 : yCoeff2;
  const otherVar: 'x' | 'y' = eliminateVar === 'x' ? 'y' : 'x';

  const targetLcm = eliminateVar === 'x' ? xLcm : yLcm;
  const m1 = new Fraction(targetLcm, 1n).div(c1.abs());
  const m2 = new Fraction(targetLcm, 1n).div(c2.abs());

  const eq3: EquationStandard = {
    a: eq1.a.mul(m1),
    b: eq1.b.mul(m1),
    c: eq1.c.mul(m1),
  };
  const eq4: EquationStandard = {
    a: eq2.a.mul(m2),
    b: eq2.b.mul(m2),
    c: eq2.c.mul(m2),
  };

  const c3 = eliminateVar === 'x' ? eq3.a : eq3.b;
  const c4 = eliminateVar === 'x' ? eq4.a : eq4.b;

  const isOpposite = c3.add(c4).isZero();

  const needTransform1 = !m1.isOne();
  const needTransform2 = !m2.isOne();

  let transformDesc = '';
  let transformMath = '';

  if (!needTransform1 && !needTransform2) {
    transformDesc = isZh
      ? `观察方程①与②中未知数 $${eliminateVar}$ 的系数：系数${
          isOpposite ? '互为相反数' : '相同'
        }，无需两边乘数，可直接进行加减消元。`
      : `Observe the coefficients of $${eliminateVar}$ in Equations ① and ②: they are already ${
          isOpposite ? 'opposites' : 'identical'
        }. No multiplication is required; proceed directly to add or subtract.`;
    transformMath = `\\begin{cases} ${formatEquationTeX(eq1.a, eq1.b, eq1.c)} & \\text{①} \\\\ ${formatEquationTeX(
      eq2.a,
      eq2.b,
      eq2.c
    )} & \\text{②} \\end{cases}`;
  } else {
    transformDesc = isZh
      ? `为了消去未知数 $${eliminateVar}$，利用等式的性质将两方程同乘以适当的非零数，使 $${eliminateVar}$ 的系数绝对值相等：`
      : `To eliminate $${eliminateVar}$, multiply the equations by suitable non-zero integers so the coefficients of $${eliminateVar}$ have equal absolute values:`;
    let mathLines: string[] = [];
    if (needTransform1) {
      mathLines.push(
        isZh
          ? `\\text{①} \\times ${m1.toTeX()}\\text{，得：}\\quad ${formatEquationTeX(eq3.a, eq3.b, eq3.c)} \\quad \\text{③}`
          : `\\text{①} \\times ${m1.toTeX()}\\text{ gives: }\\quad ${formatEquationTeX(eq3.a, eq3.b, eq3.c)} \\quad \\text{③}`
      );
    } else {
      mathLines.push(
        isZh
          ? `\\text{保留①式：}\\quad ${formatEquationTeX(eq3.a, eq3.b, eq3.c)} \\quad \\text{①}`
          : `\\text{Keep ①: }\\quad ${formatEquationTeX(eq3.a, eq3.b, eq3.c)} \\quad \\text{①}`
      );
    }
    if (needTransform2) {
      mathLines.push(
        isZh
          ? `\\text{②} \\times ${m2.toTeX()}\\text{，得：}\\quad ${formatEquationTeX(eq4.a, eq4.b, eq4.c)} \\quad \\text{④}`
          : `\\text{②} \\times ${m2.toTeX()}\\text{ gives: }\\quad ${formatEquationTeX(eq4.a, eq4.b, eq4.c)} \\quad \\text{④}`
      );
    } else {
      mathLines.push(
        isZh
          ? `\\text{保留②式：}\\quad ${formatEquationTeX(eq4.a, eq4.b, eq4.c)} \\quad \\text{②}`
          : `\\text{Keep ②: }\\quad ${formatEquationTeX(eq4.a, eq4.b, eq4.c)} \\quad \\text{②}`
      );
    }
    transformMath = mathLines.join(' \\\\[6pt] ');
  }

  // Step 1: 统一系数
  steps.push({
    title: isZh ? `第一步：统一系数，对齐未知数 $${eliminateVar}$` : `Step 1: Align coefficients of $${eliminateVar}$`,
    desc: transformDesc,
    mathTeX: transformMath,
    highlightVar: eliminateVar,
    highlightAction: 'eliminate',
    annotation: isZh
      ? `消元法则口诀：“同号相减，异号相加”；系数符号相同时作差，符号相反时作和。`
      : `Elimination principle: "Same signs subtract, opposite signs add".`,
  });

  // Step 2: 相加或相减消元 (FIXED: highlightVar is eliminateVar, action is eliminate)
  const operation = isOpposite ? '+' : '-';
  const labelLeft = needTransform1 ? '③' : '①';
  const labelRight = needTransform2 ? '④' : '②';

  const otherCoeff3 = eliminateVar === 'x' ? eq3.b : eq3.a;
  const otherCoeff4 = eliminateVar === 'x' ? eq4.b : eq4.a;
  const combOtherCoeff = isOpposite ? otherCoeff3.add(otherCoeff4) : otherCoeff3.sub(otherCoeff4);
  const combConst = isOpposite ? eq3.c.add(eq4.c) : eq3.c.sub(eq4.c);

  // FIXED formula glitch: clean template without stray $ or missing +
  const leftCombTeX = formatLinearCombinationTeX(otherCoeff3, otherCoeff4, operation, otherVar);
  const rightCombTeX = formatConstCombinationTeX(eq3.c, eq4.c, operation);

  const elimStepMath = isZh
    ? `\\text{${labelLeft} ${operation} ${labelRight}，得：}\\quad ${leftCombTeX} = ${rightCombTeX}`
    : `\\text{${labelLeft} ${operation} ${labelRight}\\text{ yields: }}\\quad ${leftCombTeX} = ${rightCombTeX}`;

  steps.push({
    title: isZh
      ? `第二步：${isOpposite ? '两式相加' : '两式相减'}，消去 $${eliminateVar}$`
      : `Step 2: ${isOpposite ? 'Add equations' : 'Subtract equations'} to eliminate $${eliminateVar}$`,
    desc: isZh
      ? `因为未知数 $${eliminateVar}$ 的系数${isOpposite ? '互为相反数，将两式相加' : '符号相同，将两式相减'}，从而成功消去 $${eliminateVar}$：`
      : `Because the coefficients of $${eliminateVar}$ are ${
          isOpposite ? 'opposites, add the two equations' : 'identical, subtract the two equations'
        } to eliminate $${eliminateVar}$:`,
    mathTeX: `${elimStepMath} \\\\[6pt] \\implies ${combOtherCoeff.toTeX()}${otherVar} = ${combConst.toTeX()}`,
    highlightVar: eliminateVar, // FIXED: Correctly marks the eliminated variable
    highlightAction: 'eliminate',
    annotation: isZh
      ? `初一易错警示：两式相减时，减式的各项（包括常数项）都必须改变符号！`
      : `Common trap: When subtracting equations, remember to distribute the negative sign to all terms on both sides!`,
  });

  // Step 3: 解出一元一次方程 (FIXED: highlights otherVar with action solve)
  const solvedOtherVal = otherVar === 'x' ? xSol : ySol;
  steps.push({
    title: isZh ? `第三步：解一元一次方程，求出 $${otherVar}$` : `Step 3: Solve for $${otherVar}$`,
    desc: isZh
      ? `两边同除以未知数 $${otherVar}$ 的系数 ${combOtherCoeff.toTeX()}：`
      : `Divide both sides by the coefficient ${combOtherCoeff.toTeX()}:`,
    mathTeX: `${otherVar} = \\frac{${combConst.toTeX()}}{${combOtherCoeff.toTeX()}} = ${solvedOtherVal.toTeX()}`,
    highlightVar: otherVar, // FIXED: Marks otherVar
    highlightAction: 'solve', // FIXED: Action is solve
  });

  // Step 4: 代入原方程求出另一个未知数
  const solvedElimVal = eliminateVar === 'x' ? xSol : ySol;
  const origCoeffElim = eliminateVar === 'x' ? eq1.a : eq1.b;
  const origCoeffOther = eliminateVar === 'x' ? eq1.b : eq1.a;

  steps.push({
    title: isZh ? `第四步：回代原方程，求出 $${eliminateVar}$` : `Step 4: Substitute back to find $${eliminateVar}$`,
    desc: isZh
      ? `把 $${otherVar} = ${solvedOtherVal.toTeX()}$ 代入原方程①中：`
      : `Substitute $${otherVar} = ${solvedOtherVal.toTeX()}$ into Equation ①:`,
    mathTeX: `${origCoeffElim.toTeX()}${eliminateVar} + ${origCoeffOther.toTeX()} \\times (${solvedOtherVal.toTeX()}) = ${eq1.c.toTeX()} \\\\[6pt] \\text{${
      isZh ? '解得：' : 'Solving yields: '
    }}\\quad ${eliminateVar} = ${solvedElimVal.toTeX()}`,
    highlightVar: eliminateVar,
    highlightAction: 'solve',
    annotation: isZh
      ? `提示：回代时挑选原方程①或②中系数较小、正数较多的方程，能算得又快又准。`
      : `Strategy: Choose the equation with simpler positive coefficients for back-substitution.`,
  });

  // Step 5: 规范答题
  steps.push({
    title: isZh ? `第五步：规范写出方程组的解` : `Step 5: Conclude the final system solution`,
    desc: isZh ? `联立写出最终结果：` : `State the final solution using standard brace notation:`,
    mathTeX: isZh
      ? `\\therefore \\text{原方程组的解为：}\\quad ${solutionTeX}`
      : `\\therefore \\text{The solution to the system is: }\\quad ${solutionTeX}`,
  });

  return {
    name: isZh ? '加减消元法' : 'Elimination Method',
    methodKey: 'elimination',
    coreIdea: isZh
      ? '两边乘数使得某一未知数系数绝对值相同，利用“同号相减、异号相加”彻底消元。'
      : 'Multiply equations to align the coefficients of one variable, then add or subtract to eliminate it completely.',
    recommended,
    steps,
    solutionTeX,
  };
}
