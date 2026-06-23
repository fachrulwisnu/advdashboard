// ADV — SLA Performance (Kinerja SLA)
function SlaSummaryCard() {
  const total = WISESA.slaTotal2026;
  const stages = WISESA.slaStageSummary;
  return (
    <Card title="Total SLA 2026" subtitle="Ringkasan ketercapaian SLA seluruh tahapan (FSD–Live)">
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ paddingRight: 28, borderRight: '1px solid #F1F3F7', textAlign: 'center' }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{total}%</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>SLA total tercapai</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flex: 1 }}>
          {stages.map((s, i) => {
            const color = s.pct >= 95 ? '#10B981' : s.pct >= 85 ? '#2563EB' : '#F59E0B';
            return (
              <div key={i} style={{ flex: 1, background: '#FAFBFC', border: '1px solid #F1F3F7', borderRadius: 11, padding: '13px 14px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 8 }}>{s.stage}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{s.pct}%</div>
                <div style={{ background: '#F1F3F7', borderRadius: 999, height: 6, marginTop: 9 }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', borderRadius: 999, background: color }}></div>
                </div>
                <div style={{ fontSize: 11, color: s.notAch ? '#DC2626' : '#9CA3AF', marginTop: 7, fontWeight: s.notAch ? 600 : 400 }}>{s.notAch ? `${s.notAch} tidak tercapai` : 'Tercapai penuh'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function RootCauseDonut() {
  const total = WISESA.rootCause.reduce((s, x) => s + x.value, 0);
  return (
    <Card title="Root Cause DEV Delays" subtitle="Penyebab keterlambatan tahap DEV, 2026">
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '6px 0' }}>
        <DonutChart segments={WISESA.rootCause} centerTop={total} centerSub="kasus"></DonutChart>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
          {WISESA.rootCause.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: r.color, flexShrink: 0 }}></span>
              <span style={{ flex: 1, fontSize: 13, color: '#6B7280' }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{r.value}</span>
              <span style={{ fontSize: 11.5, color: '#9CA3AF', width: 34, textAlign: 'right' }}>{Math.round((r.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 12, fontWeight: 500, borderRadius: 9, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="warn" size={15} color="#DC2626"></Icon>
        "Planning IT" jadi penyebab terbesar — perlu penguatan perencanaan di awal proyek.
      </div>
    </Card>
  );
}

function MultiStageTable() {
  return (
    <Card title="Multi-Stage SLA Failures" subtitle="Proyek yang gagal SLA di 2+ tahapan" right={<Pill kind="red">{WISESA.multiStage.length} proyek</Pill>}>
      <table className="ws-table">
        <thead>
          <tr>
            <th style={{ width: '38%' }}>Proyek</th>
            <th>Tahapan Gagal</th>
            <th style={{ width: 56 }}>Tahun</th>
            <th style={{ width: 150 }}>Status</th>
            <th style={{ width: 86 }}>Severity</th>
          </tr>
        </thead>
        <tbody>
          {WISESA.multiStage.map((m, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600, color: '#374151' }}>{m.name}</td>
              <td><div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{m.stages.map(([s, ok], j) => <StagePill key={j} stage={s} ok={!!ok}></StagePill>)}</div></td>
              <td style={{ color: '#6B7280' }}>{m.year}</td>
              <td><Pill kind={m.statusKind} small>{m.status}</Pill></td>
              <td><SeverityBadge level={m.severity}></SeverityBadge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function PhaseDelayTable() {
  const { useState } = React;
  const [page, setPage] = useState(0);
  const perPage = 8;
  const rows = WISESA.phaseDelays;
  const pages = Math.ceil(rows.length / perPage);
  const view = rows.slice(page * perPage, (page + 1) * perPage);
  return (
    <Card title="Phase Delay Detail" subtitle="Rincian tiap tahap terlambat beserta penyebab & jumlah hari"
      right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{page * perPage + 1}–{Math.min((page + 1) * perPage, rows.length)} dari {rows.length}</span>
          <button className="ws-pgbtn" disabled={page === 0} onClick={() => setPage(page - 1)} style={{ transform: 'rotate(180deg)' }}><Icon name="chevron" size={14} color={page === 0 ? '#D1D5DB' : '#6B7280'} strokeWidth={2}></Icon></button>
          <button className="ws-pgbtn" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}><Icon name="chevron" size={14} color={page >= pages - 1 ? '#D1D5DB' : '#6B7280'} strokeWidth={2}></Icon></button>
        </div>
      }>
      <table className="ws-table">
        <thead>
          <tr>
            <th style={{ width: 34 }}>No</th>
            <th style={{ width: 110 }}>Tiket</th>
            <th>Proyek</th>
            <th style={{ width: 120 }}>Periode</th>
            <th>Tahap Terlambat</th>
            <th style={{ width: 100 }}>Penyebab</th>
            <th style={{ width: 70, textAlign: 'right' }}>Delay</th>
            <th style={{ width: 150 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {view.map((r) => (
            <tr key={r.no}>
              <td style={{ color: '#9CA3AF' }}>{r.no}</td>
              <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: '#6B7280' }}>{r.ticket}</td>
              <td style={{ fontWeight: 600, color: '#374151' }}>{r.name}</td>
              <td style={{ color: '#6B7280', fontSize: 12 }}>{r.period}</td>
              <td><div style={{ display: 'flex', gap: 5 }}>{r.stages.map(([s, ok], j) => <StagePill key={j} stage={s} ok={!!ok}></StagePill>)}</div></td>
              <td style={{ color: '#6B7280', fontSize: 12 }}>{r.reason}</td>
              <td style={{ textAlign: 'right', fontWeight: 700, color: r.days >= 15 ? '#DC2626' : r.days >= 8 ? '#B45309' : '#374151' }}>+{r.days}h</td>
              <td><Pill kind={r.statusKind} small>{r.status}</Pill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function SlaTab() {
  return (
    <div data-screen-label="Kinerja SLA" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
      <ChipRow chips={WISESA.slaChips}></ChipRow>
      <SlaSummaryCard></SlaSummaryCard>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 15 }}>
        <Card title="DEV SLA Year-on-Year" subtitle="Tercapai vs tidak tercapai per tahun intake"
          right={<Legend items={[{ color: '#2563EB', label: 'Tercapai' }, { color: '#EF4444', label: 'Tidak tercapai' }]}></Legend>}>
          <GroupedBarChart data={WISESA.devSlaYoY}></GroupedBarChart>
        </Card>
        <RootCauseDonut></RootCauseDonut>
      </div>
      <MultiStageTable></MultiStageTable>
      <PhaseDelayTable></PhaseDelayTable>
    </div>
  );
}

Object.assign(window, { SlaTab });
