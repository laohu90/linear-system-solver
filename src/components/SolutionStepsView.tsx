import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Check,
  Eye,
  SlidersHorizontal,
  HelpCircle,
  Hash,
  Layers,
  Scale,
} from 'lucide-react';
import { MathView } from './MathView';
import { SystemAnalysis, MethodSolution } from '../utils/equation';
import { Language, translations } from '../i18n/translations';

interface SolutionStepsViewProps {
  analysis: SystemAnalysis;
  activeMethod: 'substitution' | 'elimination' | 'gaussian';
  onMethodChange: (method: 'substitution' | 'elimination' | 'gaussian') => void;
  lang?: Language;
}

export const SolutionStepsView: React.FC<SolutionStepsViewProps> = ({
  analysis,
  activeMethod,
  onMethodChange,
  lang = 'en',
}) => {
  const t = translations[lang];
  const isZh = lang === 'zh';
  const is2x2 = analysis.dim === 2;

  const [revealMode, setRevealMode] = useState<'all' | 'stepByStep'>('all');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Pick current solution method
  let currentSolution: MethodSolution | undefined = undefined;
  if (activeMethod === 'substitution') {
    currentSolution = analysis.substitutionMethod || analysis.gaussianMethod;
  } else if (activeMethod === 'elimination') {
    currentSolution = analysis.eliminationMethod || analysis.gaussianMethod;
  } else {
    currentSolution = analysis.gaussianMethod;
  }

  const totalSteps = currentSolution?.steps.length || 0;

  const handleCopyHomework = () => {
    if (!currentSolution) return;
    const plainTextSteps = currentSolution.steps
      .map(
        (s, idx) =>
          `${idx + 1}. ${s.title}\n   ${s.desc}\n   ${
            s.annotation ? (isZh ? '【提示】' : '[Tip] ') + s.annotation : ''
          }`
      )
      .join('\n\n');

    const header = isZh
      ? `【${analysis.dim}元一次方程组规范解题过程 - ${currentSolution.name}】`
      : `[System of ${analysis.dim} Linear Equations Solution - ${currentSolution.name}]`;

    const principle = isZh
      ? `核心思想：${currentSolution.coreIdea}`
      : `Core Principle: ${currentSolution.coreIdea}`;

    const solStr =
      analysis.solution?.vars.map((v) => `${v.name} = ${v.value.toString()}`).join(', ') ||
      (analysis.type === 'none' ? '无解' : '无穷多解');

    const conclusion = isZh
      ? `方程组最终解：${solStr}`
      : `Final System Solution: ${solStr}`;

    const fullText = `${header}\n\n${principle}\n\n${plainTextSteps}\n\n${conclusion}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const matrix = analysis.matrixAnalysis;

  return (
    <div className="space-y-6">
      {/* 1. Value-Multiplier: Matrix, Determinant & Rank Analysis Card (POINT 5) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{t.matrixAnalysisTitle}</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  {analysis.dim} × {analysis.dim}
                </span>
              </h3>
              <p className="text-xs text-slate-500">{t.matrixRankTitle}</p>
            </div>
          </div>

          {/* Rouché-Capelli Badge */}
          <div
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              analysis.type === 'unique'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : analysis.type === 'none'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{analysis.typeDescription}</span>
          </div>
        </div>

        {/* Matrix Rank Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* rank(A) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block mb-1 font-medium">{t.rankA}</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-slate-900">{matrix.rankA}</span>
              <span className="text-[11px] text-slate-400">/ {analysis.dim}</span>
            </div>
          </div>

          {/* rank([A|b]) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block mb-1 font-medium">{t.rankAug}</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-slate-900">{matrix.rankAug}</span>
              <span className="text-[11px] text-slate-400">/ {analysis.dim}</span>
            </div>
          </div>

          {/* det(A) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block mb-1 font-medium">{t.detTitle}</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-indigo-700">
                {matrix.detA.toTeX()}
              </span>
              <span className="text-[11px] text-slate-500">
                {matrix.detA.isZero() ? (isZh ? '(奇异矩阵)' : '(Singular)') : (isZh ? '(满秩非奇异)' : '(Full Rank)')}
              </span>
            </div>
          </div>
        </div>

        {/* Cramer's Rule Determinants (for 2x2 and 3x3) */}
        {matrix.cramerDets && matrix.cramerDets.length > 0 && (
          <div className="mt-3 p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-lg space-y-2 text-xs">
            <div className="font-semibold text-indigo-950 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.cramerTitle}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 py-1 text-slate-800">
              {matrix.cramerDets.map((cd, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-white border border-indigo-100 rounded-md font-mono text-xs flex items-center gap-2 shadow-2xs"
                >
                  <span className="font-bold text-indigo-700">{cd.symbol}:</span>
                  <MathView math={cd.value.toTeX()} />
                </div>
              ))}
            </div>

            {/* Cramer's formula quotient */}
            {!matrix.detA.isZero() && (
              <div className="text-[11px] text-indigo-900 pt-1 border-t border-indigo-100 flex flex-wrap items-center gap-4">
                <span className="font-medium">
                  {isZh ? '克莱姆法则代数解：' : "Cramer's Rule Formula: "}
                </span>
                {matrix.cramerDets.map((cd, idx) => {
                  const quotient = cd.value.div(matrix.detA);
                  return (
                    <span key={idx} className="font-mono">
                      <MathView
                        math={`${cd.varName} = \\frac{${cd.symbol}}{D} = \\frac{${cd.value.toTeX()}}{${matrix.detA.toTeX()}} = ${quotient.toTeX()}`}
                      />
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Rouché-Capelli Explanation */}
        <div className="mt-3 p-3 bg-slate-50/90 border border-slate-200/80 rounded-lg text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900 mr-1.5">💡 {t.roucheCapelliTitle}：</span>
          <span>{matrix.roucheCapelliExplanation}</span>
        </div>
      </div>

      {/* 2. Step-by-Step Pedagogical Walkthrough Stage */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Method Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Elimination Tab (2x2) */}
            {is2x2 && analysis.eliminationMethod && (
              <button
                onClick={() => {
                  onMethodChange('elimination');
                  setCurrentStepIndex(0);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeMethod === 'elimination'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{t.methodElim}</span>
                {analysis.eliminationMethod?.recommended && (
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-amber-400 text-amber-950">
                    {t.tagRecommended}
                  </span>
                )}
              </button>
            )}

            {/* Substitution Tab (2x2) */}
            {is2x2 && analysis.substitutionMethod && (
              <button
                onClick={() => {
                  onMethodChange('substitution');
                  setCurrentStepIndex(0);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeMethod === 'substitution'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{t.methodSub}</span>
                {analysis.substitutionMethod?.recommended && (
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-amber-400 text-amber-950">
                    {t.tagRecommended}
                  </span>
                )}
              </button>
            )}

            {/* Gaussian Elimination Tab (General n×n) */}
            <button
              onClick={() => {
                onMethodChange('gaussian');
                setCurrentStepIndex(0);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeMethod === 'gaussian'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{t.methodGaussian}</span>
              {analysis.dim > 2 && (
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-amber-400 text-amber-950">
                  {t.tagRecommended}
                </span>
              )}
            </button>
          </div>

          {/* Display Mode & Copy Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Step reveal toggler */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setRevealMode('all')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  revealMode === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.viewAll}</span>
              </button>
              <button
                onClick={() => {
                  setRevealMode('stepByStep');
                  setCurrentStepIndex(0);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  revealMode === 'stepByStep'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t.viewStepByStep}</span>
              </button>
            </div>

            <button
              onClick={handleCopyHomework}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs"
              title={t.copyHomework}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copied : t.copyHomework}</span>
            </button>
          </div>
        </div>

        {/* Core Principle / Insight Card */}
        {currentSolution && (
          <div className="mx-5 my-4 p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold">{t.coreIdeaTitle}</span> {currentSolution.coreIdea}
            </div>
          </div>
        )}

        {/* Step-by-Step Content List */}
        <div className="px-5 pb-6 space-y-5">
          {currentSolution?.steps.map((step, idx) => {
            if (revealMode === 'stepByStep' && idx > currentStepIndex) {
              return null;
            }

            const isCurrentActive = revealMode === 'stepByStep' && idx === currentStepIndex;

            // FIXED (POINT 3): Correct action label matching eliminate vs solve
            let actionPrefix = t.actionEliminate;
            if (step.highlightAction === 'solve') {
              actionPrefix = t.actionSolve;
            } else if (step.highlightAction === 'substitute') {
              actionPrefix = t.actionSubstitute;
            } else if (step.highlightAction === 'pivot') {
              actionPrefix = t.actionPivot;
            }

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrentActive
                    ? 'bg-blue-50/30 border-blue-200 ring-2 ring-blue-500/10'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Step Title Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                  </div>

                  {/* Fixed Variable Badge (POINT 3) */}
                  {step.highlightVar && (
                    <span className="text-[11px] font-medium text-slate-500">
                      <span>{actionPrefix}</span>
                      <strong className="text-blue-700">{step.highlightVar}</strong>
                    </span>
                  )}
                </div>

                {/* Step Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{step.desc}</p>

                {/* Step Math Formula */}
                {step.mathTeX && (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg my-2 text-center text-sm font-medium overflow-x-auto">
                    <MathView math={step.mathTeX} block />
                  </div>
                )}

                {/* Annotation */}
                {step.annotation && (
                  <div className="mt-2.5 text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-md px-3 py-1.5 flex items-start gap-1.5">
                    <span className="font-semibold shrink-0">💡 {isZh ? '考点警示：' : 'Note: '}</span>
                    <span>{step.annotation}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Step-by-Step Navigation Bar */}
          {revealMode === 'stepByStep' && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.btnPrev}</span>
              </button>

              <span className="text-xs text-slate-500 font-medium">
                {t.stepOf} {currentStepIndex + 1} / {totalSteps}
              </span>

              {currentStepIndex < totalSteps - 1 ? (
                <button
                  onClick={() => setCurrentStepIndex((i) => Math.min(totalSteps - 1, i + 1))}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
                >
                  <span>{t.btnNext}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.drillComplete}</span>
                </div>
              )}
            </div>
          )}

          {/* Final Solution Callout Box */}
          {analysis.solution && (
            <div className="mt-6 p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-900">{t.finalSolutionTitle}</span>
              </div>
              <div className="p-3 bg-white border border-emerald-200/80 rounded-lg flex flex-col md:flex-row md:items-center justify-around gap-4 text-slate-900">
                <div className="overflow-x-auto py-1">
                  <MathView
                    math={`\\begin{cases} ${analysis.solution.vars
                      .map((v) => `${v.name} = ${v.tex}`)
                      .join(' \\\\ ')} \\end{cases}`}
                  />
                </div>
                <div className="text-xs text-slate-500 md:border-l md:border-slate-200 md:pl-4 space-y-1">
                  <div>
                    {t.pointCoord}: P(
                    {analysis.solution.vars.map((v) => v.value.toString()).join(', ')})
                  </div>
                  {analysis.solution.vars.every((v) => v.value.isInteger()) ? (
                    <div className="text-emerald-700 font-medium">{t.integerSolution}</div>
                  ) : (
                    <div className="text-blue-700 font-medium">{t.fractionSolution}</div>
                  )}
                </div>
              </div>

              {/* Check/Verification Box */}
              {analysis.verification && (
                <div className="mt-3 pt-3 border-t border-emerald-200/60 text-[11px] text-emerald-950">
                  <div className="font-semibold mb-1">{t.verificationTitle}</div>
                  <div className="space-y-1 text-slate-700 font-mono text-[10px]">
                    {analysis.verification.eqChecks.map((ck, i) => (
                      <div key={i}>
                        <MathView math={ck.checkTeX} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 text-emerald-700 font-medium">{t.verificationSuccess}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
