// Wisesa/ADV Project Dashboard — data driven by Weekly Report 17 Juni 2026
window.WISESA = {
  report: {
    date: '17 Juni 2026',
    newProjects: 3,
    activeTotal: 50,
    needAttention: 2
  },

  // ---- OVERVIEW: KPI snapshot (status proyek aktif) ----
  // each card links into Projects tab filtered by `filter`
  kpis: [
    { key: 'queue', label: 'Queue', value: 5, sub: 'Waiting to start', color: '#2563EB', icon: 'inbox', filter: 'Antrian' },
    { key: 'progress', label: 'In Progress', value: 25, sub: 'FSD · Dev · SIT', color: '#2563EB', icon: 'play', highlight: true, filter: 'Dalam Proses' },
    { key: 'uat', label: 'UAT', value: 5, sub: 'Queue & in progress', color: '#F59E0B', icon: 'check-square', filter: 'UAT' },
    { key: 'monitoring', label: 'Monitoring', value: 6, sub: 'Post go-live', color: '#10B981', icon: 'activity', filter: 'Monitoring' },
    { key: 'hold', label: 'Hold', value: 5, sub: 'Owner 3 · Vendor 2', color: '#EF4444', icon: 'pause', filter: 'Hold', split: [
      { label: 'Hold by Owner', value: 3 },
      { label: 'Hold by Client/Vendor', value: 2 }
    ] }
  ],

  // full status list dari laporan (untuk Projects + Category)
  statusCounts: [
    { label: 'FPS', value: 1, kind: 'blue' },
    { label: 'On Queue', value: 5, kind: 'gray' },
    { label: 'FSD', value: 11, kind: 'blue' },
    { label: 'Dev', value: 13, kind: 'blue' },
    { label: 'SIT', value: 1, kind: 'blue' },
    { label: 'UAT', value: 5, kind: 'amber' },
    { label: 'Change Request', value: 3, kind: 'amber' },
    { label: 'Hold by Owner', value: 3, kind: 'red' },
    { label: 'Hold by Client/Vendor', value: 2, kind: 'red' },
    { label: 'Live On Queue', value: 0, kind: 'green' },
    { label: 'Live On Monitoring', value: 6, kind: 'green' },
    { label: 'Canceled', value: 6, kind: 'gray' }
  ],

  // ---- Milestone SLA per stage (SLA FSD–Live 2026) ----
  milestones: [
    { stage: 'FSD',  pct: 76,  notAch: 7, color: '#EF4444' },
    { stage: 'DEV',  pct: 92,  notAch: 4, color: '#2563EB' },
    { stage: 'SIT',  pct: 84,  notAch: 4, color: '#F59E0B' },
    { stage: 'UAT',  pct: 100, notAch: 0, color: '#10B981' },
    { stage: 'LIVE', pct: 100, notAch: 0, color: '#10B981' }
  ],

  // SLA DEV 2026 (sebelumnya DEV–SIT)
  devSla2026: { pct: 92, achieved: 46, notAchieved: 4, target: 93 },

  // YoY DEV SLA — perbandingan 2 tahun (2025 vs 2026)
  yoySla: [
    { year: '2025', pct: 97, color: '#2563EB' },
    { year: '2026', pct: 92, color: '#60A5FA' }
  ],

  feedback: { score: '3.67', of: 5, filled: 3, evaluated: 1 },

  uatRescheduled: {
    active: 2, total: 12,
    rows: [
      { name: 'Pembuatan Custom Akses (Sentralisasi POC)', status: 'UAT On Progress', statusKind: 'blue', count: '1×' },
      { name: 'Enhancement Menu Pembatalan ATM CIT', status: 'Change Request', statusKind: 'amber', count: '3×' }
    ]
  },

  // Proyek Go-Live 27 Mei – 17 Juni 2026
  goLive: [
    'Pengajuan Setting Report Custom BA ATM dan CRM Bank Maybank All Cabang',
    'Penambahan tombol duplicate pada menu Lampiran Invoice — Custom Report Setup (CIT) di aplikasi Insyst',
    'Pembuatan menu Penawaran Harga Emas Antam Indonesia',
    'Penyesuaian Web Karir V2',
    'Enhancement pada Accounting System',
    'Penambahan sheet invoice CIT dan CPC di Report Custom BCA',
    'Enhancement Menu DCT Web Monitoring CDC Advance — Phase 2',
    'Enhancement Import Saldo Bank Jateng',
    'Hide Menu Assignment Security DCT SSS'
  ],

  // ---- PIPELINE ----
  pipelineChips: [
    { label: 'Total Projects', value: 520, icon: 'folder', color: '#2563EB' }, { label: 'Completed', value: 459, icon: 'check-square', color: '#10B981' },
    { label: 'Active', value: 50, icon: 'play', color: '#F59E0B' }, { label: 'Canceled', value: 31, icon: 'x', color: '#9CA3AF' }
  ],
  projectsByYear: [
    { year: '2021', value: 31, color: '#2563EB' },
    { year: '2022', value: 22, color: '#2563EB' },
    { year: '2023', value: 15, color: '#2563EB' },
    { year: '2024', value: 22, color: '#2563EB' },
    { year: '2025', value: 39, color: '#2563EB' },
    { year: '2026', value: 26, color: '#F59E0B', note: 'berjalan' }
  ],
  onQueue: {
    total: 5,
    types: [
      { label: 'On Queue', value: 5, kind: 'gray' },
      { label: 'Live On Queue', value: 0, kind: 'green' }
    ],
    top: [
      { name: 'Integrasi Dukcapil e-KTP Fase 2', status: 'On Queue', kind: 'gray' },
      { name: 'Revamp Portal Internal Kepegawaian', status: 'On Queue', kind: 'gray' },
      { name: 'Enhancement Limit Transaksi QRIS', status: 'On Queue', kind: 'gray' }
    ]
  },
  // throughput go-live per bulan (bar chart) — controlled by month/year range filter
  throughput: {
    points: [
      { ym: '2025-01', label: 'Jan 25', value: 2 }, { ym: '2025-02', label: 'Feb 25', value: 2 },
      { ym: '2025-03', label: 'Mar 25', value: 3 }, { ym: '2025-04', label: 'Apr 25', value: 3 },
      { ym: '2025-05', label: 'Mei 25', value: 1 }, { ym: '2025-06', label: 'Jun 25', value: 2 },
      { ym: '2025-07', label: 'Jul 25', value: 2 }, { ym: '2025-08', label: 'Agu 25', value: 5 },
      { ym: '2025-09', label: 'Sep 25', value: 3 }, { ym: '2025-10', label: 'Okt 25', value: 6 },
      { ym: '2025-11', label: 'Nov 25', value: 3 }, { ym: '2025-12', label: 'Des 25', value: 7 },
      { ym: '2026-01', label: 'Jan 26', value: 3 }, { ym: '2026-02', label: 'Feb 26', value: 5 },
      { ym: '2026-03', label: 'Mar 26', value: 7 }, { ym: '2026-04', label: 'Apr 26', value: 5 },
      { ym: '2026-05', label: 'Mei 26', value: 6 }, { ym: '2026-06', label: 'Jun 26', value: 9 }
    ]
  },
  heatmap: [
    { year: '2021', completed: 31, active: 0, canceled: 0 },
    { year: '2022', completed: 22, active: 0, canceled: 0 },
    { year: '2023', completed: 15, active: 0, canceled: 0 },
    { year: '2024', completed: 22, active: 0, canceled: 0 },
    { year: '2025', completed: 38, active: 1, canceled: 0 },
    { year: '2026', completed: 9, active: 50, canceled: 6 }
  ],
  depth: [
    { year: '2025', completed: 38, inflight: 1 },
    { year: '2026', completed: 9, inflight: 50 }
  ],

  // ---- SLA PERFORMANCE ----
  slaTotal2026: 89, // SLA total seluruh tahapan 2026
  slaChips: [
    { label: 'Avg DEV SLA', value: '90%', icon: 'gauge', color: '#2563EB' }, { label: '2026 DEV SLA', value: '92%', icon: 'activity', color: '#10B981' },
    { label: 'Not Achieved', value: 15, icon: 'warn', color: '#EF4444' }, { label: 'Multi-Stage Failures', value: 10, icon: 'layers', color: '#F59E0B' }
  ],
  slaStageSummary: [
    { stage: 'FSD', pct: 76, notAch: 7 },
    { stage: 'Development', pct: 92, notAch: 4 },
    { stage: 'SIT', pct: 84, notAch: 4 },
    { stage: 'UAT', pct: 100, notAch: 0 },
    { stage: 'Live', pct: 100, notAch: 0 }
  ],
  devSlaYoY: [
    { year: '2021', achieved: 27, not: 4 },
    { year: '2022', achieved: 21, not: 1 },
    { year: '2023', achieved: 15, not: 0 },
    { year: '2024', achieved: 21, not: 2 },
    { year: '2025', achieved: 41, not: 2 },
    { year: '2026', achieved: 46, not: 4 }
  ],
  rootCause: [
    { label: 'Planning IT', value: 6, color: '#2563EB' },
    { label: 'Bug/Temuan', value: 4, color: '#F59E0B' },
    { label: 'Scope Change', value: 2, color: '#38BDF8' },
    { label: 'No Info', value: 3, color: '#9CA3AF' }
  ],
  multiStage: [
    { name: 'Integrasi Core Banking API Gateway', stages: [['FSD',0],['DEV',0],['SIT',0],['UAT',1]], year: 2026, status: 'Dev', statusKind: 'blue', severity: 'Critical' },
    { name: 'Enhancement Menu Pembatalan ATM CIT', stages: [['DEV',0],['SIT',0],['UAT',0]], year: 2026, status: 'Change Request', statusKind: 'amber', severity: 'Critical' },
    { name: 'Migrasi Database Treasury', stages: [['FSD',1],['DEV',0],['SIT',0],['UAT',1]], year: 2025, status: 'Live', statusKind: 'green', severity: 'High' },
    { name: 'Pembuatan Custom Akses (Sentralisasi POC)', stages: [['DEV',0],['SIT',1],['UAT',0]], year: 2026, status: 'UAT On Progress', statusKind: 'blue', severity: 'High' },
    { name: 'Otomasi Laporan Regulatori OJK', stages: [['FSD',0],['DEV',0],['SIT',1]], year: 2025, status: 'Live', statusKind: 'green', severity: 'High' },
    { name: 'Revamp Mobile Banking Dashboard', stages: [['DEV',0],['SIT',0],['UAT',1]], year: 2025, status: 'Live', statusKind: 'green', severity: 'High' },
    { name: 'Sistem Antrian Digital Cabang', stages: [['DEV',0],['UAT',0]], year: 2024, status: 'Live', statusKind: 'green', severity: 'Medium' },
    { name: 'Enhancement e-KYC Verification', stages: [['SIT',0],['UAT',0]], year: 2025, status: 'Live', statusKind: 'green', severity: 'Medium' },
    { name: 'Integrasi Payment Gateway QRIS', stages: [['DEV',0],['SIT',0]], year: 2024, status: 'Live', statusKind: 'green', severity: 'Medium' },
    { name: 'Upgrade Infrastruktur VPN Kantor', stages: [['FSD',0],['DEV',0]], year: 2026, status: 'Hold by Owner', statusKind: 'red', severity: 'Medium' }
  ],
  phaseDelays: [
    { no: 1, ticket: '13947602', name: 'Migrasi Database Treasury', period: 'Feb–Jun 2025', stages: [['DEV',0],['SIT',0]], reason: 'Planning IT', days: 21, status: 'Live', statusKind: 'green' },
    { no: 2, ticket: '60285417', name: 'Otomasi Laporan Regulatori OJK', period: 'Mar–Agu 2025', stages: [['DEV',0],['SIT',1]], reason: 'Bug/Temuan', days: 9, status: 'Live', statusKind: 'green' },
    { no: 3, ticket: '84019356', name: 'Revamp Mobile Banking Dashboard', period: 'Apr–Sep 2025', stages: [['DEV',0],['UAT',1]], reason: 'Scope Change', days: 12, status: 'Live', statusKind: 'green' },
    { no: 4, ticket: '25738094', name: 'Enhancement e-KYC Verification', period: 'Mei–Okt 2025', stages: [['SIT',0],['UAT',0]], reason: 'Bug/Temuan', days: 6, status: 'Live', statusKind: 'green' },
    { no: 5, ticket: '97412063', name: 'Penambahan Fitur Notifikasi Push', period: 'Jun–Nov 2025', stages: [['DEV',0]], reason: 'No Info', days: 3, status: 'Live', statusKind: 'green' },
    { no: 6, ticket: '51860927', name: 'Integrasi SLIK Checking Otomatis', period: 'Agu–Des 2025', stages: [['DEV',0],['SIT',1]], reason: 'Planning IT', days: 8, status: 'Live', statusKind: 'green' },
    { no: 7, ticket: '48201793', name: 'Integrasi Core Banking API Gateway', period: 'Jan–Jun 2026', stages: [['FSD',0],['DEV',0]], reason: 'Planning IT', days: 24, status: 'Dev', statusKind: 'blue' },
    { no: 8, ticket: '73920184', name: 'Enhancement Menu Pembatalan ATM CIT', period: 'Jan–Mei 2026', stages: [['DEV',0],['SIT',0]], reason: 'Bug/Temuan', days: 17, status: 'Change Request', statusKind: 'amber' },
    { no: 9, ticket: '10583926', name: 'Pembuatan Custom Akses (Sentralisasi POC)', period: 'Feb–Jun 2026', stages: [['DEV',0]], reason: 'Planning IT', days: 11, status: 'UAT On Progress', statusKind: 'blue' },
    { no: 10, ticket: '64719205', name: 'Dashboard Monitoring Kredit UMKM', period: 'Feb–Jul 2026', stages: [['DEV',0]], reason: 'No Info', days: 5, status: 'Dev', statusKind: 'blue' },
    { no: 11, ticket: '29384715', name: 'Upgrade Infrastruktur VPN Kantor', period: 'Mar–Agu 2026', stages: [['FSD',0],['DEV',0]], reason: 'Planning IT', days: 19, status: 'Hold by Owner', statusKind: 'red' },
    { no: 12, ticket: '85016349', name: 'Otomasi Rekonsiliasi Kartu Debit', period: 'Mar–Jul 2026', stages: [['DEV',0]], reason: 'Scope Change', days: 7, status: 'Dev', statusKind: 'blue' },
    { no: 13, ticket: '37250918', name: 'Enhancement Approval Digital L2', period: 'Apr–Agu 2026', stages: [['DEV',0]], reason: 'Bug/Temuan', days: 2, status: 'FSD', statusKind: 'blue' }
  ],

  // ---- PROJECTS ----
  projectChips: [
    { label: 'Total', value: 520, icon: 'folder', color: '#2563EB' }, { label: 'Active', value: 50, icon: 'play', color: '#F59E0B' }, { label: 'Live', value: 428, icon: 'check-square', color: '#10B981' },
    { label: 'Canceled', value: 31, icon: 'x', color: '#9CA3AF' }, { label: 'UAT Rescheduled', value: 12, icon: 'warn', color: '#8B5CF6' }
  ],
  projects: [
    { no: 1, ticket: '48201793', name: 'Integrasi Core Banking API Gateway', start: '2026-01', period: 'Jan–Jun 2026', type: 'Project Utama', division: 'BPD', status: 'Dev', sla: 'NA', stages: [['FSD',0],['DEV',0],['SIT',0],['UAT',null],['LIVE',null]], delay: 'DEV +24 hari · Planning IT', resched: 0 },
    { no: 2, ticket: '73920184', name: 'Enhancement Menu Pembatalan ATM CIT', start: '2026-01', period: 'Jan–Mei 2026', type: 'Enhance Kecil', division: 'COS', status: 'Change Request', sla: 'NA', stages: [['FSD',1],['DEV',0],['SIT',0],['UAT',0],['LIVE',null]], delay: 'SIT +17 hari · Bug/Temuan', resched: 3 },
    { no: 3, ticket: '10583926', name: 'Pembuatan Custom Akses (Sentralisasi POC)', start: '2026-02', period: 'Feb–Jun 2026', type: 'Internal IT', division: 'IT', status: 'UAT On Progress', sla: 'NA', stages: [['FSD',1],['DEV',0],['SIT',1],['UAT',null],['LIVE',null]], delay: 'DEV +11 hari · Planning IT', resched: 1 },
    { no: 4, ticket: '64719205', name: 'Dashboard Monitoring Kredit UMKM', start: '2026-02', period: 'Feb–Jul 2026', type: 'Project Utama', division: 'BPD', status: 'Dev', sla: 'NA', stages: [['FSD',1],['DEV',0],['SIT',null],['UAT',null],['LIVE',null]], delay: 'DEV +5 hari · No Info', resched: 0 },
    { no: 5, ticket: '29384715', name: 'Upgrade Infrastruktur VPN Kantor', start: '2026-03', period: 'Mar–Agu 2026', type: 'Internal IT', division: 'IT', status: 'Hold by Owner', sla: 'NA', stages: [['FSD',0],['DEV',0],['SIT',null],['UAT',null],['LIVE',null]], delay: 'FSD +19 hari · Planning IT', resched: 0 },
    { no: 6, ticket: '85016349', name: 'Otomasi Rekonsiliasi Kartu Debit', start: '2026-03', period: 'Mar–Jul 2026', type: 'Approval Digital', division: 'Finance', status: 'Dev', sla: 'NA', stages: [['FSD',1],['DEV',0],['SIT',null],['UAT',null],['LIVE',null]], delay: 'DEV +7 hari · Scope Change', resched: 0 },
    { no: 7, ticket: '37250918', name: 'Enhancement Approval Digital L2', start: '2026-04', period: 'Apr–Agu 2026', type: 'Approval Digital', division: 'Finance', status: 'FSD', sla: 'OK', stages: [['FSD',1],['DEV',1],['SIT',null],['UAT',null],['LIVE',null]], delay: '—', resched: 0 },
    { no: 8, ticket: '91648027', name: 'Integrasi Dukcapil e-KTP Fase 2', start: '2026-05', period: 'Mei–Okt 2026', type: 'Project Utama', division: 'BPD', status: 'On Queue', sla: 'OK', stages: [['FSD',null],['DEV',null],['SIT',null],['UAT',null],['LIVE',null]], delay: '—', resched: 0 },
    { no: 9, ticket: '58273910', name: 'Revamp Portal Internal Kepegawaian', start: '2026-05', period: 'Mei–Nov 2026', type: 'Internal IT', division: 'HR', status: 'On Queue', sla: 'OK', stages: [['FSD',null],['DEV',null],['SIT',null],['UAT',null],['LIVE',null]], delay: '—', resched: 0 },
    { no: 10, ticket: '40619285', name: 'Enhancement Limit Transaksi QRIS', start: '2026-06', period: 'Jun–Sep 2026', type: 'Enhance Kecil', division: 'COS', status: 'On Queue', sla: 'OK', stages: [['FSD',null],['DEV',null],['SIT',null],['UAT',null],['LIVE',null]], delay: '—', resched: 0 },
    { no: 11, ticket: '76130498', name: 'FPS Penyesuaian Web Karir V3', start: '2026-06', period: 'Jun–Sep 2026', type: 'Internal IT', division: 'HR', status: 'FPS', sla: 'OK', stages: [['FSD',null],['DEV',null],['SIT',null],['UAT',null],['LIVE',null]], delay: '—', resched: 0 },
    { no: 12, ticket: '13947602', name: 'Migrasi Database Treasury', start: '2025-02', period: 'Feb–Jun 2025', type: 'Project Utama', division: 'Finance', status: 'Live', sla: 'NA', stages: [['FSD',1],['DEV',0],['SIT',0],['UAT',1],['LIVE',1]], delay: 'DEV +21 hari · Planning IT', resched: 1 },
    { no: 13, ticket: '60285417', name: 'Otomasi Laporan Regulatori OJK', start: '2025-03', period: 'Mar–Agu 2025', type: 'Project Utama', division: 'Risk Mgmt', status: 'Live', sla: 'NA', stages: [['FSD',0],['DEV',0],['SIT',1],['UAT',1],['LIVE',1]], delay: 'DEV +9 hari · Bug/Temuan', resched: 2 },
    { no: 14, ticket: '84019356', name: 'Revamp Mobile Banking Dashboard', start: '2025-04', period: 'Apr–Sep 2025', type: 'Project Utama', division: 'BPD', status: 'Live', sla: 'NA', stages: [['FSD',1],['DEV',0],['SIT',0],['UAT',1],['LIVE',1]], delay: 'SIT +12 hari · Scope Change', resched: 1 },
    { no: 15, ticket: '25738094', name: 'Enhancement e-KYC Verification', start: '2025-05', period: 'Mei–Okt 2025', type: 'Enhance Kecil', division: 'COS', status: 'Live', sla: 'NA', stages: [['FSD',1],['DEV',1],['SIT',0],['UAT',0],['LIVE',1]], delay: 'UAT +6 hari · Bug/Temuan', resched: 2 },
    { no: 16, ticket: '97412063', name: 'Penambahan Fitur Notifikasi Push', start: '2025-06', period: 'Jun–Nov 2025', type: 'Enhance Kecil', division: 'Marketing', status: 'Live', sla: 'OK', stages: [['FSD',1],['DEV',1],['SIT',1],['UAT',1],['LIVE',1]], delay: '—', resched: 0 },
    { no: 17, ticket: '51860927', name: 'Integrasi SLIK Checking Otomatis', start: '2025-08', period: 'Agu–Des 2025', type: 'Approval Digital', division: 'Risk Mgmt', status: 'Live', sla: 'NA', stages: [['FSD',1],['DEV',0],['SIT',1],['UAT',1],['LIVE',1]], delay: 'DEV +8 hari · Planning IT', resched: 0 },
    { no: 18, ticket: '38194705', name: 'Sistem Manajemen Aset TI', start: '2025-09', period: 'Sep 2025–Jan 2026', type: 'Internal IT', division: 'IT', status: 'Live On Monitoring', sla: 'OK', stages: [['FSD',1],['DEV',1],['SIT',1],['UAT',1],['LIVE',1]], delay: '—', resched: 0 },
    { no: 19, ticket: '72053861', name: 'Portal Vendor Management', start: '2025-10', period: 'Okt 2025–Mar 2026', type: 'Approval Digital', division: 'Ops', status: 'Live On Monitoring', sla: 'OK', stages: [['FSD',1],['DEV',1],['SIT',1],['UAT',1],['LIVE',1]], delay: '—', resched: 0 },
    { no: 20, ticket: '46920178', name: 'Sistem Antrian Digital Cabang', start: '2024-05', period: 'Mei–Nov 2024', type: 'Project Utama', division: 'Wisesa', status: 'Canceled', sla: 'NA', stages: [['FSD',1],['DEV',0],['SIT',null],['UAT',null],['LIVE',null]], delay: 'Dibatalkan oleh user', resched: 0 }
  ],

  // ---- CATEGORY & DIVISION ----
  categoryCards: [
    { label: 'Kategori', value: 8, sub: 'klasifikasi proyek', icon: 'pie', color: '#2563EB' },
    { label: 'Divisi', value: 14, sub: 'unit peminta', icon: 'layers', color: '#8B5CF6' },
    { label: 'Avg DEV SLA', value: '92%', sub: 'rata-rata 2026', icon: 'gauge', color: '#10B981' },
    { label: 'Terendah', value: 'Risk Mgmt', value2: '89%', sub: 'divisi SLA terendah', icon: 'activity', color: '#F59E0B' }
  ],
  categories: [
    { label: 'Approval Digital', value: 61, color: '#2563EB' },
    { label: 'Enhance Kecil', value: 37, color: '#10B981' },
    { label: 'Project Utama', value: 36, color: '#F59E0B' },
    { label: 'Internal IT', value: 19, color: '#8B5CF6' },
    { label: 'Regulatori', value: 6, color: '#EC4899' },
    { label: 'Infrastruktur', value: 4, color: '#14B8A6' },
    { label: 'Data & Reporting', value: 2, color: '#F97316' },
    { label: 'Keamanan', value: 1, color: '#64748B' }
  ],
  statusPie: [
    { label: 'Live', value: 428, color: '#10B981' },
    { label: 'Canceled', value: 31, color: '#9CA3AF' },
    { label: 'Dalam Proses', value: 25, color: '#2563EB' },
    { label: 'UAT', value: 5, color: '#F59E0B' },
    { label: 'Antrian', value: 5, color: '#60A5FA' },
    { label: 'Monitoring', value: 6, color: '#14B8A6' },
    { label: 'Hold', value: 5, color: '#EF4444' }
  ],
  priorities: [
    { label: 'Medium', value: 195, color: '#F59E0B' },
    { label: 'High', value: 134, color: '#EF4444' },
    { label: 'Low', value: 105, color: '#10B981' },
    { label: 'Other', value: 86, color: '#9CA3AF' }
  ],
  divisions: [
    { label: 'BPD', value: 175, color: '#1D4ED8' },
    { label: 'COS', value: 73, color: '#3B82F6' },
    { label: 'IT', value: 57, color: '#3B82F6' },
    { label: 'Finance', value: 51, color: '#3B82F6' },
    { label: 'HR', value: 40, color: '#3B82F6' },
    { label: 'Risk Mgmt', value: 37, color: '#3B82F6' },
    { label: 'NAM', value: 16, color: '#3B82F6' },
    { label: 'Marketing', value: 14, color: '#3B82F6' },
    { label: 'Ops', value: 14, color: '#3B82F6' },
    { label: 'Wisesa', value: 12, color: '#3B82F6' }
  ],
  // leaderboard — BPD dipin di paling atas (permintaan)
  leaderboard: [
    { rank: 1, division: 'BPD', sla: 94, not: 8, evaluated: 139, pinned: true },
    { rank: 2, division: 'IT', sla: 100, not: 0, evaluated: 41 },
    { rank: 3, division: 'NAM', sla: 100, not: 0, evaluated: 12 },
    { rank: 4, division: 'Marketing', sla: 97, not: 1, evaluated: 11 },
    { rank: 5, division: 'COS', sla: 96, not: 2, evaluated: 58 },
    { rank: 6, division: 'Finance', sla: 93, not: 3, evaluated: 42 },
    { rank: 7, division: 'HR', sla: 92, not: 3, evaluated: 34 },
    { rank: 8, division: 'Wisesa', sla: 91, not: 1, evaluated: 10 },
    { rank: 9, division: 'Ops', sla: 90, not: 1, evaluated: 12 },
    { rank: 10, division: 'Risk Mgmt', sla: 89, not: 3, evaluated: 29 }
  ],
  activeByType: [
    { label: 'Project Utama', value: 13 }, { label: 'Internal IT', value: 11 },
    { label: 'Enhance Kecil', value: 9 }, { label: 'Approval Digital', value: 9 },
    { label: 'Hold', value: 5 }, { label: 'Antrian', value: 3 }
  ],
  activeByDivision: [
    { label: 'BPD', value: 18 }, { label: 'COS', value: 8 }, { label: 'Finance', value: 7 },
    { label: 'Wisesa', value: 5 }, { label: 'HR', value: 4 }, { label: 'Marketing', value: 2 },
    { label: 'IT', value: 4 }, { label: 'Risk Mgmt', value: 2 }
  ]
};
