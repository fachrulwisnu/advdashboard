import React from "react";

export function topRoundedRect(x: number, y: number, w: number, h: number, r: number): string {
  r = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
}

// ---- Circular arc gauge (milestone pipeline) ----
interface ArcGaugeProps {
  pct: number;
  color: string;
  label: string;
  frac: string;
  size?: number;
  stroke?: number;
}

export function ArcGauge({ pct, color, label, frac, size = 70, stroke = 7 }: ArcGaugeProps) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = (pct / 100) * C;
  return (
    <div className="flex flex-col items-center gap-1.5 relative z-10">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="#FFFFFF" stroke="#EEF1F6" strokeWidth={stroke}></circle>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${C}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        ></circle>
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[15px] font-bold fill-gray-900 font-sans"
        >
          {pct}%
        </text>
      </svg>
      <div className="text-[17px] font-bold text-gray-800 font-display tracking-tight text-center leading-tight">
        {label}
      </div>
      <div className="text-[13px] text-gray-400 -mt-1 font-mono">{frac}</div>
    </div>
  );
}

// ---- Vertical bar chart with rounded tops ----
interface VBarChartProps {
  data: { value: number; label?: string; year?: string; color: string; valueLabel?: string; chip?: { text: string; kind: 'green' | 'red' } }[];
  height?: number;
  max?: number | null;
  fmt?: (v: number) => string | number;
  yTicks?: number[] | null;
  barRadius?: number;
}

export function VBarChart({ data, height = 220, max = null, fmt = (v) => v, yTicks = null, barRadius = 6 }: VBarChartProps) {
  const W = 560;
  const H = height;
  const padL = 36;
  const padB = 26;
  const padT = 34;
  const m = max || Math.max(...data.map((d) => d.value), 1) * 1.1;
  const n = data.length;
  const slot = (W - padL - 8) / n;
  const bw = Math.min(slot * 0.52, 56);
  const ticks = yTicks || [0, m / 2, m];
  const y = (v: number) => H - padB - (v / m) * (H - padB - padT);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={W - 4} y1={y(t)} y2={y(t)} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1"></line>
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" className="text-[10px] fill-gray-400 font-mono">
            {fmt(t)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = padL + slot * i + (slot - bw) / 2;
        const by = y(d.value);
        const bh = H - padB - by;
        return (
          <g key={i}>
            <path d={topRoundedRect(x, by, bw, Math.max(bh, 2), barRadius)} fill={d.color}></path>
            <text x={x + bw / 2} y={by - 7} textAnchor="middle" className="text-[11px] font-bold fill-gray-900 font-sans">
              {d.valueLabel != null ? d.valueLabel : fmt(d.value)}
            </text>
            <text x={x + bw / 2} y={H - padB + 16} textAnchor="middle" className="text-[11px] fill-gray-500 font-sans">
              {d.year || d.label}
            </text>
            {d.chip ? (
              <g transform={`translate(${x + bw / 2}, ${by - 32})`}>
                <rect
                  x={-26}
                  y={-11}
                  width={52}
                  height={17}
                  rx={8.5}
                  fill={d.chip.kind === 'green' ? '#D1FAE5' : '#FEE2E2'}
                ></rect>
                <text
                  x={0}
                  y={2}
                  textAnchor="middle"
                  className={`text-[9.5px] font-bold ${d.chip.kind === 'green' ? 'fill-emerald-600' : 'fill-red-600'} font-sans`}
                >
                  {d.chip.text}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

// ---- Grouped bar chart (2 series per group) ----
interface GroupedBarChartProps {
  data: { year: string; achieved: number; not: number }[];
  height?: number;
  onBarClick?: (year: string) => void;
}

export function GroupedBarChart({ data, height = 300, onBarClick }: GroupedBarChartProps) {
  const W = 1000;
  const H = height;
  const padL = 40;
  const padR = 40;
  const padB = 40;
  const padT = 50;
  
  // Find maximum value to scale y-axis
  const m = Math.max(...data.map((d) => Math.max(d.achieved, d.not)), 1) * 1.15;
  const n = data.length;
  const slot = (W - padL - padR) / n;
  const bw = Math.min(slot * 0.32, 44); // width of each bar
  const y = (v: number) => H - padB - (v / m) * (H - padB - padT);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
      {/* 3 Horizontal dashed scale guide lines */}
      {[0, m / 2, m].map((t, i) => (
        <line
          key={i}
          x1={padL}
          x2={W - padR}
          y1={y(t)}
          y2={y(t)}
          stroke="#E5E7EB"
          strokeDasharray="6 6"
          strokeWidth="1.5"
        ></line>
      ))}

      {data.map((d, i) => {
        const cx = padL + slot * i + slot / 2;
        // Spaced out bars side-by-side
        const x1 = cx - bw - 4;
        const x2 = cx + 4;
        
        // Ensure even 0 value has a tiny 2px height on the baseline for visual reference
        const y1 = y(d.achieved);
        const y2 = y(d.not);
        const h1 = Math.max(H - padB - y1, 2);
        const h2 = Math.max(H - padB - y2, 2);

        return (
          <g
            key={i}
            onClick={() => onBarClick?.(d.year)}
            className="cursor-pointer group/bar transition-all"
          >
            {/* Background hover area for easier clicking */}
            <rect
              x={cx - slot / 2 + 5}
              y={padT - 10}
              width={slot - 10}
              height={H - padB - padT + 15}
              fill="rgba(37, 99, 235, 0.02)"
              className="opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-xl"
            />

            {/* Achieved SLA (Blue Bar) */}
            <path
              d={topRoundedRect(x1, y1, bw, h1, 8)}
              fill="#2563EB"
              className="transition-all duration-300 group-hover/bar:fill-[#1D4ED8]"
            ></path>
            {/* Achieved Value text */}
            <text
              x={x1 + bw / 2}
              y={y1 - 10}
              textAnchor="middle"
              className="text-[22px] font-extrabold fill-[#2563EB] font-sans transition-all group-hover/bar:fill-[#1D4ED8]"
            >
              {d.achieved}
            </text>

            {/* Not Achieved SLA (Red Bar) */}
            <path
              d={topRoundedRect(x2, y2, bw, h2, 8)}
              fill="#EF4444"
              opacity={d.not === 0 ? 0.4 : 1}
              className="transition-all duration-300 group-hover/bar:fill-[#DC2626]"
            ></path>
            {/* Not Achieved Value text */}
            <text
              x={x2 + bw / 2}
              y={y2 - 10}
              textAnchor="middle"
              className="text-[22px] font-extrabold fill-[#EF4444] font-sans transition-all group-hover/bar:fill-[#DC2626]"
            >
              {d.not}
            </text>

            {/* Year Label */}
            <text
              x={cx}
              y={H - padB + 28}
              textAnchor="middle"
              className="text-[20px] font-bold fill-gray-500 font-sans group-hover/bar:fill-gray-900 transition-colors"
            >
              {d.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---- Smooth line + area chart ----
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x},${p2.y}`;
  }
  return d;
}

interface LineAreaChartProps {
  labels: string[];
  values: number[];
  peaks?: number[];
  height?: number;
  yMax?: number;
}

export function LineAreaChart({ labels, values, peaks = [], height = 240, yMax = 8 }: LineAreaChartProps) {
  const W = 1100;
  const H = height;
  const padL = 30;
  const padR = 16;
  const padB = 28;
  const padT = 36;
  const n = values.length;
  const xs = (i: number) => padL + (i / (n - 1)) * (W - padL - padR);
  const ys = (v: number) => H - padB - (v / yMax) * (H - padB - padT);
  const pts = values.map((v, i) => ({ x: +xs(i).toFixed(1), y: +ys(v).toFixed(1) }));
  const line = smoothPath(pts);
  const area = `${line} L${pts[n - 1].x},${H - padB} L${pts[0].x},${H - padB} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
      <defs>
        <linearGradient id="tpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28"></stop>
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02"></stop>
        </linearGradient>
      </defs>
      {[0, 2, 4, 6, 8].map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={ys(t)} y2={ys(t)} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1"></line>
          <text x={padL - 8} y={ys(t) + 3} textAnchor="end" className="text-[10px] fill-gray-400 font-mono">
            {t}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#tpGrad)"></path>
      <path d={line} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round"></path>
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={peaks.includes(i) ? 5 : 3.5} fill="#FFFFFF" stroke="#2563EB" strokeWidth="2"></circle>
          {i % 2 === 0 ? (
            <text x={p.x} y={H - padB + 16} textAnchor="middle" className="text-[10px] fill-gray-400 font-sans">
              {labels[i]}
            </text>
          ) : null}
          {peaks.includes(i) ? (
            <g transform={`translate(${p.x}, ${p.y - 16})`}>
              <rect x={-34} y={-13} width={68} height={18} rx={9} fill="#1E3A8A"></rect>
              <text x={0} y={0} textAnchor="middle" className="text-[10px] font-bold fill-white font-sans">
                Peak: {values[i]}
              </text>
            </g>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

// ---- Donut (stroke-based segments) ----
interface DonutChartProps {
  segments: { value: number; color: string; label?: string }[];
  size?: number;
  thickness?: number;
  centerTop: string | number;
  centerSub: string;
  totalOverride?: number;
}

export function DonutChart({ segments, size = 170, thickness = 26, centerTop, centerSub, totalOverride }: DonutChartProps) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const total = totalOverride || segments.reduce((sum, x) => sum + x.value, 0);
  let acc = 0;
  return (
    <svg width={size} height={size} className="select-none">
      {segments.map((s, i) => {
        const frac = total > 0 ? s.value / total : 0;
        const dash = Math.max(frac * C - 1.5, 0.5);
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={-acc * C}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          ></circle>
        );
        acc += frac;
        return el;
      })}
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" className="text-[22px] font-bold fill-gray-900 font-display">
        {centerTop}
      </text>
      <text x={size / 2} y={size / 2 + 15} textAnchor="middle" className="text-[10.5px] fill-gray-500 font-sans">
        {centerSub}
      </text>
    </svg>
  );
}

// ---- Pie (filled wedges) ----
interface PieChartProps {
  segments: { value: number; color: string; label?: string }[];
  size?: number;
  onClick?: (label: string) => void;
}

export function PieChart({ segments, size = 170, onClick }: PieChartProps) {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const total = segments.reduce((sum, x) => sum + x.value, 0);
  let a = -Math.PI / 2;
  return (
    <svg width={size} height={size} className="select-none">
      {segments.map((s, i) => {
        if (s.value === 0) return null;
        const a1 = a + (s.value / total) * Math.PI * 2;
        const p0 = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
        const p1 = { x: cx + r * Math.cos(a1), y: cy + r * Math.sin(a1) };
        const large = a1 - a > Math.PI ? 1 : 0;
        const d = `M${cx},${cy} L${p0.x.toFixed(1)},${p0.y.toFixed(1)} A${r},${r} 0 ${large} 1 ${p1.x.toFixed(1)},${p1.y.toFixed(1)} Z`;
        a = a1;
        return (
          <path
            key={i}
            d={d}
            fill={s.color}
            stroke="#FFFFFF"
            strokeWidth="1.5"
            className={onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}
            onClick={() => onClick?.(s.label || "")}
          />
        );
      })}
    </svg>
  );
}

// ---- Horizontal bar row (div-based) ----
interface HBarRowProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  height?: number;
  labelWidth?: number;
  highlight?: boolean;
}

export function HBarRow({ label, value, max, color = '#2563EB', height = 10, labelWidth = 110, highlight = false }: HBarRowProps) {
  const pct = max > 0 ? Math.min(100, Math.max(value / max * 100, 1.5)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div
        className={`text-[12px] flex-shrink-0 text-left truncate`}
        style={{ width: labelWidth, fontWeight: highlight ? 700 : 500, color: highlight ? '#111827' : '#6B7280' }}
      >
        {label}
      </div>
      <div className="flex-1 bg-gray-100 rounded-full" style={{ height }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        ></div>
      </div>
      <div className="w-9 flex-shrink-0 text-right text-[12.5px] font-bold text-gray-800 font-mono">
        {value}
      </div>
    </div>
  );
}

// ---- Stacked horizontal bar ----
interface StackedBarProps {
  key?: any;
  year: string;
  completed: number;
  inflight: number;
  max: number;
}

export function StackedBar({ year, completed, inflight, max }: StackedBarProps) {
  const cw = max > 0 ? (completed / max) * 100 : 0;
  const iw = max > 0 ? (inflight / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 flex-shrink-0 text-[13px] font-semibold text-gray-700 font-sans">{year}</div>
      <div className="flex-1 flex h-[22px] rounded-lg overflow-hidden bg-gray-100">
        <div
          className="bg-blue-600 flex items-center justify-center transition-all duration-500 ease-out"
          style={{ width: `${cw}%` }}
        >
          {completed > 4 ? <span className="text-[10.5px] font-bold text-white font-sans">{completed}</span> : null}
        </div>
        <div
          className="bg-amber-400 flex items-center justify-center transition-all duration-500 ease-out"
          style={{ width: `${iw}%` }}
        >
          {inflight > 4 ? <span className="text-[10.5px] font-bold text-white font-sans">{inflight}</span> : null}
        </div>
      </div>
      <div className="w-[60px] flex-shrink-0 text-[11px] text-gray-400 font-mono text-right">{completed + inflight} total</div>
    </div>
  );
}

// ---- Monthly bar chart ----
interface MonthlyBarChartProps {
  points: { ym: string; label: string; value: number }[];
  height?: number;
  yMax?: number;
}

export function MonthlyBarChart({ points, height = 230, yMax = 10 }: MonthlyBarChartProps) {
  const W = 1100;
  const H = height;
  const padL = 30;
  const padR = 10;
  const padB = 30;
  const padT = 26;
  const n = points.length;
  const slot = (W - padL - padR) / Math.max(n, 1);
  const bw = Math.min(slot * 0.56, 34);
  const peak = Math.max(...points.map((p) => p.value), 1);
  const y = (v: number) => H - padB - (v / yMax) * (H - padB - padT);
  const showEvery = n > 12 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
      {[0, yMax / 2, yMax].map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1"></line>
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" className="text-[11px] fill-gray-400 font-mono">
            {Math.round(t)}
          </text>
        </g>
      ))}
      {points.map((p, i) => {
        const x = padL + slot * i + (slot - bw) / 2;
        const by = y(p.value);
        const bh = H - padB - by;
        const isPeak = p.value === peak;
        return (
          <g key={i}>
            <path d={topRoundedRect(x, by, bw, Math.max(bh, 2), 5)} fill={isPeak ? '#1D4ED8' : '#60A5FA'}></path>
            <text x={x + bw / 2} y={by - 6} textAnchor="middle" className={`text-[11px] font-bold ${isPeak ? 'fill-blue-800 font-sans' : 'fill-gray-500 font-sans'}`}>
              {p.value}
            </text>
            {i % showEvery === 0 ? (
              <text x={x + bw / 2} y={H - padB + 16} textAnchor="middle" className="text-[10.5px] fill-gray-400 font-sans">
                {p.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

// ---- Throughput Comparison Chart (2025 vs 2026) ----
interface ThroughputComparisonChartProps {
  data: { monthIndex: number; monthName: string; val2025: number; val2026: number }[];
  height?: number;
}

export function ThroughputComparisonChart({ data, height = 230 }: ThroughputComparisonChartProps) {
  const W = 1100;
  const H = height;
  const padL = 34;
  const padR = 20;
  const padB = 35;
  const padT = 30;

  const n = data.length;
  if (n === 0) {
    return (
      <div className="flex items-center justify-center h-[230px] text-xs text-gray-400">
        No evaluation data available.
      </div>
    );
  }

  // Find max value to determine the scale
  const maxVal = Math.max(...data.map(d => Math.max(d.val2025, d.val2026)), 4);
  const yMax = maxVal + 1; // leave room at the top

  const slot = (W - padL - padR) / n;
  const bw = Math.min(slot * 0.32, 28); // bar width
  const y = (v: number) => H - padB - (v / yMax) * (H - padB - padT);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
      {/* Horizontal scale line indicators */}
      {[0, yMax / 2, yMax].map((t, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={W - padR}
            y1={y(t)}
            y2={y(t)}
            stroke="#F3F4F6"
            strokeDasharray="4 4"
            strokeWidth="1"
          ></line>
          <text
            x={padL - 6}
            y={y(t) + 3}
            textAnchor="end"
            className="text-[10px] fill-gray-400 font-mono"
          >
            {Math.round(t)}
          </text>
        </g>
      ))}

      {data.map((d, i) => {
        const cx = padL + slot * i + slot / 2;
        // Two side by side bars
        const x1 = cx - bw - 2;
        const x2 = cx + 2;

        const by1 = y(d.val2025);
        const bh1 = Math.max(H - padB - by1, 1.5);

        const by2 = y(d.val2026);
        const bh2 = Math.max(H - padB - by2, 1.5);

        return (
          <g key={i}>
            {/* 2025 Bar (Slate/Blue - lighter tone for past series) */}
            <path
              d={topRoundedRect(x1, by1, bw, bh1, 4)}
              fill="#93C5FD"
              className="transition-all duration-300 hover:fill-[#60A5FA]"
            />
            {d.val2025 > 0 && (
              <text
                x={x1 + bw / 2}
                y={by1 - 5}
                textAnchor="middle"
                className="text-[10px] font-bold fill-blue-500 font-sans"
              >
                {d.val2025}
              </text>
            )}

            {/* 2026 Bar (Solid royal blue for active evaluation series) */}
            <path
              d={topRoundedRect(x2, by2, bw, bh2, 4)}
              fill="#1D4ED8"
              className="transition-all duration-300 hover:fill-[#1E40AF]"
            />
            {d.val2026 > 0 && (
              <text
                x={x2 + bw / 2}
                y={by2 - 5}
                textAnchor="middle"
                className="text-[10px] font-bold fill-blue-800 font-sans"
              >
                {d.val2026}
              </text>
            )}

            {/* Month Name label */}
            <text
              x={cx}
              y={H - padB + 16}
              textAnchor="middle"
              className="text-[10px] font-semibold fill-gray-400 font-sans uppercase tracking-wider"
            >
              {d.monthName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
