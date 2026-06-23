// Wisesa — reusable SVG chart components
const { useState } = React;

function topRoundedRect(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
}

// ---- Circular arc gauge (milestone pipeline) ----
function ArcGauge({ pct, color, label, frac, size = 70, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = pct / 100 * C;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="#FFFFFF" stroke="#EEF1F6" strokeWidth={stroke}></circle>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${C}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}></circle>
        <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 15, fontWeight: 700, fill: '#111827' }}>{pct}%</text>
      </svg>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#374151' }}>{label}</div>
      <div style={{ fontSize: 14, color: '#9CA3AF', marginTop: -2 }}>{frac}</div>
    </div>);

}

// ---- Vertical bar chart with rounded tops ----
function VBarChart({ data, height = 220, max = null, fmt = (v) => v, yTicks = null, barRadius = 6 }) {
  const W = 560,H = height,padL = 36,padB = 26,padT = 34;
  const m = max || Math.max(...data.map((d) => d.value)) * 1.1;
  const n = data.length;
  const slot = (W - padL - 8) / n;
  const bw = Math.min(slot * 0.52, 56);
  const ticks = yTicks || [0, m / 2, m];
  const y = (v) => H - padB - v / m * (H - padB - padT);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {ticks.map((t, i) =>
      <g key={i}>
          <line x1={padL} x2={W - 4} y1={y(t)} y2={y(t)} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1"></line>
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" style={{ fontSize: 10, fill: '#9CA3AF' }}>{fmt(t)}</text>
        </g>
      )}
      {data.map((d, i) => {
        const x = padL + slot * i + (slot - bw) / 2;
        const by = y(d.value),bh = H - padB - by;
        return (
          <g key={i}>
            <path d={topRoundedRect(x, by, bw, Math.max(bh, 2), barRadius)} fill={d.color}></path>
            <text x={x + bw / 2} y={by - 7} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: '#111827' }}>{d.valueLabel != null ? d.valueLabel : fmt(d.value)}</text>
            <text x={x + bw / 2} y={H - padB + 16} textAnchor="middle" style={{ fontSize: 11, fill: '#6B7280' }}>{d.year || d.label}</text>
            {d.chip ?
            <g transform={`translate(${x + bw / 2}, ${by - 32})`}>
                <rect x={-26} y={-11} width={52} height={17} rx={8.5}
              fill={d.chip.kind === 'green' ? '#D1FAE5' : '#FEE2E2'}></rect>
                <text x={0} y={2} textAnchor="middle"
              style={{ fontSize: 9.5, fontWeight: 700, fill: d.chip.kind === 'green' ? '#059669' : '#DC2626' }}>{d.chip.text}</text>
              </g> :
            null}
          </g>);

      })}
    </svg>);

}

// ---- Grouped bar chart (2 series per group) ----
function GroupedBarChart({ data, height = 230 }) {
  const W = 600,H = height,padL = 34,padB = 26,padT = 26;
  const m = Math.max(...data.map((d) => Math.max(d.achieved, d.not))) * 1.15;
  const n = data.length;
  const slot = (W - padL - 8) / n;
  const bw = Math.min(slot * 0.26, 24);
  const y = (v) => H - padB - v / m * (H - padB - padT);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0, m / 2, m].map((t, i) =>
      <line key={i} x1={padL} x2={W - 4} y1={y(t)} y2={y(t)} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1"></line>
      )}
      {data.map((d, i) => {
        const cx = padL + slot * i + slot / 2;
        const x1 = cx - bw - 2,x2 = cx + 2;
        const y1 = y(d.achieved),y2 = y(Math.max(d.not, 0));
        return (
          <g key={i}>
            <path d={topRoundedRect(x1, y1, bw, Math.max(H - padB - y1, 2), 5)} fill="#2563EB"></path>
            <text x={x1 + bw / 2} y={y1 - 6} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: '#1E40AF' }}>{d.achieved}</text>
            <path d={topRoundedRect(x2, y2, bw, Math.max(H - padB - y2, 2), 5)} fill="#EF4444" opacity={d.not === 0 ? 0.25 : 1}></path>
            <text x={x2 + bw / 2} y={y2 - 6} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: '#DC2626' }}>{d.not}</text>
            <text x={cx} y={H - padB + 16} textAnchor="middle" style={{ fontSize: 11, fill: '#6B7280' }}>{d.year}</text>
          </g>);

      })}
    </svg>);

}

// ---- Smooth line + area chart ----
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i],p1 = pts[i],p2 = pts[i + 1],p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6,c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6,c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x},${p2.y}`;
  }
  return d;
}

function LineAreaChart({ labels, values, peaks = [], height = 240, yMax = 8 }) {
  const W = 1100,H = height,padL = 30,padR = 16,padB = 28,padT = 36;
  const n = values.length;
  const xs = (i) => padL + i / (n - 1) * (W - padL - padR);
  const ys = (v) => H - padB - v / yMax * (H - padB - padT);
  const pts = values.map((v, i) => ({ x: +xs(i).toFixed(1), y: +ys(v).toFixed(1) }));
  const line = smoothPath(pts);
  const area = `${line} L${pts[n - 1].x},${H - padB} L${pts[0].x},${H - padB} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="tpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28"></stop>
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02"></stop>
        </linearGradient>
      </defs>
      {[0, 2, 4, 6, 8].map((t) =>
      <g key={t}>
          <line x1={padL} x2={W - padR} y1={ys(t)} y2={ys(t)} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1"></line>
          <text x={padL - 8} y={ys(t) + 3} textAnchor="end" style={{ fontSize: 10, fill: '#9CA3AF' }}>{t}</text>
        </g>
      )}
      <path d={area} fill="url(#tpGrad)"></path>
      <path d={line} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round"></path>
      {pts.map((p, i) =>
      <g key={i}>
          <circle cx={p.x} cy={p.y} r={peaks.includes(i) ? 5 : 3.5} fill="#FFFFFF" stroke="#2563EB" strokeWidth="2"></circle>
          {i % 2 === 0 ?
        <text x={p.x} y={H - padB + 16} textAnchor="middle" style={{ fontSize: 10, fill: '#9CA3AF' }}>{labels[i]}</text> :
        null}
          {peaks.includes(i) ?
        <g transform={`translate(${p.x}, ${p.y - 16})`}>
              <rect x={-34} y={-13} width={68} height={18} rx={9} fill="#1E3A8A"></rect>
              <text x={0} y={0} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: '#FFFFFF' }}>Peak: {values[i]}</text>
            </g> :
        null}
        </g>
      )}
    </svg>);

}

// ---- Donut (stroke-based segments) ----
function DonutChart({ segments, size = 170, thickness = 26, centerTop, centerSub, totalOverride }) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const total = totalOverride || segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <svg width={size} height={size}>
      {segments.map((s, i) => {
        const frac = s.value / total;
        const dash = Math.max(frac * C - 1.5, 0.5);
        const el =
        <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={s.color} strokeWidth={thickness}
        strokeDasharray={`${dash} ${C - dash}`}
        strokeDashoffset={-acc * C}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}></circle>;

        acc += frac;
        return el;
      })}
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: '#111827' }}>{centerTop}</text>
      <text x={size / 2} y={size / 2 + 15} textAnchor="middle" style={{ fontSize: 10.5, fill: '#6B7280' }}>{centerSub}</text>
    </svg>);

}

// ---- Pie (filled wedges) ----
function PieChart({ segments, size = 170 }) {
  const r = size / 2 - 4,cx = size / 2,cy = size / 2;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let a = -Math.PI / 2;
  return (
    <svg width={size} height={size}>
      {segments.map((s, i) => {
        const a1 = a + s.value / total * Math.PI * 2;
        const p0 = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
        const p1 = { x: cx + r * Math.cos(a1), y: cy + r * Math.sin(a1) };
        const large = a1 - a > Math.PI ? 1 : 0;
        const d = `M${cx},${cy} L${p0.x.toFixed(1)},${p0.y.toFixed(1)} A${r},${r} 0 ${large} 1 ${p1.x.toFixed(1)},${p1.y.toFixed(1)} Z`;
        a = a1;
        return <path key={i} d={d} fill={s.color} stroke="#FFFFFF" strokeWidth="1.5"></path>;
      })}
    </svg>);

}

// ---- Horizontal bar row (div-based) ----
function HBarRow({ label, value, max, color = '#2563EB', height = 10, labelWidth = 110, highlight = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: labelWidth, flexShrink: 0, fontSize: 12, color: highlight ? '#111827' : '#6B7280', fontWeight: highlight ? 700 : 500, textAlign: 'left' }}>{label}</div>
      <div style={{ flex: 1, background: '#F1F3F7', borderRadius: 999, height: height }}>
        <div style={{ width: `${Math.max(value / max * 100, 1.5)}%`, height: '100%', background: color, borderRadius: 999, transition: 'width .5s ease' }}></div>
      </div>
      <div style={{ width: 36, flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: '#111827', textAlign: 'right' }}>{value}</div>
    </div>);

}

// ---- Stacked horizontal bar ----
function StackedBar({ year, completed, inflight, max }) {
  const cw = completed / max * 100,iw = inflight / max * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 44, flexShrink: 0, fontSize: 13, fontWeight: 600, color: '#374151' }}>{year}</div>
      <div style={{ flex: 1, display: 'flex', height: 22, borderRadius: 7, overflow: 'hidden', background: '#F1F3F7' }}>
        <div style={{ width: `${cw}%`, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {completed > 4 ? <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff' }}>{completed}</span> : null}
        </div>
        <div style={{ width: `${iw}%`, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {inflight > 4 ? <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff' }}>{inflight}</span> : null}
        </div>
      </div>
      <div style={{ width: 60, flexShrink: 0, fontSize: 11, color: '#9CA3AF' }}>{completed + inflight} total</div>
    </div>);

}

// ---- Monthly bar chart (throughput) — thin rounded bars, peak highlighted ----
function MonthlyBarChart({ points, height = 230, yMax = 10 }) {
  const W = 1100, H = height, padL = 30, padR = 10, padB = 30, padT = 26;
  const n = points.length;
  const slot = (W - padL - padR) / Math.max(n, 1);
  const bw = Math.min(slot * 0.56, 34);
  const peak = Math.max(...points.map((p) => p.value), 1);
  const y = (v) => H - padB - v / yMax * (H - padB - padT);
  const showEvery = n > 12 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0, yMax / 2, yMax].map((t, i) =>
      <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1"></line>
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" style={{ fontSize: 11, fill: '#9CA3AF' }}>{Math.round(t)}</text>
        </g>
      )}
      {points.map((p, i) => {
        const x = padL + slot * i + (slot - bw) / 2;
        const by = y(p.value), bh = H - padB - by;
        const isPeak = p.value === peak;
        return (
          <g key={i}>
            <path d={topRoundedRect(x, by, bw, Math.max(bh, 2), 5)} fill={isPeak ? '#1D4ED8' : '#60A5FA'}></path>
            <text x={x + bw / 2} y={by - 6} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: isPeak ? '#1D4ED8' : '#6B7280' }}>{p.value}</text>
            {i % showEvery === 0 ?
            <text x={x + bw / 2} y={H - padB + 16} textAnchor="middle" style={{ fontSize: 10.5, fill: '#9CA3AF' }}>{p.label}</text> : null}
          </g>);
      })}
    </svg>);
}

Object.assign(window, { ArcGauge, VBarChart, GroupedBarChart, LineAreaChart, MonthlyBarChart, DonutChart, PieChart, HBarRow, StackedBar, topRoundedRect });