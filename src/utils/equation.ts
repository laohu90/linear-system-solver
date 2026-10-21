import { Fraction } from './fraction';

export interface EquationStandard {
  a: Fraction;
  b: Fraction;
  c: Fraction;
  rawStr?: string;
}

export type SolutionType = 'unique' | 'none' | 'infinite';

export interface StepExplanation {
  title: string;
  mathTeX?: string;
  desc: string;
  highlightVar?: 'x' | 'y';
  annotation?: string;
}

export interface MethodSolution {
  name: string;
  methodKey: 'substitution' | 'elimination';
  coreIdea: string;
  recommended: boolean;
  steps: StepExplanation[];
  solutionTeX: string;
}

export interface SystemAnalysis {
  type: SolutionType;
  determinant: Fraction;
  typeDescription: string;
  geometricInterpretation: string;
  solution?: {
    x: Fraction;
    y: Fraction;
    xTeX: string;
    yTeX: string;
  };
  substitutionMethod?: MethodSolution;
  eliminationMethod?: MethodSolution;
  verification?: {
    eq1Check: string;
    eq2Check: string;
    isCorrect: boolean;
  };
  line1: {
    slope?: number;
    intercept?: number;
    isVertical: boolean;
    xIntercept?: number;
    texForm: string;
    slopeInterceptTeX: string;
  };
  line2: {
    slope?: number;
    intercept?: number;
    isVertical: boolean;
    xIntercept?: number;
    texForm: string;
    slopeInterceptTeX: string;
  };
}

/**
 * Format a single equation ax + by = c into clean LaTeX
 */
export function formatEquationTeX(a: Fraction, b: Fraction, c: Fraction): string {
  let left = '';

  // x term
  if (!a.isZero()) {
    if (a.isOne()) left += 'x';
    else if (a.isMinusOne()) left += '-x';
    else left += `${a.toTeX()}x`;
  }

  // y term
  if (!b.isZero()) {
    if (left === '') {
      if (b.isOne()) left += 'y';
      else if (b.isMinusOne()) left += '-y';
      else left += `${b.toTeX()}y`;
    } else {
      if (b.isOne()) left += ' + y';
      else if (b.isMinusOne()) left += ' - y';
      else if (b.isPositive()) left += ` + ${b.toTeX()}y`;
      else left += ` - ${b.abs().toTeX()}y`;
    }
  }

  if (left === '') left = '0';
  return `${left} = ${c.toTeX()}`;
}

/**
 * Format the 2-variable system in standard curly brace LaTeX:
 * \begin{cases} a_1 x + b_1 y = c_1 \\ a_2 x + b_2 y = c_2 \end{cases}
 */
export function formatSystemTeX(eq1: EquationStandard, eq2: EquationStandard): string {
  const line1 = formatEquationTeX(eq1.a, eq1.b, eq1.c);
  const line2 = formatEquationTeX(eq2.a, eq2.b, eq2.c);
  return `\\begin{cases} ${line1} & \\text{①} \\\\ ${line2} & \\text{②} \\end{cases}`;
}

/**
 * Parses free-form mathematical string to ax + by = c
 * Supports inputs like:
 * "2x + 3y = 7"
 * "3x - 5y = -1"
 * "2(x - 1) = 3y + 4"
 * "x/2 + y/3 = 5"
 * "x = 2y - 3"
 */
export function parseLinearEquation(input: string): { a: Fraction; b: Fraction; c: Fraction } {
  const cleaned = input.replace(/\s+/g, '').replace(/（/g, '(').replace(/）/g, ')');
  if (!cleaned.includes('=')) {
    throw new Error('方程必须包含等号 "="');
  }

  const [leftSide, rightSide] = cleaned.split('=');

  // Tokenize & expand expressions into polynomial in x and y + constant
  const leftPoly = parseExpression(leftSide);
  const rightPoly = parseExpression(rightSide);

  // Move everything: (leftPoly.a - rightPoly.a)x + (leftPoly.b - rightPoly.b)y = rightPoly.c - leftPoly.c
  const a = leftPoly.a.sub(rightPoly.a);
  const b = leftPoly.b.sub(rightPoly.b);
  const c = rightPoly.c.sub(leftPoly.c);

  if (a.isZero() && b.isZero()) {
    throw new Error('方程至少需要包含一个未知数 x 或 y');
  }

  return { a, b, c };
}

interface Poly {
  a: Fraction; // x coeff
  b: Fraction; // y coeff
  c: Fraction; // const
}

function parseExpression(expr: string): Poly {
  let poly: Poly = { a: new Fraction(0n), b: new Fraction(0n), c: new Fraction(0n) };
  if (!expr) return poly;

  // Handle parentheses by expanding: e.g. 2(x+3) or -(y-1) or (x+1)/2
  // For standard school equations, simple tokenizer regex
  // Let's normalize fractions like (x+1)/2 or x/2 or 3y/4
  // Normalize unary signs at start
  let normalized = expr;

  // Expand simple brackets: k(Ax + By + C) or (Ax + By + C)/d or k(Ax + By + C)/d
  const bracketRegex = /([+-]?\d*(?:\.\d+)?|\b)\(([^()]+)\)(?:\/(\d+(?:\.\d+)?))?/;
  let safety = 20;
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

      const innerPoly = parseExpression(inner);
      const na = innerPoly.a.mul(multiplier);
      const nb = innerPoly.b.mul(multiplier);
      const nc = innerPoly.c.mul(multiplier);

      let res = '';
      if (!na.isZero()) res += `${na.num < 0n ? '' : '+'}${na.toString()}x`;
      if (!nb.isZero()) res += `${nb.num < 0n ? '' : '+'}${nb.toString()}y`;
      if (!nc.isZero()) res += `${nc.num < 0n ? '' : '+'}${nc.toString()}`;
      if (!res) res = '+0';
      return res;
    });
  }

  // Tokenize by + and -
  // Insert + before - if not at start
  const tokenStr = normalized.replace(/([+-])/g, ' $1').trim();
  const tokens = tokenStr.split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    if (!token) continue;
    if (token.includes('x')) {
      const coeffStr = token.replace('x', '');
      let coeff = new Fraction(1n);
      if (coeffStr === '' || coeffStr === '+') coeff = new Fraction(1n);
      else if (coeffStr === '-') coeff = new Fraction(-1n);
      else coeff = Fraction.from(coeffStr);
      poly.a = poly.a.add(coeff);
    } else if (token.includes('y')) {
      const coeffStr = token.replace('y', '');
      let coeff = new Fraction(1n);
      if (coeffStr === '' || coeffStr === '+') coeff = new Fraction(1n);
      else if (coeffStr === '-') coeff = new Fraction(-1n);
      else coeff = Fraction.from(coeffStr);
      poly.b = poly.b.add(coeff);
    } else {
      poly.c = poly.c.add(Fraction.from(token));
    }
  }

  return poly;
}

/**
 * Line analysis for coordinate graph
 */
function getLineProperties(eq: EquationStandard) {
  const { a, b, c } = eq;
  if (b.isZero()) {
    // vertical line: x = c / a
    const xVal = c.div(a);
    return {
      isVertical: true,
      xIntercept: xVal.toNumber(),
      texForm: `x = ${xVal.toTeX()}`,
      slopeInterceptTeX: `x = ${xVal.toTeX()}`,
    };
  }

  // y = (-a/b)x + (c/b)
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
 * Generate full solver analysis with both Substitution and Elimination methods
 */
export function solveLinearSystem(
  eq1: EquationStandard,
  eq2: EquationStandard,
  lang: any = 'en'
): SystemAnalysis {
  const line1 = getLineProperties(eq1);
  const line2 = getLineProperties(eq2);

  const isZh = lang === 'zh';

  // Determinant D = a1 * b2 - a2 * b1
  const D = eq1.a.mul(eq2.b).sub(eq2.a.mul(eq1.b));
  // Dx = c1 * b2 - c2 * b1
  const Dx = eq1.c.mul(eq2.b).sub(eq2.c.mul(eq1.b));
  // Dy = a1 * c2 - a2 * c1
  const Dy = eq1.a.mul(eq2.c).sub(eq2.a.mul(eq1.c));

  if (D.isZero()) {
    if (Dx.isZero() && Dy.isZero()) {
      return {
        type: 'infinite',
        determinant: D,
        typeDescription: isZh ? '无穷多组解（两直线重合）' : 'Infinitely Many Solutions (Coincident Lines)',
        geometricInterpretation: isZh
          ? '两方程的系数与常数项成同一比例 (a₁:a₂ = b₁:b₂ = c₁:c₂)，在平面直角坐标系中表示同一直线，直线上任意一点的坐标都是该方程组的解。'
          : 'The two equations have proportional coefficients and constant terms (a₁:a₂ = b₁:b₂ = c₁:c₂). In the Cartesian coordinate plane, they represent the exact same line; every point on the line is a solution.',
        line1,
        line2,
      };
    } else {
      return {
        type: 'none',
        determinant: D,
        typeDescription: isZh ? '方程组无解（两直线平行无交点）' : 'No Solution (Parallel Lines)',
        geometricInterpretation: isZh
          ? '两方程未知数系数成比例但常数项不成比例 (a₁:a₂ = b₁:b₂ ≠ c₁:c₂)，两直线斜率相同且截距不同，在平面直角坐标系中互相平行，没有公共交点。'
          : 'The variable coefficients are proportional, but the constant terms are not (a₁:a₂ = b₁:b₂ ≠ c₁:c₂). Both lines have identical slopes but different intercepts, so they are parallel and never intersect.',
        line1,
        line2,
      };
    }
  }

  // Unique solution
  const x = Dx.div(D);
  const y = Dy.div(D);

  const solutionTeX = `\\begin{cases} x = ${x.toTeX()} \\\\ y = ${y.toTeX()} \\end{cases}`;

  // Evaluate which method is more recommended
  const hasUnitCoeff =
    eq1.a.abs().isOne() || eq1.b.abs().isOne() || eq2.a.abs().isOne() || eq2.b.abs().isOne();
  const hasAlignedX = eq1.a.abs().equals(eq2.a.abs());
  const hasAlignedY = eq1.b.abs().equals(eq2.b.abs());

  const recommendSub = hasUnitCoeff && !hasAlignedX && !hasAlignedY;

  const substitutionMethod = buildSubstitutionSteps(eq1, eq2, x, y, solutionTeX, recommendSub, lang);
  const eliminationMethod = buildEliminationSteps(eq1, eq2, x, y, solutionTeX, !recommendSub, lang);

  // Verification
  const eq1Left = eq1.a.mul(x).add(eq1.b.mul(y));
  const eq2Left = eq2.a.mul(x).add(eq2.b.mul(y));

  const eq1Check = isZh
    ? `左边 = ${eq1.a.toTeX()} \\times (${x.toTeX()}) + ${eq1.b.toTeX()} \\times (${y.toTeX()}) = ${eq1Left.toTeX()} = 右边`
    : `LHS = ${eq1.a.toTeX()} \\times (${x.toTeX()}) + ${eq1.b.toTeX()} \\times (${y.toTeX()}) = ${eq1Left.toTeX()} = RHS`;

  const eq2Check = isZh
    ? `左边 = ${eq2.a.toTeX()} \\times (${x.toTeX()}) + ${eq2.b.toTeX()} \\times (${y.toTeX()}) = ${eq2Left.toTeX()} = 右边`
    : `LHS = ${eq2.a.toTeX()} \\times (${x.toTeX()}) + ${eq2.b.toTeX()} \\times (${y.toTeX()}) = ${eq2Left.toTeX()} = RHS`;

  return {
    type: 'unique',
    determinant: D,
    typeDescription: isZh ? '有且仅有唯一解（两直线相交于一点）' : 'Unique Solution (Single Intersection Point)',
    geometricInterpretation: isZh
      ? `两直线的斜率不同，在平面直角坐标系中有且只有一个交点，交点坐标为 (${x.toTeX()}, ${y.toTeX()})。`
      : `The lines have different slopes and intersect at exactly one point in the Cartesian coordinate plane at (${x.toTeX()}, ${y.toTeX()}).`,
    solution: {
      x,
      y,
      xTeX: x.toTeX(),
      yTeX: y.toTeX(),
    },
    substitutionMethod,
    eliminationMethod,
    verification: {
      eq1Check,
      eq2Check,
      isCorrect: eq1Left.equals(eq1.c) && eq2Left.equals(eq2.c),
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

  // Pick the best equation & variable to express:
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

  // Form: varName = (c - otherCoeff * otherVar) / coeff
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

  // Step 1: 变形 (由 sourceEq 得出 ③)
  steps.push({
    title: isZh ? `第一步：观察系数，选式变形` : `Step 1: Express one variable in terms of the other`,
    desc: isZh
      ? `观察原方程组中各未知数的系数，方程${sourceEqNum}中未知数 $${best.varName}$ 的系数最易化简。用含 $${best.otherVar}$ 的代数式表示 $${best.varName}$：`
      : `Examine the coefficients. Express variable $${best.varName}$ in terms of $${best.otherVar}$ using Equation ${sourceEqNum}:`,
    mathTeX: isZh
      ? `\\text{由}${sourceEqNum}\\text{，得：}\\quad ${exprTeX} \\quad \\text{③}`
      : `\\text{From }${sourceEqNum}\\text{, we obtain: }\\quad ${exprTeX} \\quad \\text{③}`,
    highlightVar: best.varName,
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
    highlightVar: best.otherVar,
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
  const otherVar = eliminateVar === 'x' ? 'y' : 'x';

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

  steps.push({
    title: isZh ? `第一步：统一系数，消除障碍` : `Step 1: Multiply equations to align coefficients`,
    desc: transformDesc,
    mathTeX: transformMath,
    highlightVar: eliminateVar,
    annotation: isZh
      ? `消元法则口诀：“同号相减，异号相加”；系数符号相同时作差，符号相反时作和。`
      : `Elimination principle: "Same signs subtract, opposite signs add".`,
  });

  // Step 2: 相加或相减消元
  const operation = isOpposite ? '+' : '-';
  const labelLeft = needTransform1 ? '③' : '①';
  const labelRight = needTransform2 ? '④' : '②';

  const otherCoeff3 = eliminateVar === 'x' ? eq3.b : eq3.a;
  const otherCoeff4 = eliminateVar === 'x' ? eq4.b : eq4.a;
  const combOtherCoeff = isOpposite ? otherCoeff3.add(otherCoeff4) : otherCoeff3.sub(otherCoeff4);
  const combConst = isOpposite ? eq3.c.add(eq4.c) : eq3.c.sub(eq4.c);

  const elimStepMath = isZh
    ? `\\text{${labelLeft} ${operation} ${labelRight}，得：}\\quad (${otherCoeff3.toTeX()} ${
        isOpposite ? '+' : '-'
      } (${otherCoeff4.toTeX()}))$${otherVar} = ${eq3.c.toTeX()} ${isOpposite ? '+' : '-'} (${eq4.c.toTeX()})`
    : `\\text{${labelLeft} ${operation} ${labelRight}\\text{ yields: }}\\quad (${otherCoeff3.toTeX()} ${
        isOpposite ? '+' : '-'
      } (${otherCoeff4.toTeX()}))$${otherVar} = ${eq3.c.toTeX()} ${isOpposite ? '+' : '-'} (${eq4.c.toTeX()})`;

  steps.push({
    title: isZh
      ? `第二步：${isOpposite ? '两式相加' : '两式相减'}，消去 $${eliminateVar}$`
      : `Step 2: ${isOpposite ? 'Add equations' : 'Subtract equations'} to eliminate $${eliminateVar}$`,
    desc: isZh
      ? `因为未知数 $${eliminateVar}$ 的系数${isOpposite ? '互为相反数，将两式相加' : '符号相同，将两式相减'}，从而消去 $${eliminateVar}$：`
      : `Because the coefficients of $${eliminateVar}$ are ${
          isOpposite ? 'opposites, add the two equations' : 'identical, subtract the two equations'
        } to eliminate $${eliminateVar}$:`,
    mathTeX: `${elimStepMath} \\\\[6pt] \\implies ${combOtherCoeff.toTeX()}${otherVar} = ${combConst.toTeX()}`,
    highlightVar: otherVar,
    annotation: isZh
      ? `初一易错警示：两式相减时，减式的各项（包括常数项）都必须改变符号！`
      : `Common trap: When subtracting equations, remember to distribute the negative sign to all terms on both sides!`,
  });

  // Step 3: 解出一元一次方程
  const solvedOtherVal = otherVar === 'x' ? xSol : ySol;
  steps.push({
    title: isZh ? `第三步：解一元一次方程，求出 $${otherVar}$` : `Step 3: Solve for $${otherVar}$`,
    desc: isZh
      ? `两边同除以未知数 $${otherVar}$ 的系数 ${combOtherCoeff.toTeX()}：`
      : `Divide both sides by the coefficient ${combOtherCoeff.toTeX()}:`,
    mathTeX: `${otherVar} = \\frac{${combConst.toTeX()}}{${combOtherCoeff.toTeX()}} = ${solvedOtherVal.toTeX()}`,
    highlightVar: otherVar,
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
    annotation: isZh
      ? `提示：回代时挑选原方程①或②中系数较小、正数较多的方程，能算得又快又准。`
      : `Strategy: Choose the equation with simpler positive coefficients for back-substitution.`,
  });

  // Step 5: 规范答题
  steps.push({
    title: isZh ? `第五步：写出方程组的解` : `Step 5: Conclude the final system solution`,
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
