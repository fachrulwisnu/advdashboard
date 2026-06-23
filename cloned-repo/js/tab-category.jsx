// ADV — Category & Division (Kategori & Divisi)
function SummaryCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      {WISESA.categoryCards.map((c, i) => (
        <div key={i} className="ws-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 15 }}>
          <span style={{ width: 46, height: 46, borderRadius: 12, background: `${c.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={c.icon} size={23} color={c.color}></Icon>
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: isNaN(parseInt(c.value)) ? 18 : 27, fontWeight: 800, color: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.05 }}>{c.value}</span>
              {c.value2 ? <span style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{c.value2}</span> : null}
            </div>
            <div style={{ fontSize: 13.5, color: '#9CA3AF', marginTop: 6 }}>{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryBars() {
  const max = Math.max(...WISESA.categories.map((c) => c.value));
  return (
    <Card title="Projects by Category" subtitle="Sepanjang waktu · 8 kategori">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, padding: '4px 0' }}>
        {WISESA.categories.map((c, i) => <HBarRow key={i} label={c.label} value={c.value} max={max} color={c.color} labelWidth={120}></HBarRow>)}
      </div>
    </Card>
  );
}

function StatusPieCard() {
  const total = WISESA.statusPie.reduce((s, x) => s + x.value, 0);
  return (
    <Card title="Status Distribution" subtitle={`${total} proyek sepanjang waktu`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '4px 0' }}>
        <PieChart segments={WISESA.statusPie} size={158}></PieChart>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
          {WISESA.statusPie.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flexShrink: 0 }}></span>
              <span style={{ flex: 1, fontSize: 12.5, color: '#6B7280' }}>{s.label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>{s.value}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', width: 38, textAlign: 'right' }}>{((s.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function PriorityDonutCard() {
  const total = WISESA.priorities.reduce((s, x) => s + x.value, 0);
  return (
    <Card title="Priority Mix" subtitle="Prioritas dilaporkan saat intake">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '4px 0' }}>
        <DonutChart segments={WISESA.priorities} centerTop={total} centerSub="proyek" size={150} thickness={22}></DonutChart>
        <Legend items={WISESA.priorities.map((p) => ({ color: p.color, label: p.label, value: p.value }))}></Legend>
      </div>
    </Card>
  );
}

function DivisionBars() {
  const max = Math.max(...WISESA.divisions.map((d) => d.value));
  return (
    <Card title="Requests by Division" subtitle="10 divisi peminta terbanyak, sepanjang waktu">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
        {WISESA.divisions.map((d, i) => <HBarRow key={i} label={d.label} value={d.value} max={max} color={d.color} labelWidth={86} highlight={i === 0}></HBarRow>)}
      </div>
    </Card>
  );
}

function LeaderboardCard() {
  return (
    <Card title="Division SLA Leaderboard" subtitle="Ketercapaian DEV SLA per divisi peminta · BPD di puncak">
      <table className="ws-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Divisi</th>
            <th style={{ width: '38%' }}>DEV SLA</th>
            <th style={{ width: 90, textAlign: 'right' }}>Gagal</th>
            <th style={{ width: 90, textAlign: 'right' }}>Dievaluasi</th>
          </tr>
        </thead>
        <tbody>
          {WISESA.leaderboard.map((r) => {
            const color = r.sla >= 97 ? '#10B981' : r.sla >= 92 ? '#2563EB' : '#F59E0B';
            return (
              <tr key={r.rank} style={r.pinned ? { background: '#EFF4FE' } : null}>
                <td>
                  <span style={{ display: 'inline-flex', width: 23, height: 23, borderRadius: 999, alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 800, background: r.pinned ? '#2563EB' : r.rank <= 3 ? '#EFF4FE' : '#F3F4F6', color: r.pinned ? '#fff' : r.rank <= 3 ? '#2563EB' : '#9CA3AF' }}>{r.rank}</span>
                </td>
                <td style={{ fontWeight: r.pinned ? 800 : 600, color: r.pinned ? '#1E40AF' : '#374151' }}>{r.division}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, background: r.pinned ? '#DBEAFE' : '#F1F3F7', borderRadius: 999, height: 7 }}>
                      <div style={{ width: `${r.sla}%`, height: '100%', borderRadius: 999, background: color }}></div>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', width: 40, textAlign: 'right' }}>{r.sla}%</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', color: r.not > 0 ? '#DC2626' : '#9CA3AF', fontWeight: r.not > 0 ? 700 : 400 }}>{r.not}</td>
                <td style={{ textAlign: 'right', color: '#6B7280' }}>{r.evaluated}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function ActiveSplitCard({ title, data }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <Card title={title} subtitle="Hanya proyek aktif">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
        {data.map((d, i) => <HBarRow key={i} label={d.label} value={d.value} max={max} color="#2563EB" labelWidth={110}></HBarRow>)}
      </div>
    </Card>
  );
}

function CategoryTab() {
  return (
    <div data-screen-label="Kategori & Divisi" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
      <SummaryCards></SummaryCards>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
        <CategoryBars></CategoryBars>
        <StatusPieCard></StatusPieCard>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
        <PriorityDonutCard></PriorityDonutCard>
        <ActiveSplitCard title="Active by Type" data={WISESA.activeByType}></ActiveSplitCard>
        <ActiveSplitCard title="Active by Division" data={WISESA.activeByDivision}></ActiveSplitCard>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 15 }}>
        <DivisionBars></DivisionBars>
        <LeaderboardCard></LeaderboardCard>
      </div>
    </div>
  );
}

Object.assign(window, { CategoryTab });
