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
} from 'lucide-react';
import { MathView } from './MathView';
import { SystemAnalysis, MethodSolution } from '../utils/equation';

interface SolutionStepsViewProps {
  analysis: SystemAnalysis;
  activeMethod: 'substitution' | 'elimination';
  onMethodChange: (method: 'substitution' | 'elimination') => void;
}

export const SolutionStepsView: React.FC<SolutionStepsViewProps> = ({
  analysis,
  activeMethod,
  onMethodChange,
}) => {
  // Step-by-step reveal mode: either reveal all or reveal up to currentStep
  const [revealMode, setRevealMode] = useState<'all' | 'stepByStep'>('all');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Selected method solution
  const currentSolution: MethodSolution | undefined =
    activeMethod === 'substitution' ? analysis.substitutionMethod : analysis.eliminationMethod;

  const totalSteps = currentSolution?.steps.length || 0;

  // Handle copy formatted solution for homework
  const handleCopyHomework = () => {
    if (!currentSolution) return;
    const plainTextSteps = currentSolution.steps
      .map((s, idx) => `${idx + 1}. ${s.title}\n   ${s.desc}\n   ${s.annotation ? '【提示】' + s.annotation : ''}`)
      .join('\n\n');

    const fullText = `【二元一次方程组规范解题过程 - ${currentSolution.name}】\n\n核心思想：${
      currentSolution.coreIdea
    }\n\n${plainTextSteps}\n\n方程组最终解：x = ${analysis.solution?.x.toString()}, y = ${analysis.solution?.y.toString()}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // If system has no unique solution (parallel or coincident)
  if (analysis.type !== 'unique') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              analysis.type === 'none' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">{analysis.typeDescription}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{analysis.geometricInterpretation}</p>
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-2">
              <div className="font-semibold text-slate-900">初中数学判断规律速记：</div>
              <div className="py-1">
                <MathView math="\begin{cases} a_1x + b_1y = c_1 \\ a_2x + b_2y = c_2 \end{cases}" />
              </div>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-600">
                <li>
                  若 a₁/a₂ ≠ b₁/b₂，两直线相交，方程组有且只有<strong>唯一解</strong>。
                </li>
                <li>
                  若 a₁/a₂ = b₁/b₂ ≠ c₁/c₂，两直线平行，方程组<strong>无解</strong>。
                </li>
                <li>
                  若 a₁/a₂ = b₁/b₂ = c₁/c₂，两直线重合，方程组有<strong>无数个解</strong>。
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Method Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          {/* Substitution Tab */}
          <button
            onClick={() => {
              onMethodChange('substitution');
              setCurrentStepIndex(0);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeMethod === 'substitution'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>代入消元法</span>
            {analysis.substitutionMethod?.recommended && (
              <span className="text-[11px] font-normal px-1.5 py-0.2 rounded bg-amber-400 text-amber-950">
                推荐
              </span>
            )}
          </button>

          {/* Elimination Tab */}
          <button
            onClick={() => {
              onMethodChange('elimination');
              setCurrentStepIndex(0);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeMethod === 'elimination'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>加减消元法</span>
            {analysis.eliminationMethod?.recommended && (
              <span className="text-[11px] font-normal px-1.5 py-0.2 rounded bg-amber-400 text-amber-950">
                推荐
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
                revealMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>全文展开</span>
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
              <span>逐步演示</span>
            </button>
          </div>

          <button
            onClick={handleCopyHomework}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs"
            title="复制规范作业步骤"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制规范格式' : '复制规范作业'}</span>
          </button>
        </div>
      </div>

      {/* Core Principle / Insight Card */}
      {currentSolution && (
        <div className="mx-5 my-4 p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">初一核心思想【消元】：</span>
            {currentSolution.coreIdea}
          </div>
        </div>
      )}

      {/* Step by Step Content */}
      <div className="px-5 pb-6 space-y-6">
        {currentSolution?.steps.map((step, idx) => {
          // If in step-by-step mode and this step is beyond currentStepIndex, hide it
          if (revealMode === 'stepByStep' && idx > currentStepIndex) {
            return null;
          }

          const isCurrentActive = revealMode === 'stepByStep' && idx === currentStepIndex;

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
                {step.highlightVar && (
                  <span className="text-[11px] font-medium text-slate-500">
                    消去未知数：<strong className="text-blue-700">{step.highlightVar}</strong>
                  </span>
                )}
              </div>

              {/* Step Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-3">{step.desc}</p>

              {/* Step Math Formula */}
              {step.mathTeX && (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg my-2 text-center text-sm font-medium">
                  <MathView math={step.mathTeX} block />
                </div>
              )}

              {/* Annotation / Pedagogical Tip */}
              {step.annotation && (
                <div className="mt-2.5 text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-md px-3 py-1.5 flex items-start gap-1.5">
                  <span className="font-semibold shrink-0">💡 考点警示：</span>
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
              <span>上一步</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              第 {currentStepIndex + 1} / {totalSteps} 步
            </span>

            {currentStepIndex < totalSteps - 1 ? (
              <button
                onClick={() => setCurrentStepIndex((i) => Math.min(totalSteps - 1, i + 1))}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
              >
                <span>下一步</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>演练完成</span>
              </div>
            )}
          </div>
        )}

        {/* Final Solution Callout Box */}
        {analysis.solution && (
          <div className="mt-6 p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-900">最终规范解集（中考标准规范书写）：</span>
            </div>
            <div className="p-3 bg-white border border-emerald-200/80 rounded-lg flex items-center justify-around text-slate-900">
              <MathView math={`\\begin{cases} x = ${analysis.solution.xTeX} \\\\ y = ${analysis.solution.yTeX} \\end{cases}`} />
              <div className="text-xs text-slate-500 border-l border-slate-200 pl-4 space-y-1">
                <div>
                  对应点坐标：P({analysis.solution.x.toString()}, {analysis.solution.y.toString()})
                </div>
                {analysis.solution.x.isInteger() && analysis.solution.y.isInteger() ? (
                  <div className="text-emerald-700 font-medium">✓ 整数解（初一常规题）</div>
                ) : (
                  <div className="text-blue-700 font-medium">✓ 分数既约精确解</div>
                )}
              </div>
            </div>

            {/* Check/Verification Box */}
            {analysis.verification && (
              <div className="mt-3 pt-3 border-t border-emerald-200/60 text-[11px] text-emerald-950">
                <div className="font-semibold mb-1">【验算】将求得的解代入原方程检验：</div>
                <div className="space-y-0.5 text-slate-700 font-mono text-[10px]">
                  <div>① <MathView math={analysis.verification.eq1Check} /></div>
                  <div>② <MathView math={analysis.verification.eq2Check} /></div>
                </div>
                <div className="mt-1 text-emerald-700 font-medium">左右两边均相等，所求结果真实无误！</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
