// ADV — Projects (Proyek)
function statusGroupOf(status) {
  const s = (status || '');
  if (/Queue/i.test(s)) return 'Antrian';
  if (/^(FPS|FSD|Dev|SIT)$/i.test(s)) return 'Dalam Proses';
  if (/UAT/i.test(s)) return 'UAT';
  if (/Monitoring/i.test(s)) return 'Monitoring';
  if (/Hold/i.test(s)) return 'Hold';
  if (/Change Request/i.test(s)) return 'Change Request';
  if (/Canceled/i.test(s)) return 'Canceled';
  if (/Live/i.test(s)) return 'Live';
  return 'Lainnya';
}

function statusKindOfStatus(status) {
  const g = statusGroupOf(status);
  if (g === 'Live' || g === 'Monitoring') return 'green';
  if (g === 'Hold') return 'red';
  if (g === 'Canceled') return 'gray';
  if (g === 'Change Request' || g === 'UAT') return 'amber';
  if (g === 'Antrian') return 'gray';
  return 'blue';
}

function ProjectsTab({ statusFilter, setStatusFilter }) {
  const { useState, useMemo } = React;
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('2026');
  const [type, setType] = useState('Semua');
  const [division, setDivision] = useState('Semua');
  const months = ['2024-01','2024-06','2025-01','2025-06','2026-01','2026-06','2026-12'];
  const monthOpts = ['2024-01','2024-04','2024-08','2025-01','2025-04','2025-08','2025-12','2026-01','2026-03','2026-06','2026-12'];
  const [mFrom, setMFrom] = useState('2024-01');
  const [mTo, setMTo] = useState('2026-12');
  const [page, setPage] = useState(0);
  const perPage = 10;

  const status = statusFilter || 'Semua';
  const setStatus = (v) => { setStatusFilter(v); setPage(0); };

  const years = ['Semua', '2026', '2025', '2024'];
  const statuses = ['Semua', 'Antrian', 'Dalam Proses', 'UAT', 'Monitoring', 'Hold', 'Change Request', 'Live', 'Canceled'];
  const types = ['Semua', 'Project Utama', 'Enhance Kecil', 'Internal IT', 'Approval Digital'];
  const divisions = ['Semua', 'BPD', 'COS', 'IT', 'Finance', 'HR', 'Risk Mgmt', 'Marketing', 'Ops', 'Wisesa'];

  const filtered = useMemo(() => {
    return WISESA.projects.filter((p) => {
      if (query && !(p.name + ' ' + p.ticket + ' ' + p.division).toLowerCase().includes(query.toLowerCase())) return false;
      if (year !== 'Semua' && !(p.ticket.includes(year) || (p.start && p.start.startsWith(year)))) return false;
      if (status !== 'Semua' && statusGroupOf(p.status) !== status) return false;
      if (type !== 'Semua' && p.type !== type) return false;
      if (division !== 'Semua' && p.division !== division) return false;
      if (p.start) { if (p.start < mFrom || p.start > mTo) return false; }
      return true;
    });
  }, [query, year, status, type, division, mFrom, mTo]);

  const pages = Math.max(Math.ceil(filtered.length / perPage), 1);
  const safePage = Math.min(page, pages - 1);
  const view = filtered.slice(safePage * perPage, (safePage + 1) * perPage);

  const reset = () => { setQuery(''); setYear('2026'); setStatus('Semua'); setType('Semua'); setDivision('Semua'); setMFrom('2024-01'); setMTo('2026-12'); setPage(0); };

  const exportCsv = () => {
    const head = ['No', 'Tiket', 'Proyek', 'Periode', 'Tipe', 'Divisi', 'Status', 'SLA', 'Keterlambatan'];
    const lines = [head.join(',')].concat(filtered.map((r) => [r.no, r.ticket, '"' + r.name + '"', r.period, r.type, r.division, r.status, r.sla, '"' + r.delay + '"'].join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'proyek-adv.csv';
    a.click();
  };

  const Select = ({ value, onChange, options, label }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FFFFFF', border: '1px solid #E8EBF0', borderRadius: 9, padding: '8px 11px' }}>
      <span style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 600 }}>{label}</span>
      <select value={value} onChange={(e) => { onChange(e.target.value); setPage(0); }} style={{ border: 'none', outline: 'none', fontSize: 12.5, fontFamily: 'inherit', color: '#374151', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  const monthLabel = (ym) => { const [y, m] = ym.split('-'); return ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][+m - 1] + ' ' + y.slice(2); };

  return (
    <div data-screen-label="Proyek" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
      <ChipRow chips={WISESA.projectChips}></ChipRow>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #E8EBF0', borderRadius: 9, padding: '8px 12px', flex: 1, minWidth: 180 }}>
            <Icon name="search" size={15} color="#9CA3AF"></Icon>
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Cari nama, tiket, divisi…" style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', color: '#374151', width: '100%', background: 'transparent' }}></input>
          </div>
          <Select label="Status" value={status} onChange={setStatus} options={statuses}></Select>
          <Select label="Tipe" value={type} onChange={setType} options={types}></Select>
          <Select label="Divisi" value={division} onChange={setDivision} options={divisions}></Select>
          <Select label="Tahun" value={year} onChange={setYear} options={years}></Select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FFFFFF', border: '1px solid #E8EBF0', borderRadius: 9, padding: '8px 11px' }}>
            <span style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 600 }}>Bulan</span>
            <select value={mFrom} onChange={(e) => { setMFrom(e.target.value); setPage(0); }} style={{ border: 'none', outline: 'none', fontSize: 12.5, fontFamily: 'inherit', color: '#374151', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}>
              {monthOpts.map((o) => <option key={o} value={o}>{monthLabel(o)}</option>)}
            </select>
            <span style={{ color: '#C2C8D2' }}>–</span>
            <select value={mTo} onChange={(e) => { setMTo(e.target.value); setPage(0); }} style={{ border: 'none', outline: 'none', fontSize: 12.5, fontFamily: 'inherit', color: '#374151', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}>
              {monthOpts.map((o) => <option key={o} value={o}>{monthLabel(o)}</option>)}
            </select>
          </label>
          <button onClick={reset} className="ws-btn-ghost">Reset</button>
          <button onClick={exportCsv} className="ws-btn-primary"><Icon name="download" size={14} color="#fff"></Icon> Export CSV</button>
        </div>
        <table className="ws-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}>No</th>
              <th style={{ width: 104 }}>Tiket</th>
              <th>Proyek</th>
              <th style={{ width: 118 }}>Periode</th>
              <th style={{ width: 110 }}>Tipe</th>
              <th style={{ width: 74 }}>Divisi</th>
              <th style={{ width: 130 }}>Status</th>
              <th>Stage SLA</th>
              <th style={{ width: 170 }}>Keterlambatan</th>
            </tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr key={r.no}>
                <td style={{ color: '#9CA3AF' }}>{r.no}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: '#6B7280' }}>{r.ticket}</td>
                <td>
                  <div style={{ fontWeight: 600, color: '#374151' }}>{r.name}</div>
                  {r.resched > 0 ? <div style={{ fontSize: 11, color: '#B45309', fontWeight: 600, marginTop: 2 }}>UAT reschedule {r.resched}×</div> : null}
                </td>
                <td style={{ color: '#6B7280', fontSize: 12 }}>{r.period}</td>
                <td style={{ color: '#6B7280', fontSize: 12 }}>{r.type}</td>
                <td style={{ color: '#6B7280', fontSize: 12 }}>{r.division}</td>
                <td><Pill kind={statusKindOfStatus(r.status)} small>{r.status}</Pill></td>
                <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{r.stages.map(([s, ok], j) => <StagePill key={j} stage={s} ok={ok === null ? null : !!ok}></StagePill>)}</div></td>
                <td style={{ fontSize: 12, color: r.delay === '—' ? '#9CA3AF' : '#B45309', fontWeight: r.delay === '—' ? 400 : 600 }}>{r.delay}</td>
              </tr>
            ))}
            {view.length === 0 ? <tr><td colSpan="9" style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF' }}>Tidak ada proyek yang cocok dengan filter.</td></tr> : null}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 14 }}>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{filtered.length} hasil</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Halaman {safePage + 1} dari {pages}</span>
            <button className="ws-pgbtn" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} style={{ transform: 'rotate(180deg)' }}><Icon name="chevron" size={14} color={safePage === 0 ? '#D1D5DB' : '#6B7280'} strokeWidth={2}></Icon></button>
            <button className="ws-pgbtn" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}><Icon name="chevron" size={14} color={safePage >= pages - 1 ? '#D1D5DB' : '#6B7280'} strokeWidth={2}></Icon></button>
          </div>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { ProjectsTab, statusKindOfStatus, statusGroupOf });
