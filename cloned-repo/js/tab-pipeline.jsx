// ADV — Pipeline
function OnQueueCard() {
  const q = WISESA.onQueue;
  const denom = Math.max(q.total, 1);
  return (
    <Card title="On-Queue Breakdown" subtitle={`${q.total} proyek menunggu antrian`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {q.types.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{t.label}</div>
            <div style={{ flex: 2, background: '#F1F3F7', borderRadius: 999, height: 8 }}>
              <div style={{ width: `${(t.value / denom) * 100}%`, height: '100%', borderRadius: 999, background: STATUS_KINDS[t.kind].fg }}></div>
            </div>
            <div style={{ width: 20, fontSize: 13, fontWeight: 700, color: '#111827', textAlign: 'right' }}>{t.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Antrian terdekat</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {q.top.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FAFBFC', border: '1px solid #F1F3F7', borderRadius: 9, padding: '9px 12px' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#D1D5DB' }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: '#374151' }}>{t.name}</span>
            <Pill kind={t.kind} small>{t.status}</Pill>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ThroughputCard() {
  const { useState } = React;
  const pts = WISESA.throughput.points;
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(pts.length - 1);
  const lo = Math.min(from, to), hi = Math.max(from, to);
  const view = pts.slice(lo, hi + 1);
  const sel = (val, onChange, label) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FFFFFF', border: '1px solid #E8EBF0', borderRadius: 9, padding: '7px 11px' }}>
      <span style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 600 }}>{label}</span>
      <select value={val} onChange={(e) => onChange(+e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 12.5, fontFamily: 'inherit', color: '#374151', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}>
        {pts.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
      </select>
    </label>
  );
  return (
    <Card title="Monthly Go-Live Throughput" subtitle="Jumlah proyek go-live per bulan — filter rentang bulan & tahun"
      right={<div style={{ display: 'flex', gap: 8 }}>{sel(from, setFrom, 'Dari')}{sel(to, setTo, 'Sampai')}</div>}>
      <MonthlyBarChart points={view} yMax={10}></MonthlyBarChart>
    </Card>
  );
}

function HeatmapCard() {
  const rows = ['Selesai', 'Aktif', 'Batal'];
  const keys = ['completed', 'active', 'canceled'];
  const max = Math.max(...WISESA.heatmap.map((d) => d.completed));
  const cellColor = (k, v) => {
    if (v === 0) return '#F6F7F9';
    if (k === 'completed') { const t = v / max; return `rgba(37, 99, 235, ${0.15 + t * 0.75})`; }
    if (k === 'active') return '#F59E0B';
    return '#EF4444';
  };
  const cellText = (k, v) => {
    if (v === 0) return '#C2C8D2';
    if (k === 'completed' && v / max < 0.45) return '#1E40AF';
    return '#FFFFFF';
  };
  return (
    <Card title="Project Disposition by Year" subtitle="Selesai / aktif / batal per tahun intake">
      <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(6, 1fr)', gap: 5, alignItems: 'center' }}>
        <div></div>
        {WISESA.heatmap.map((d) => <div key={d.year} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>{d.year}</div>)}
        {rows.map((r, ri) => (
          <React.Fragment key={r}>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{r}</div>
            {WISESA.heatmap.map((d) => {
              const v = d[keys[ri]];
              return <div key={d.year} style={{ height: 38, borderRadius: 8, background: cellColor(keys[ri], v), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: cellText(keys[ri], v) }}>{v}</div>;
            })}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}

function DepthCard() {
  const max = Math.max(...WISESA.depth.map((d) => d.completed + d.inflight)) * 1.05;
  return (
    <Card title="Delivery Depth · 2025 vs 2026" subtitle="Selesai vs masih berjalan">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '6px 0' }}>
        {WISESA.depth.map((d) => <StackedBar key={d.year} year={d.year} completed={d.completed} inflight={d.inflight} max={max}></StackedBar>)}
      </div>
      <Legend style={{ marginTop: 10 }} items={[{ color: '#2563EB', label: 'Selesai' }, { color: '#F59E0B', label: 'Berjalan' }]}></Legend>
      <div style={{ marginTop: 11, fontSize: 12, color: '#6B7280', background: '#FAFBFC', border: '1px solid #F1F3F7', borderRadius: 9, padding: '9px 13px' }}>Intake 2026 sebagian besar masih berjalan — 50 proyek aktif dalam pipeline.</div>
    </Card>
  );
}

function GoLiveCard() {
  const list = WISESA.goLive;
  const mid = Math.ceil(list.length / 2);
  const cols = [list.slice(0, mid), list.slice(mid)];
  return (
    <Card title="Project Go-Live" subtitle="Implementasi berhasil · 27 Mei – 17 Juni 2026"
      right={<Pill kind="green">{list.length} go-live</Pill>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 18px' }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {col.map((name, i) => {
              const idx = ci * mid + i + 1;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, background: '#FAFBFC', border: '1px solid #F1F3F7', borderRadius: 9, padding: '9px 13px' }}>
                  <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 999, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 800 }}>{idx}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', lineHeight: 1.35 }}>{name}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}

function PipelineTab() {
  return (
    <div data-screen-label="Pipeline" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
      <ChipRow chips={WISESA.pipelineChips}></ChipRow>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 15 }}>
        <Card title="Projects per Year" subtitle="Volume intake, 2021–2026" right={<Pill kind="amber" small>2026 berjalan</Pill>}>
          <VBarChart data={WISESA.projectsByYear} height={230} max={46}></VBarChart>
        </Card>
        <OnQueueCard></OnQueueCard>
      </div>
      <ThroughputCard></ThroughputCard>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 15 }}>
        <HeatmapCard></HeatmapCard>
        <DepthCard></DepthCard>
      </div>
      <GoLiveCard></GoLiveCard>
    </div>
  );
}

Object.assign(window, { PipelineTab });
