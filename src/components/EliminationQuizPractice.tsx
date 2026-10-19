import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, RefreshCw, HelpCircle, ArrowRight } from 'lucide-react';
import { MathView } from './MathView';
import { EquationStandard, solveLinearSystem, formatEquationTeX } from '../utils/equation';
import { Fraction } from '../utils/fraction';
import { Language, translations } from '../i18n/translations';

interface EliminationQuizPracticeProps {
  onLoadProblem: (eq1: EquationStandard, eq2: EquationStandard) => void;
  lang?: Language;
}

interface PracticeProblem {
  id: string;
  name: string;
  nameEn: string;
  eq1: EquationStandard;
  eq2: EquationStandard;
  bestVar: 'x' | 'y';
  bestMethod: 'substitution' | 'elimination';
  subTransformHint: string;
  subTransformHintEn: string;
  xAns: string;
  yAns: string;
}

const QUIZ_BANK: PracticeProblem[] = [
  {
    id: 'q1',
    name: '基础题：加减消元相反数秒杀',
    nameEn: 'Basic: Elimination with Opposite Coefficients',
    eq1: { a: new Fraction(2n), b: new Fraction(3n), c: new Fraction(13n) },
    eq2: { a: new Fraction(4n), b: new Fraction(-3n), c: new Fraction(5n) },
    bestVar: 'y',
    bestMethod: 'elimination',
    subTransformHint: '观察 y 的系数为 +3 与 -3，互为相反数，两式相加 ① + ② 即可秒杀消去 y！',
    subTransformHintEn: 'Notice the coefficients of y are +3 and -3 (opposites). Adding Equations ① + ② eliminates y directly!',
    xAns: '3',
    yAns: '7/3',
  },
  {
    id: 'q2',
    name: '基础题：代入法含系数1的方程',
    nameEn: 'Basic: Substitution with Coefficient 1',
    eq1: { a: new Fraction(1n), b: new Fraction(-2n), c: new Fraction(1n) },
    eq2: { a: new Fraction(3n), b: new Fraction(4n), c: new Fraction(13n) },
    bestVar: 'x',
    bestMethod: 'substitution',
    subTransformHint: '方程①中 x 的系数为 1，变形得 x = 2y + 1 再代入②中最为简便！',
    subTransformHintEn: 'In Equation ①, x has coefficient 1. Isolate x = 2y + 1 and substitute into ② for a seamless solution.',
    xAns: '3',
    yAns: '1',
  },
  {
    id: 'q3',
    name: '提高题：乘倍数对齐系数',
    nameEn: 'Intermediate: Multiply to Align Coefficients',
    eq1: { a: new Fraction(3n), b: new Fraction(2n), c: new Fraction(12n) },
    eq2: { a: new Fraction(2n), b: new Fraction(3n), c: new Fraction(13n) },
    bestVar: 'x',
    bestMethod: 'elimination',
    subTransformHint: '消去 x 时，①×2 且 ②×3，使 x 系数均为 6，再两式相减即可。',
    subTransformHintEn: 'To eliminate x, multiply ① by 2 and ② by 3 to get 6x in both equations, then subtract.',
    xAns: '2',
    yAns: '3',
  },
];

export const EliminationQuizPractice: React.FC<EliminationQuizPracticeProps> = ({
  onLoadProblem,
  lang = 'en',
}) => {
  const t = translations[lang];
  const isZh = lang === 'zh';

  const [problemIndex, setProblemIndex] = useState(0);
  const currentProblem = QUIZ_BANK[problemIndex];

  // User input states
  const [chosenVar, setChosenVar] = useState<'x' | 'y' | null>(null);
  const [chosenMethod, setChosenMethod] = useState<'substitution' | 'elimination' | null>(null);
  const [userX, setUserX] = useState('');
  const [userY, setUserY] = useState('');

  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'success' | 'partial' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const [showHint, setShowHint] = useState(false);

  const resetQuiz = (index: number) => {
    setProblemIndex(index);
    setChosenVar(null);
    setChosenMethod(null);
    setUserX('');
    setUserY('');
    setFeedback({ status: 'idle', message: '' });
    setShowHint(false);
  };

  const handleCheck = () => {
    if (!userX.trim() || !userY.trim()) {
      setFeedback({
        status: 'error',
        message: t.quizEmptyWarning,
      });
      return;
    }

    const analysis = solveLinearSystem(currentProblem.eq1, currentProblem.eq2, lang);
    if (!analysis.solution) return;

    const realX = analysis.solution.x;
    const realY = analysis.solution.y;

    let inputXFrac: Fraction | null = null;
    let inputYFrac: Fraction | null = null;

    try {
      inputXFrac = Fraction.from(userX.trim());
    } catch {
      // not parsed
    }

    try {
      inputYFrac = Fraction.from(userY.trim());
    } catch {
      // not parsed
    }

    const xCorrect = inputXFrac ? inputXFrac.equals(realX) : false;
    const yCorrect = inputYFrac ? inputYFrac.equals(realY) : false;

    if (xCorrect && yCorrect) {
      setFeedback({
        status: 'success',
        message: t.quizSuccessMsg,
      });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else if (xCorrect || yCorrect) {
      setFeedback({
        status: 'partial',
        message: t.quizPartialMsg,
      });
    } else {
      setFeedback({
        status: 'error',
        message: t.quizErrorMsg,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.quizTitle}</h3>
            <p className="text-xs text-slate-500">{t.quizSubtitle}</p>
          </div>
        </div>

        {/* Change Question */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => resetQuiz((problemIndex + 1) % QUIZ_BANK.length)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.quizNext}</span>
          </button>
          <button
            onClick={() => onLoadProblem(currentProblem.eq1, currentProblem.eq2)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <span>{t.quizLoadToSolver}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Current Question Math */}
      <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
        <div className="text-xs font-semibold text-slate-500 mb-2">
          {isZh ? currentProblem.name : currentProblem.nameEn}
        </div>
        <MathView
          math={`\\begin{cases} ${formatEquationTeX(
            currentProblem.eq1.a,
            currentProblem.eq1.b,
            currentProblem.eq1.c
          )} & \\text{①} \\\\[4pt] ${formatEquationTeX(
            currentProblem.eq2.a,
            currentProblem.eq2.b,
            currentProblem.eq2.c
          )} & \\text{②} \\end{cases}`}
          block
        />
      </div>

      {/* Interactive Step-by-Step Questioning */}
      <div className="space-y-4 text-xs">
        {/* Step 1: Choose Variable */}
        <div className="p-3 bg-slate-50/50 border border-slate-200/70 rounded-lg">
          <div className="font-semibold text-slate-800 mb-2">{t.quizStep1}</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChosenVar('x')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                chosenVar === 'x'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.quizElimX}
            </button>
            <button
              onClick={() => setChosenVar('y')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                chosenVar === 'y'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.quizElimY}
            </button>
            {chosenVar && (
              <span className="text-slate-500">
                {chosenVar === currentProblem.bestVar
                  ? isZh
                    ? '✨ 极佳决策！'
                    : '✨ Excellent choice!'
                  : isZh
                  ? '可行，计算时注意通分'
                  : 'Valid approach; watch your fractions'}
              </span>
            )}
          </div>
        </div>

        {/* Step 2: Choose Method */}
        <div className="p-3 bg-slate-50/50 border border-slate-200/70 rounded-lg">
          <div className="font-semibold text-slate-800 mb-2">{t.quizStep2}</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChosenMethod('substitution')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                chosenMethod === 'substitution'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.methodSub}
            </button>
            <button
              onClick={() => setChosenMethod('elimination')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                chosenMethod === 'elimination'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.methodElim}
            </button>
            {chosenMethod && (
              <span className="text-slate-500">
                {chosenMethod === currentProblem.bestMethod
                  ? isZh
                    ? '👍 推荐方法'
                    : '👍 Optimal method'
                  : isZh
                  ? '也可以顺利解出'
                  : 'Also works smoothly'}
              </span>
            )}
          </div>
        </div>

        {/* Step 3: Enter Solutions */}
        <div className="p-3 bg-slate-50/50 border border-slate-200/70 rounded-lg">
          <div className="font-semibold text-slate-800 mb-2">{t.quizStep3}</div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-700">x =</span>
              <input
                type="text"
                value={userX}
                onChange={(e) => setUserX(e.target.value)}
                placeholder={isZh ? '例如: 3' : 'e.g. 3'}
                className="w-24 px-2.5 py-1.5 text-center font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-700">y =</span>
              <input
                type="text"
                value={userY}
                onChange={(e) => setUserY(e.target.value)}
                placeholder={isZh ? '例如: 7/3' : 'e.g. 7/3'}
                className="w-24 px-2.5 py-1.5 text-center font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={handleCheck}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              {t.quizSubmit}
            </button>
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-xs text-amber-700 hover:underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? t.quizHideHint : t.quizHint}</span>
            </button>
          </div>
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 leading-relaxed">
            <div className="font-semibold mb-1">💡 {t.quizHintTitle}</div>
            <p>{isZh ? currentProblem.subTransformHint : currentProblem.subTransformHintEn}</p>
          </div>
        )}

        {/* Feedback message */}
        {feedback.status !== 'idle' && (
          <div
            className={`p-3 rounded-lg border flex items-center gap-2 ${
              feedback.status === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : feedback.status === 'partial'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {feedback.status === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <HelpCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
