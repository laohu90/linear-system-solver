import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';
import { SystemAnalysis } from '../utils/equation';
import { Language, translations } from '../i18n/translations';

interface CoordinateGraphProps {
  analysis: SystemAnalysis;
  lang?: Language;
}

export const CoordinateGraph: React.FC<CoordinateGraphProps> = ({ analysis, lang = 'en' }) => {
  const t = translations[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport states in math coordinate units
  const [scale, setScale] = useState<number>(36); // pixels per unit
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // offset in math units
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  // Auto center on intersection point when analysis changes
  const resetToCenter = useCallback(() => {
    if (analysis.solution) {
      const sx = analysis.solution.x.toNumber();
      const sy = analysis.solution.y.toNumber();
      setOffset({ x: -sx, y: -sy });
      // Adaptive scale based on coordinates magnitude
      const maxCoord = Math.max(Math.abs(sx), Math.abs(sy), 5);
      const adaptiveScale = Math.min(48, Math.max(16, 180 / maxCoord));
      setScale(adaptiveScale);
    } else {
      setOffset({ x: 0, y: 0 });
      setScale(32);
    }
  }, [analysis]);

  useEffect(() => {
    resetToCenter();
  }, [resetToCenter]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI display
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Math origin (0,0) in canvas screen pixels
    const originX = width / 2 + offset.x * scale;
    const originY = height / 2 - offset.y * scale;

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw subtle grid
    const unitStep = scale < 20 ? 5 : scale < 35 ? 2 : 1;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;

    // Vertical grid lines
    const minX = Math.floor((-originX) / scale);
    const maxX = Math.ceil((width - originX) / scale);

    for (let x = minX; x <= maxX; x += unitStep) {
      const screenX = originX + x * scale;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const minY = Math.floor((originY - height) / scale);
    const maxY = Math.ceil(originY / scale);

    for (let y = minY; y <= maxY; y += unitStep) {
      const screenY = originY - y * scale;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
      ctx.stroke();
    }

    // 2. Draw Axes (X and Y)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Arrows and labels
    ctx.fillStyle = '#475569';
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('x', width - 14, originY - 6);
    ctx.fillText('y', originX + 6, 14);
    ctx.fillText('O', originX - 12, originY + 14);

    // Axis Tick labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    for (let x = minX; x <= maxX; x += unitStep) {
      if (x === 0) continue;
      const screenX = originX + x * scale;
      if (screenX > 15 && screenX < width - 15) {
        ctx.beginPath();
        ctx.moveTo(screenX, originY - 3);
        ctx.lineTo(screenX, originY + 3);
        ctx.stroke();
        ctx.fillText(x.toString(), screenX - 6, originY + 14);
      }
    }

    for (let y = minY; y <= maxY; y += unitStep) {
      if (y === 0) continue;
      const screenY = originY - y * scale;
      if (screenY > 15 && screenY < height - 15) {
        ctx.beginPath();
        ctx.moveTo(originX - 3, screenY);
        ctx.lineTo(originX + 3, screenY);
        ctx.stroke();
        ctx.fillText(y.toString(), originX + 6, screenY + 3);
      }
    }

    // Helper to draw a line: either vertical or y = mx + b
    const drawLine = (
      slope: number | undefined,
      intercept: number | undefined,
      isVertical: boolean,
      xIntercept: number | undefined,
      color: string,
      lineWidth: number = 2.5
    ) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      if (isVertical && xIntercept !== undefined) {
        const sx = originX + xIntercept * scale;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
      } else if (slope !== undefined && intercept !== undefined) {
        // x from screen left to screen right
        const mathX1 = (-originX) / scale;
        const mathY1 = slope * mathX1 + intercept;
        const screenY1 = originY - mathY1 * scale;

        const mathX2 = (width - originX) / scale;
        const mathY2 = slope * mathX2 + intercept;
        const screenY2 = originY - mathY2 * scale;

        ctx.moveTo(0, screenY1);
        ctx.lineTo(width, screenY2);
      }
      ctx.stroke();
      ctx.restore();
    };

    // Draw Line 1 (Blue #2563eb)
    drawLine(
      analysis.line1.slope,
      analysis.line1.intercept,
      analysis.line1.isVertical,
      analysis.line1.xIntercept,
      '#2563eb',
      2.5
    );

    // Draw Line 2 (Amber/Orange #ea580c)
    if (analysis.type === 'infinite') {
      // Coincident line - dashed overlay
      ctx.save();
      ctx.setLineDash([6, 6]);
      drawLine(
        analysis.line2.slope,
        analysis.line2.intercept,
        analysis.line2.isVertical,
        analysis.line2.xIntercept,
        '#ea580c',
        3
      );
      ctx.restore();
    } else {
      drawLine(
        analysis.line2.slope,
        analysis.line2.intercept,
        analysis.line2.isVertical,
        analysis.line2.xIntercept,
        '#ea580c',
        2.5
      );
    }

    // 3. Draw Intersection Point if unique
    if (analysis.solution) {
      const solX = analysis.solution.x.toNumber();
      const solY = analysis.solution.y.toNumber();
      const px = originX + solX * scale;
      const py = originY - solY * scale;

      // Glow circle
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#059669';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Coordinates Label Box
      const label = `P(${analysis.solution.xTeX}, ${analysis.solution.yTeX})`;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(label).width;

      const tagX = px + 10;
      const tagY = py - 12;

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(tagX, tagY - 14, textWidth + 12, 20, 4);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(label, tagX + 6, tagY);
    }
  }, [analysis, scale, offset]);

  // Mouse handlers for dragging/panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y - dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    // Calculate hover coordinate
    const rect = canvas.getBoundingClientRect();
    const mouseScreenX = e.clientX - rect.left;
    const mouseScreenY = e.clientY - rect.top;
    const originX = canvas.clientWidth / 2 + offset.x * scale;
    const originY = canvas.clientHeight / 2 - offset.y * scale;

    const mathX = (mouseScreenX - originX) / scale;
    const mathY = (originY - mouseScreenY) / scale;
    setHoverCoord({ x: Math.round(mathX * 10) / 10, y: Math.round(mathY * 10) / 10 });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Top Legend and Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-blue-700">
            <span className="w-3.5 h-1 bg-blue-600 rounded-full inline-block" />
            <span>{t.line1Legend}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-amber-700">
            <span className="w-3.5 h-1 bg-amber-600 rounded-full inline-block" />
            <span>{t.line2Legend}</span>
          </div>
          {analysis.solution && (
            <div className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>{t.pointLegend}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {hoverCoord && (
            <span className="font-mono text-slate-500 mr-2 tabular-nums">
              ({hoverCoord.x}, {hoverCoord.y})
            </span>
          )}
          <button
            onClick={() => setScale((s) => Math.min(s * 1.25, 100))}
            title={t.zoomIn}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(s * 0.8, 12))}
            title={t.zoomOut}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetToCenter}
            title={t.resetView}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[360px] cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={(e) => {
          e.preventDefault();
          const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
          setScale((s) => Math.min(120, Math.max(10, s * zoomFactor)));
        }}
        onMouseLeave={() => {
          setIsDragging(false);
          setHoverCoord(null);
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Floating status card for geometric conclusion */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-2.5 shadow-sm max-w-sm pointer-events-none">
          <div className="text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
            <span>{t.geoTitle}</span>
            <span
              className={`text-[11px] font-normal px-1.5 py-0.5 rounded ${
                analysis.type === 'unique'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : analysis.type === 'none'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {analysis.typeDescription}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">{analysis.geometricInterpretation}</p>
        </div>
      </div>
    </div>
  );
};
