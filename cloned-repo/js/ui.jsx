// Wisesa — shared UI: icons, pills, cards, sidebar, header
function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 1.8 }) {
  const p = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const icons = {
    grid: <g {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></g>,
    layers: <g {...p}><path d="M12 3 L21 8 L12 13 L3 8 Z"></path><path d="M3 13 L12 18 L21 13"></path></g>,
    gauge: <g {...p}><circle cx="12" cy="13" r="8"></circle><path d="M12 13 L16 9"></path></g>,
    folder: <g {...p}><path d="M3 6 a2 2 0 0 1 2 -2 h4 l2 2 h8 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 Z"></path></g>,
    pie: <g {...p}><circle cx="12" cy="12" r="9"></circle><path d="M12 3 V12 L19 17"></path></g>,
    settings: <g {...p}><circle cx="12" cy="12" r="3.2"></circle><path d="M12 2.5 V6 M12 18 V21.5 M2.5 12 H6 M18 12 H21.5 M5 5 L7.5 7.5 M16.5 16.5 L19 19 M19 5 L16.5 7.5 M7.5 16.5 L5 19"></path></g>,
    help: <g {...p}><circle cx="12" cy="12" r="9"></circle><path d="M9.5 9.5 a2.5 2.5 0 1 1 3.4 2.3 c-.7.3-.9.8-.9 1.7"></path><circle cx="12" cy="17" r="0.5" fill={color}></circle></g>,
    inbox: <g {...p}><path d="M3 13 h5 l1.5 2.5 h5 L16 13 h5"></path><path d="M5 5 h14 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 V7 a2 2 0 0 1 2 -2 Z"></path></g>,
    play: <g {...p}><circle cx="12" cy="12" r="9"></circle><path d="M10 8.5 L15.5 12 L10 15.5 Z"></path></g>,
    'check-square': <g {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="3"></rect><path d="M8.5 12 L11 14.5 L15.5 9.5"></path></g>,
    activity: <g {...p}><path d="M3 12 h4 l2.5 -6 l4 12 l2.5 -6 h5"></path></g>,
    pause: <g {...p}><circle cx="12" cy="12" r="9"></circle><path d="M9.8 8.5 V15.5 M14.2 8.5 V15.5"></path></g>,
    search: <g {...p}><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16 L21 21"></path></g>,
    eye: <g {...p}><path d="M2.5 12 C5 7 8.5 4.8 12 4.8 S19 7 21.5 12 C19 17 15.5 19.2 12 19.2 S5 17 2.5 12 Z"></path><circle cx="12" cy="12" r="3"></circle></g>,
    x: <g {...p}><path d="M6 6 L18 18 M18 6 L6 18"></path></g>,
    download: <g {...p}><path d="M12 3 V14 M7.5 10 L12 14.5 L16.5 10"></path><path d="M4 17 v2.5 a1.5 1.5 0 0 0 1.5 1.5 h13 a1.5 1.5 0 0 0 1.5 -1.5 V17"></path></g>,
    upload: <g {...p}><path d="M12 15 V3.5 M7.5 8 L12 3.5 L16.5 8"></path><path d="M4 17 v2.5 a1.5 1.5 0 0 0 1.5 1.5 h13 a1.5 1.5 0 0 0 1.5 -1.5 V17"></path></g>,
    folder2: <g {...p}><path d="M3 6 a2 2 0 0 1 2 -2 h4 l2 2 h8 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 Z"></path></g>,
    chevron: <g {...p}><path d="M9 6 L15 12 L9 18"></path></g>,
    warn: <g {...p}><path d="M12 3.5 L22 20 H2 Z"></path><path d="M12 9.5 V14"></path><circle cx="12" cy="17" r="0.5" fill={color}></circle></g>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{icons[name] || null}</svg>;
}

const STATUS_KINDS = {
  blue: { bg: '#EFF4FE', fg: '#2563EB' },
  green: { bg: '#ECFDF5', fg: '#059669' },
  amber: { bg: '#FFFBEB', fg: '#B45309' },
  red: { bg: '#FEF2F2', fg: '#DC2626' },
  gray: { bg: '#F3F4F6', fg: '#6B7280' }
};

function Pill({ kind = 'gray', children, small }) {
  const c = STATUS_KINDS[kind] || STATUS_KINDS.gray;
  return (
    <span style={{ display: 'inline-block', background: c.bg, color: c.fg, fontWeight: 600, fontSize: small ? 11 : 12, padding: small ? '2px 9px' : '3px 11px', borderRadius: 999, whiteSpace: 'nowrap' }}>{children}</span>);

}

function StagePill({ stage, ok }) {
  if (ok === null || ok === undefined) {
    return <span style={{ display: 'inline-block', background: '#F3F4F6', color: '#9CA3AF', fontWeight: 600, fontSize: 10, padding: '2px 7px', borderRadius: 999, whiteSpace: 'nowrap' }}>{stage}</span>;
  }
  const c = ok ? STATUS_KINDS.green : STATUS_KINDS.red;
  return <span style={{ display: 'inline-block', background: c.bg, color: c.fg, fontWeight: 700, fontSize: 10, padding: '2px 7px', borderRadius: 999, whiteSpace: 'nowrap' }}>{stage} {ok ? '✓' : '✗'}</span>;
}

function SeverityBadge({ level }) {
  const map = { Critical: STATUS_KINDS.red, High: STATUS_KINDS.amber, Medium: STATUS_KINDS.blue };
  const c = map[level] || STATUS_KINDS.gray;
  return <span style={{ display: 'inline-block', background: c.bg, color: c.fg, fontWeight: 700, fontSize: 10.5, padding: '3px 10px', borderRadius: 999 }}>{level}</span>;
}

function Card({ title, subtitle, children, right, style, accent }) {
  return (
    <div className="ws-card" style={style}>
      {accent ? <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '14px 14px 0 0' }}></div> : null}
      {title ?
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.25 }}>{title}</div>
            {subtitle ? <div style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4, lineHeight: 1.4 }}>{subtitle}</div> : null}
          </div>
          {right || null}
        </div> :
      null}
      {children}
    </div>);

}

function ChipRow({ chips }) {
  return (
    <div style={{ display: 'flex', gap: 13 }}>
      {chips.map((c, i) => (
        <div key={i} className="ws-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color || '#2563EB'}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={c.icon || 'folder'} size={22} color={c.color || '#2563EB'}></Icon>
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 13.5, color: '#6B7280', marginTop: 6 }}>{c.label}</div>
          </div>
        </div>
      ))}
    </div>);

}

function Legend({ items, style }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', ...style }}>
      {items.map((it, i) =>
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: it.color, flexShrink: 0 }}></span>
          <span style={{ fontSize: 12.5, color: '#6B7280' }}>{it.label}</span>
          {it.value != null ? <span style={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>{it.value}</span> : null}
        </div>
      )}
    </div>);

}

const NavContext = React.createContext({ goProjects: () => {} });

const NAV_ITEMS = [
{ id: 'overview', label: 'Overview', icon: 'grid' },
{ id: 'pipeline', label: 'Pipeline', icon: 'layers' },
{ id: 'sla', label: 'SLA Performance', icon: 'gauge' },
{ id: 'projects', label: 'Projects', icon: 'folder' },
{ id: 'category', label: 'Category & Division', icon: 'pie' }];


function NavLabel({ children }) {
  return <div style={{ fontSize: 10.5, fontWeight: 700, color: '#B6BCC8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 14px', margin: '4px 0 8px' }}>{children}</div>;
}

function Sidebar({ tab, setTab }) {
  return (
    <aside style={{ width: 236, flexShrink: 0, background: '#FFFFFF', borderRight: '1px solid #E8EBF0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '22px 20px 18px' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #2563EB, #1E40AF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>A</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.01em' }}>ADV</div>
          <div style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Project Dashboard</div>
        </div>
      </div>
      <div style={{ height: 1, background: '#F1F3F7', margin: '0 16px 14px' }}></div>
      <NavLabel>Navigation</NavLabel>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {NAV_ITEMS.map((it) => {
          const active = tab === it.id;
          return (
            <button key={it.id} onClick={() => setTab(it.id)} className="ws-nav-item" style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9,
              border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
              backgroundColor: active ? '#EFF4FE' : 'transparent',
              color: active ? '#2563EB' : '#6B7280',
              fontWeight: active ? 700 : 500, fontSize: 14, fontFamily: 'inherit',
              transition: 'background-color .15s, color .15s'
            }}>
              <Icon name={it.icon} size={18} strokeWidth={active ? 2 : 1.7}></Icon>
              {it.label}
            </button>);

        })}
      </nav>
      <div style={{ flex: 1 }}></div>
    </aside>);

}

function Header({ title, subtitle, onUpload, onExport }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
      <div style={{ flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{title}</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#9CA3AF' }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#FFFFFF', border: '1px solid #E8EBF0', borderRadius: 10, padding: '10px 16px', width: 360 }}>
          <Icon name="search" size={17} color="#9CA3AF"></Icon>
          <input placeholder="Cari proyek…" style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', color: '#374151', width: '100%', background: 'transparent' }}></input>
        </div>
        <button className="ws-icon-btn" title="Upload JSON" onClick={onUpload}><Icon name="upload" size={19} color="#6B7280"></Icon></button>
        <button className="ws-icon-btn" title="Export all data" onClick={onExport}><Icon name="download" size={19} color="#6B7280"></Icon></button>
      </div>
    </div>);

}

Object.assign(window, { Icon, Pill, StagePill, SeverityBadge, Card, ChipRow, Legend, Sidebar, Header, STATUS_KINDS, NAV_ITEMS, NavContext });