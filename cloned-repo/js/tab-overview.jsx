// ADV — Overview (Ringkasan)
const { useContext } = React;

function FeedbackHero() {
  const f = WISESA.feedback;
  const factors = [
    { label: 'Proyek dievaluasi', value: `${f.evaluated}`, tone: 'amber' },
    { label: 'Go-Live periode ini', value: `${WISESA.goLive.length}`, tone: 'green' },
    { label: 'SLA total 2026', value: `${WISESA.slaTotal2026}%`, tone: 'blue' },
    { label: 'Perlu perhatian', value: `${WISESA.report.needAttention}`, tone: 'red' }
  ];
  const toneBg = { amber: '#FFFBEB', green: '#ECFDF5', blue: '#EFF4FE', red: '#FEF2F2' };
  const toneFg = { amber: '#B45309', green: '#059669', blue: '#2563EB', red: '#DC2626' };
  return (
    <Card title="User Feedback Score" subtitle="Skor kepuasan rata-rata pasca go-live — beserta faktor yang memengaruhinya">
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingRight: 28, borderRight: '1px solid #F1F3F7' }}>
          <div style={{ fontSize: 46, fontWeight: 800, color: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1, whiteSpace: 'nowrap' }}>{f.score}<span style={{ fontSize: 19, color: '#9CA3AF', fontWeight: 600 }}> / {f.of}</span></div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} width="24" height="24" viewBox="0 0 24 24">
                <path d="M12 3.5 L14.6 9 L20.5 9.8 L16.2 13.9 L17.3 19.8 L12 17 L6.7 19.8 L7.8 13.9 L3.5 9.8 L9.4 9 Z" fill={i <= f.filled ? '#F59E0B' : '#E5E7EB'}></path>
              </svg>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flex: 1 }}>
          {factors.map((x, i) => (
            <div key={i} style={{ flex: 1, background: toneBg[x.tone], borderRadius: 11, padding: '12px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: toneFg[x.tone], fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{x.value}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 5 }}>{x.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function KpiCard({ k }) {
  const nav = useContext(NavContext);
  return (
    <div className="ws-card ws-kpi" onClick={() => nav.goProjects(k.filter)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') nav.goProjects(k.filter); }}
      style={{ padding: '17px 19px', display: 'flex', flexDirection: 'column', gap: 11, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
      {k.highlight ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: 14 }}></div> : null}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: k.highlight ? 'rgba(255,255,255,.9)' : '#6B7280' }}>{k.label}</span>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: k.highlight ? 'rgba(255,255,255,.18)' : `${k.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={k.icon} size={17} color={k.highlight ? '#FFFFFF' : k.color}></Icon>
        </span>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: k.highlight ? '#FFFFFF' : '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{k.value}</div>
        {k.split ? (
          <div style={{ display: 'flex', gap: 14, marginTop: 9 }}>
            {k.split.map((s, i) => (
              <div key={i} style={{ fontSize: 14, color: k.highlight ? 'rgba(255,255,255,.85)' : '#6B7280' }}>
                <span style={{ fontWeight: 800, color: k.highlight ? '#fff' : '#374151' }}>{s.value}</span> {s.label.replace('Hold by ', '')}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 15, color: k.highlight ? 'rgba(255,255,255,.85)' : '#6B7280', marginTop: 7 }}>{k.sub}</div>
        )}
      </div>
      <span style={{ position: 'relative', fontSize: 13, fontWeight: 600, color: k.highlight ? 'rgba(255,255,255,.9)' : '#2563EB', display: 'flex', alignItems: 'center', gap: 4 }}>
        View projects <Icon name="chevron" size={13} color={k.highlight ? 'rgba(255,255,255,.9)' : '#2563EB'} strokeWidth={2.4}></Icon>
      </span>
    </div>
  );
}

function MilestoneRow() {
  const ms = WISESA.milestones;
  return (
    <Card title="Milestone SLA Pipeline" subtitle="Tingkat ketercapaian SLA per tahapan · SLA FSD–Live 2026">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', padding: '8px 24px 2px' }}>
        <div style={{ position: 'absolute', top: 42, left: 86, right: 86, height: 2, background: 'repeating-linear-gradient(90deg, #D7DCE5 0 6px, transparent 6px 12px)' }}></div>
        {ms.map((m, i) => (
          <ArcGauge key={i} pct={m.pct} color={m.color} label={m.stage} size={80} stroke={8}
            frac={m.notAch === 0 ? 'Tercapai penuh' : `${m.notAch} tidak tercapai`}></ArcGauge>
        ))}
      </div>
    </Card>
  );
}

function DevSlaCard() {
  const d = WISESA.devSla2026;
  const size = 168, stroke = 16;
  const r = (size - stroke) / 2;
  const half = Math.PI * r;
  const dash = (d.pct / 100) * half;
  const color = d.pct >= d.target ? '#10B981' : d.pct >= d.target - 5 ? '#F59E0B' : '#EF4444';
  return (
    <Card title="SLA DEV" subtitle="Ketercapaian SLA tahap Development · 2026">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={size} height={size / 2 + 26} style={{ overflow: 'visible' }}>
          <path d={`M ${stroke / 2} ${size / 2 + 8} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2 + 8}`} fill="none" stroke="#F1F3F7" strokeWidth={stroke} strokeLinecap="round"></path>
          <path d={`M ${stroke / 2} ${size / 2 + 8} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2 + 8}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${half * 2}`}></path>
          <text x={size / 2} y={size / 2 - 4} textAnchor="middle" style={{ fontSize: 34, fontWeight: 800, fill: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{d.pct}%</text>
          <text x={size / 2} y={size / 2 + 15} textAnchor="middle" style={{ fontSize: 11.5, fill: '#9CA3AF' }}>target {d.target}%</text>
        </svg>
        <div style={{ marginTop: 10 }}>
          <Legend items={[{ color: '#10B981', label: 'Tercapai', value: d.achieved }, { color: '#EF4444', label: 'Tidak tercapai', value: d.notAchieved }]}></Legend>
        </div>
      </div>
    </Card>
  );
}

function YoyDevSlaCard() {
  return (
    <Card title="DEV SLA Year-on-Year" subtitle="Perbandingan ketercapaian 2025 vs 2026">
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <VBarChart data={WISESA.yoySla.map((d) => ({ ...d, value: d.pct, valueLabel: d.pct + '%' }))} max={115} height={200} yTicks={[0, 50, 100]} fmt={(v) => Math.round(v) + '%'}></VBarChart>
      </div>
      <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 4, textAlign: 'center' }}>2026 berjalan · turun 5 poin dari 2025</div>
    </Card>
  );
}

function UatRescheduledCard() {
  const u = WISESA.uatRescheduled;
  return (
    <Card title="UAT Rescheduled" subtitle="Proyek aktif dengan jadwal UAT yang diundur"
      right={<Pill kind="amber">{u.active} aktif · {u.total} total</Pill>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {u.rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FAFBFC', border: '1px solid #F1F3F7', borderRadius: 10, padding: '11px 14px' }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#F59E0B', flexShrink: 0 }}></span>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#374151' }}>{r.name}</div>
            <Pill kind={r.statusKind} small>{r.status}</Pill>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#B45309', width: 26, textAlign: 'right' }}>{r.count}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 11, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 12, fontWeight: 500, borderRadius: 9, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="warn" size={15} color="#DC2626"></Icon>
        2 proyek masih terhambat — perlu percepatan koordinasi dengan pihak client/vendor.
      </div>
    </Card>
  );
}

function OverviewTab() {
  return (
    <div data-screen-label="Ringkasan" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
      <FeedbackHero></FeedbackHero>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 13 }}>
        {WISESA.kpis.map((k) => <KpiCard key={k.key} k={k}></KpiCard>)}
      </div>
      <MilestoneRow></MilestoneRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 15, alignItems: 'stretch' }}>
        <DevSlaCard></DevSlaCard>
        <UatRescheduledCard></UatRescheduledCard>
      </div>
      <YoyDevSlaCard></YoyDevSlaCard>
    </div>
  );
}

Object.assign(window, { OverviewTab });
