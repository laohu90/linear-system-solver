import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  BookOpen,
  AlertCircle,
  Edit3,
  Grid,
  Plus,
  Trash2,
} from 'lucide-react';
import { MathView } from './MathView';
import {
  EquationGeneral,
  parseLinearEquation,
  formatGeneralSystemTeX,
  getDefaultVarNames,
} from '../utils/equation';
import { Fraction } from '../utils/fraction';
import { Language, translations } from '../i18n/translations';

interface EquationInputPanelProps {
  equations: EquationGeneral[];
  varNames: string[];
  onUpdate: (equations: EquationGeneral[], varNames: string[]) => void;
  onAddEquation: () => void;
  onRemoveEquation: () => void;
  onOpenPresets: () => void;
  lang?: Language;
}

export const EquationInputPanel: React.FC<EquationInputPanelProps> = ({
  equations,
  varNames,
  onUpdate,
  onAddEquation,
  onRemoveEquation,
  onOpenPresets,
  lang = 'en',
}) => {
  const t = translations[lang];
  const isZh = lang === 'zh';
  const n = equations.length;

  const [mode, setMode] = useState<'standard' | 'freeform'>('standard');

  // Local state for standard inputs
  const [coeffStrings, setCoeffStrings] = useState<string[][]>(() =>
    equations.map((eq) => eq.coeffs.map((c) => c.toString()))
  );
  const [constStrings, setConstStrings] = useState<string[]>(() =>
    equations.map((eq) => eq.c.toString())
  );

  // Local state for freeform inputs
  const [freeStrings, setFreeStrings] = useState<string[]>(() =>
    equations.map((eq) => eq.rawStr || formatSyntheticEquation(eq.coeffs, eq.c, varNames))
  );

  const [inputError, setInputError] = useState<string | null>(null);

  function formatSyntheticEquation(coeffs: Fraction[], c: Fraction, vNames: string[]): string {
    const parts = coeffs.map((cf, idx) => {
      const v = vNames[idx] || `x${idx + 1}`;
      const str = cf.toString();
      if (str === '1') return v;
      if (str === '-1') return `-${v}`;
      return `${str}${v}`;
    });
    return `${parts.join(' + ').replace(/\+ -/g, '- ')} = ${c.toString()}`;
  }

  // Synchronize when external equations change
  useEffect(() => {
    setCoeffStrings(equations.map((eq) => eq.coeffs.map((c) => c.toString())));
    setConstStrings(equations.map((eq) => eq.c.toString()));
    setFreeStrings(
      equations.map((eq) => eq.rawStr || formatSyntheticEquation(eq.coeffs, eq.c, varNames))
    );
    setInputError(null);
  }, [equations, varNames]);

  const commitStandard = (nextCoeffs: string[][], nextConsts: string[]) => {
    try {
      const parsedEquations: EquationGeneral[] = [];

      for (let i = 0; i < n; i++) {
        const rowFracs: Fraction[] = [];
        let allZero = true;

        for (let j = 0; j < n; j++) {
          const valStr = nextCoeffs[i]?.[j]?.trim() || '0';
          const frac = Fraction.from(valStr);
          if (!frac.isZero()) allZero = false;
          rowFracs.push(frac);
        }

        if (allZero) {
          // Localized error message (Task 2)
          setInputError(t.errorCoeffsAllZero.replace('{n}', String(i + 1)));
          return;
        }

        const cFrac = Fraction.from(nextConsts[i]?.trim() || '0');
        parsedEquations.push({
          coeffs: rowFracs,
          c: cFrac,
        });
      }

      setInputError(null);
      onUpdate(parsedEquations, varNames);
    } catch (e: any) {
      setInputError(e?.message || t.errorInvalidNumberInput);
    }
  };

  const commitFreeform = (strings: string[]) => {
    try {
      const parsedEquations: EquationGeneral[] = [];

      for (let i = 0; i < strings.length; i++) {
        const str = strings[i];
        const res = parseLinearEquation(str, varNames, lang);
        parsedEquations.push({
          coeffs: res.coeffs,
          c: res.c,
          rawStr: str,
        });
      }

      setInputError(null);
      onUpdate(parsedEquations, varNames);
    } catch (e: any) {
      setInputError(e?.message || t.errorParsingGeneric);
    }
  };

  const handleSwapFirstTwo = () => {
    if (equations.length < 2) return;
    const newEqs = [...equations];
    const temp = newEqs[0];
    newEqs[0] = newEqs[1];
    newEqs[1] = temp;
    onUpdate(newEqs, varNames);
  };

  const handleReset = () => {
    if (n === 2) {
      const defaultEqs: EquationGeneral[] = [
        { coeffs: [new Fraction(2n), new Fraction(3n)], c: new Fraction(7n), rawStr: '2x + 3y = 7' },
        { coeffs: [new Fraction(3n), new Fraction(-2n)], c: new Fraction(4n), rawStr: '3x - 2y = 4' },
      ];
      onUpdate(defaultEqs, ['x', 'y']);
    } else if (n === 3) {
      const defaultEqs: EquationGeneral[] = [
        { coeffs: [new Fraction(1n), new Fraction(1n), new Fraction(1n)], c: new Fraction(6n), rawStr: 'x + y + z = 6' },
        { coeffs: [new Fraction(2n), new Fraction(1n), new Fraction(-1n)], c: new Fraction(1n), rawStr: '2x + y - z = 1' },
        { coeffs: [new Fraction(1n), new Fraction(-1n), new Fraction(2n)], c: new Fraction(5n), rawStr: 'x - y + 2z = 5' },
      ];
      onUpdate(defaultEqs, ['x', 'y', 'z']);
    } else if (n === 4) {
      const defaultEqs: EquationGeneral[] = [
        { coeffs: [new Fraction(1n), new Fraction(1n), new Fraction(1n), new Fraction(1n)], c: new Fraction(10n), rawStr: 'x + y + z + w = 10' },
        { coeffs: [new Fraction(2n), new Fraction(-1n), new Fraction(1n), new Fraction(3n)], c: new Fraction(14n), rawStr: '2x - y + z + 3w = 14' },
        { coeffs: [new Fraction(1n), new Fraction(2n), new Fraction(-1n), new Fraction(1n)], c: new Fraction(6n), rawStr: 'x + 2y - z + w = 6' },
        { coeffs: [new Fraction(3n), new Fraction(1n), new Fraction(2n), new Fraction(-1n)], c: new Fraction(11n), rawStr: '3x + y + 2z - w = 11' },
      ];
      onUpdate(defaultEqs, ['x', 'y', 'z', 'w']);
    } else {
      const defaultEqs: EquationGeneral[] = Array.from({ length: n }, (_, i) => ({
        coeffs: Array.from({ length: n }, (_, j) => new Fraction(i === j ? 1n : 0n)),
        c: new Fraction(BigInt(i + 1)),
      }));
      onUpdate(defaultEqs, getDefaultVarNames(n));
    }
  };

  const handleGenerateRandom = () => {
    const targetSol = Array.from({ length: n }, () => Math.floor(Math.random() * 7) - 3);
    const coeffsPool = [-3, -2, -1, 1, 2, 3, 4];

    const newEqs: EquationGeneral[] = [];
    for (let i = 0; i < n; i++) {
      const rowCoeffs: Fraction[] = [];
      let rowConst = 0;

      for (let j = 0; j < n; j++) {
        let cVal = coeffsPool[Math.floor(Math.random() * coeffsPool.length)];
        if (i === j && cVal === 0) cVal = 1;
        rowCoeffs.push(new Fraction(BigInt(cVal)));
        rowConst += cVal * targetSol[j];
      }

      newEqs.push({
        coeffs: rowCoeffs,
        c: new Fraction(BigInt(rowConst)),
      });
    }

    onUpdate(newEqs, varNames);
  };

  const circleLabels = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

  // Column styling per variable for clear visual mapping (Task 1)
  const varColorBadges = [
    { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-600', border: 'border-blue-400' },
    { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-600', border: 'border-amber-400' },
    { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600', border: 'border-emerald-400' },
    { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-600', border: 'border-purple-400' },
    { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-600', border: 'border-cyan-400' },
    { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-600', border: 'border-rose-400' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header and Dimension / Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{t.inputTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {n} × {n}
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.inputHint}</p>
        </div>

        {/* Action Controls: Add Equation & Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Equation Button */}
          <button
            onClick={onAddEquation}
            disabled={n >= 6}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
            title={t.btnAddEquation}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.btnAddEquation}</span>
          </button>

          {/* Remove Equation Button */}
          {n > 2 && (
            <button
              onClick={onRemoveEquation}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              title={t.btnRemoveEquation}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.btnRemoveEquation}</span>
            </button>
          )}

          {/* Standard / Freeform Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setMode('standard')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                mode === 'standard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{t.modeStandard}</span>
            </button>
            <button
              onClick={() => setMode('freeform')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                mode === 'freeform' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t.modeFreeform}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task 1: Prominent Fixed Variable Column Header Bar */}
      {mode === 'standard' && (
        <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200/90 rounded-lg flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 whitespace-nowrap">
              {t.variableOrderNotice}
            </span>
            {varNames.map((v, i) => {
              const badge = varColorBadges[i % varColorBadges.length];
              return (
                <span
                  key={i}
                  className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs border ${badge.bg} whitespace-nowrap shadow-2xs`}
                >
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${badge.dot}`} />
                  <span>{v}</span>
                </span>
              );
            })}
            <span className="text-slate-400 font-bold mx-1">=</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-semibold text-xs bg-slate-200 text-slate-700 whitespace-nowrap">
              {t.colConstHeader}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden lg:inline whitespace-nowrap">
            {varNames.map((v, i) => `a_{${i + 1}}${v}`).join(' + ')} = c
          </div>
        </div>
      )}

      {/* Input Fields */}
      <div className="mt-3">
        {mode === 'standard' ? (
          <div className="space-y-3">
            {equations.map((eq, rowIdx) => {
              return (
                <div
                  key={rowIdx}
                  className="p-3 bg-white border border-slate-200 rounded-lg transition-colors hover:border-slate-300 shadow-2xs"
                >
                  {/* Row Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                        {circleLabels[rowIdx] || rowIdx + 1}
                      </span>
                      <span>
                        {isZh
                          ? `方程 ${circleLabels[rowIdx] || rowIdx + 1}`
                          : `Equation ${circleLabels[rowIdx] || rowIdx + 1}`}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {varNames.map((v, i) => `a_{${rowIdx + 1}${i + 1}}${v}`).join(' + ')} = c_{rowIdx + 1}
                    </span>
                  </div>

                  {/* Coefficients with Attached Variable Badges (Task 1) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-800">
                    {varNames.map((vName, colIdx) => {
                      const badge = varColorBadges[colIdx % varColorBadges.length];

                      return (
                        <React.Fragment key={colIdx}>
                          {colIdx > 0 && <span className="text-slate-400 font-bold">+</span>}
                          <div className="flex items-center bg-slate-50 border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white overflow-hidden shadow-2xs">
                            <input
                              type="text"
                              value={coeffStrings[rowIdx]?.[colIdx] ?? '0'}
                              onChange={(e) => {
                                const next = coeffStrings.map((r) => [...r]);
                                if (!next[rowIdx]) next[rowIdx] = [];
                                next[rowIdx][colIdx] = e.target.value;
                                setCoeffStrings(next);
                                commitStandard(next, constStrings);
                              }}
                              placeholder="1"
                              className="w-12 sm:w-16 px-2 py-1.5 text-center font-mono font-medium focus:outline-none text-xs sm:text-sm bg-transparent"
                            />
                            {/* Explicit Variable Badge inside input group (Task 1) */}
                            <span
                              className={`px-2 py-1.5 text-xs font-bold font-mono border-l border-slate-200 select-none ${badge.bg}`}
                            >
                              {vName}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    })}

                    <span className="text-slate-400 font-bold mx-0.5">=</span>

                    {/* Constant Input */}
                    <div className="flex items-center bg-slate-50 border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white overflow-hidden shadow-2xs">
                      <input
                        type="text"
                        value={constStrings[rowIdx] ?? '0'}
                        onChange={(e) => {
                          const nextConsts = [...constStrings];
                          nextConsts[rowIdx] = e.target.value;
                          setConstStrings(nextConsts);
                          commitStandard(coeffStrings, nextConsts);
                        }}
                        placeholder="0"
                        className="w-16 sm:w-20 px-2 py-1.5 text-center font-mono font-medium focus:outline-none text-xs sm:text-sm bg-transparent"
                      />
                      <span className="px-2 py-1.5 text-[11px] font-mono font-medium text-slate-500 border-l border-slate-200 select-none bg-slate-100">
                        c
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-center gap-2">
              <span className="font-semibold">💡 {t.variableOrderNotice}</span>
              <span className="font-mono font-bold tracking-wider">{varNames.join(', ')}</span>
            </div>

            {freeStrings.map((str, idx) => (
              <div key={idx}>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {isZh
                    ? `方程 ${circleLabels[idx] || idx + 1} 表达式（未知数限：${varNames.join(', ')}）：`
                    : `Equation ${circleLabels[idx] || idx + 1} Expression (Allowed variables: ${varNames.join(', ')}):`}
                </label>
                <input
                  type="text"
                  value={str}
                  onChange={(e) => {
                    const next = [...freeStrings];
                    next[idx] = e.target.value;
                    setFreeStrings(next);
                    commitFreeform(next);
                  }}
                  placeholder={
                    idx === 0
                      ? 'e.g. 2x + 3y = 7'
                      : idx === 1
                      ? 'e.g. 3x - 2y = 4'
                      : 'e.g. x + y + z = 6'
                  }
                  className="w-full px-3 py-2 font-mono text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* Error message banner */}
        {inputError && (
          <div className="mt-3 flex items-start gap-2 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{inputError}</span>
          </div>
        )}

        {/* Live LaTeX System Preview */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-x-auto py-1">
            <span className="text-xs font-medium text-slate-500 shrink-0">{t.currentSystem}</span>
            <MathView math={formatGeneralSystemTeX(equations, varNames)} />
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <button
              onClick={handleGenerateRandom}
              title={t.btnRandom}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.btnRandom}</span>
            </button>
            {n === 2 && (
              <button
                onClick={onOpenPresets}
                title={t.btnPresets}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.btnPresets}</span>
              </button>
            )}
            {n >= 2 && (
              <button
                onClick={handleSwapFirstTwo}
                title={t.btnSwap}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleReset}
              title={t.btnReset}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
