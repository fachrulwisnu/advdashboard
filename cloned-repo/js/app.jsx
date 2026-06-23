// ADV — app shell: 1920×1080 scaled frame + tab router + tweaks
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2563EB",
  "density": 1,
  "showSubtitles": true
}/*EDITMODE-END*/;

const FRAME_W = 1920, FRAME_H = 1080;

function useFrameScale() {
  const { useState, useEffect } = React;
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
}

function ADVApp() {
  const { useState, useEffect } = React;
  const [tab, setTabState] = useState(() => {
    try { return localStorage.getItem('adv-tab') || 'overview'; } catch (e) { return 'overview'; }
  });
  const [projectFilter, setProjectFilter] = useState('Semua');
  const [dataVersion, setDataVersion] = useState(0);
  const setTab = (t) => { setTabState(t); try { localStorage.setItem('adv-tab', t); } catch (e) {} };
  const goProjects = (status) => { setProjectFilter(status || 'Semua'); setTab('projects'); };

  const onUpload = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result);
          Object.assign(window.WISESA, json);
          setDataVersion((v) => v + 1);
        } catch (err) { alert('File JSON tidak valid.'); }
      };
      reader.readAsText(f);
    };
    inp.click();
  };
  const onExport = () => {
    const blob = new Blob([JSON.stringify(window.WISESA, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'adv-dashboard-data.json';
    a.click();
  };

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => {
    document.documentElement.style.setProperty('--ws-accent', tweaks.accent);
    document.documentElement.style.setProperty('--ws-card-pad', `${Math.round(20 * tweaks.density)}px`);
    document.documentElement.classList.toggle('ws-hide-subtitles', !tweaks.showSubtitles);
  }, [tweaks]);

  const scale = useFrameScale();

  const meta = {
    overview: { title: 'Overview', subtitle: 'Kesehatan portofolio sekilas · Laporan 17 Juni 2026' },
    pipeline: { title: 'Pipeline', subtitle: 'Intake, antrian, dan throughput pengiriman' },
    sla: { title: 'SLA Performance', subtitle: 'Ketercapaian per tahap, kegagalan, dan akar penyebab' },
    projects: { title: 'Projects', subtitle: 'Daftar induk proyek — bisa dicari & difilter' },
    category: { title: 'Category & Division', subtitle: 'Komposisi permintaan dan kinerja divisi' }
  }[tab];

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})`, transformOrigin: 'center center', background: '#F5F6FA', display: 'flex', overflow: 'hidden', boxShadow: '0 20px 80px rgba(0,0,0,.4)' }}>
        <NavContext.Provider value={{ goProjects }}>
          <Sidebar tab={tab} setTab={setTab}></Sidebar>
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: FRAME_H }}>
            <div style={{ padding: '24px 30px 0' }}>
              <Header title={meta.title} subtitle={meta.subtitle} onUpload={onUpload} onExport={onExport}></Header>
            </div>
            <div key={dataVersion} className="ws-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 30px 30px' }}>
              {tab === 'overview' ? <OverviewTab></OverviewTab> : null}
              {tab === 'pipeline' ? <PipelineTab></PipelineTab> : null}
              {tab === 'sla' ? <SlaTab></SlaTab> : null}
              {tab === 'projects' ? <ProjectsTab statusFilter={projectFilter} setStatusFilter={setProjectFilter}></ProjectsTab> : null}
              {tab === 'category' ? <CategoryTab></CategoryTab> : null}
            </div>
          </main>
        </NavContext.Provider>
      </div>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Tema"></TweakSection>
        <TweakColor label="Accent" value={tweaks.accent} onChange={(v) => setTweak('accent', v)} options={['#2563EB', '#0F766E', '#7C3AED']}></TweakColor>
        <TweakSlider label="Card padding" min={0.8} max={1.2} step={0.05} value={tweaks.density} onChange={(v) => setTweak('density', v)}></TweakSlider>
        <TweakToggle label="Subtitle kartu" value={tweaks.showSubtitles} onChange={(v) => setTweak('showSubtitles', v)}></TweakToggle>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ADVApp></ADVApp>);
