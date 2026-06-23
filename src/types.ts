export interface RawProject {
  "Project Name": string;
  "Ticket": string;
  "Owner Name": string;
  "Owner Div": string;
  "PIC Name": string;
  "PIC Short Name": string;
  "Type Project": string;
  "Last Status": string;
  "Milestone": string;
  "Status PMA": string;
  "Prioritas Mgmt": string;

  "Year": number | null;
  "Period": string | null;
  "Kuartal": string | null;
  "Durasi Project (IT)": string | null;
  "Project diajukan": string | null;
  "Created time": string;
  "Last edited time": string;
  "Final FPS Approved": string;
  "Final FSD Start": string;
  "Tgl FPS disetujui": string;
  "Tgl upload From Feedback ke PMA": string;
  "Tanggal Canceled": string | null;
  "Tanggal Input Caldev": string | null;
  "Tanggal Input Timeline": string | null;

  "(FSD) Elapse Days"?: string | number | null;
  "(FSD) Late Days"?: string | number | null;
  "(FSD) Plan in Week"?: string | null;
  "(FSD) Progress Updated"?: string | null;
  "(FSD) Realized in Date Diisi saat Approval Digital FSD by Owner selesai"?: string | null;
  "(FSD) Status"?: string | null;
  "(FSD) Deskripsi Terlambat >=2022"?: string | null;
  "(FSD) Kategori Alasan Terlambat >=2022"?: string | null;
  "FSD SLA"?: "Achieved" | "Not Achieved" | "Without" | string;
  "FSD SLA YEAR"?: number | null;
  "FSD Compiler"?: string | null;
  "Selisih Waktu Mulai FSD"?: string | null;
  "Jumlah Reminder FSD"?: number | null;

  "(Dev) Elapse Days"?: string | number | null;
  "(Dev) Late Days"?: string | number | null;
  "(Dev) Plan in Week"?: string | null;
  "(Dev) Progress Updated"?: string | null;
  "(Dev) Realized In Date"?: string | null;
  "(Dev) Status"?: string | null;
  "(Dev) Deskripsi Terlambat >=2022"?: string | null;
  "(Dev) Kategori Alasan Terlambat >=2022"?: string | null;
  "DEV SLA"?: "Achieved" | "Not Achieved" | "Without" | string;
  "DEV SLA YEAR"?: number | null;
  "DEV - SIT %"?: string | null;
  "DEV - SIT SLA"?: string | null;
  "Jumlah Reminder Dev"?: number | null;

  "(SIT) Elapse Days"?: string | number | null;
  "(SIT) Late Days"?: string | number | null;
  "(SIT) Plan in Week"?: string | null;
  "(SIT) Progress Updated"?: string | null;
  "(SIT) Realized in date"?: string | null;
  "(SIT) Status"?: string | null;
  "(SIT) Deskripsi Terlambat >=2022"?: string | null;
  "(SIT) Kategori Alasan Terlambat >=2022"?: string | null;
  "(SIT) Batch.\nMisal isinya :\n1 (21-11-2021 to 24-11-2021)\n2 (28-11-2021 to 01-12-2021)"?: string | null;
  "SIT SLA"?: "Achieved" | "Not Achieved" | "Without" | string;
  "SIT SLA YEAR"?: number | null;
  "SIT Compiler"?: string | null;
  "Jumlah Reminder SIT"?: number | null;

  "(UAT) Elapse Days"?: string | number | null;
  "(UAT) Late Days"?: string | number | null;
  "(UAT) Plan in Week"?: string | null;
  "(UAT) Progress Updated"?: string | null;
  "(UAT) Realized In Date"?: string | null;
  "(UAT) Status"?: string | null;
  "(UAT) Deskripsi Terlambat >=2022"?: string | null;
  "(UAT) Kategori Alasan Terlambat >=2022"?: string | null;
  "(UAT) Batch\nMisal isinya :\n1 (23-11-2021)\n2 (29-11-2021, dilanjutkan 02-12-2021)"?: string | null;
  "UAT SLA"?: "Achieved" | "Not Achieved" | "Without" | string;
  "UAT SLA YEAR"?: number | null;
  "Reschedule UAT"?: number | null;
  "Jumlah Reminder UAT"?: number | null;

  "(Live) Plan in Week"?: string | null;
  "(Live) Plan by User/DocUAT"?: string | null;
  "(Live) Progress Updated"?: string | null;
  "(Live) Realized in date"?: string | null;
  "(Live) Status"?: string | null;
  "(Live) Deskripsi Terlambat >=2022"?: string | null;
  "(Live) Kategori Alasan Terlambat >=2022"?: string | null;
  "Live (Late Days)"?: string | null;
  "Live SLA"?: "Achieved" | "Not Achieved" | "Without" | string;
  "LIVE SLA YEAR"?: number | null;
  "Jumlah Reminder Live"?: number | null;

  "Rata-rata Nilai Feedback User : "?: number | null;
  "Rata-rata Nilai Feedback User New :"?: number | null;
  "Bobot Project "?: string | null;
}

export interface SanitizedProject extends RawProject {
  _year: string;
  _period: string;
  _typeGroup: "Enhance Kecil" | "Project Utama" | "Approval Digital" | "Internal IT" | "Other";
  _lateFSD: number | null;
  _lateDev: number | null;
  _lateSIT: number | null;
  _lateUAT: number | null;
  _lateLive: number | null;
  _achDev: number | null;
  _achFSD: number | null;
  _achLive: number | null;
  _achSIT: number | null;
  _achUAT: number | null;
  _feedback: number | null;
}

export interface DashboardDataset {
  report: {
    date: string;
    newProjects: number;
    activeTotal: number;
    needAttention: number;
  };
  kpis: KpiItem[];
  statusCounts: { label: string; value: number; kind: string }[];
  milestones: MilestoneItem[];
  devSla2026: {
    pct: number;
    achieved: number;
    notAchieved: number;
    target: number;
    missedProjs?: any[];
  };
  yoySla: {
    year: string;
    pct: number;
    color: string;
    inProgress?: number;
    completed?: number;
    totalDelayDays?: number;
  }[];
  feedback: {
    score: string;
    of: number;
    filled: number;
    evaluated: number;
  };
  uatRescheduled: {
    active: number;
    total: number;
    rows: { name: string; status: string; statusKind: string; count: string; originalProject?: any }[];
  };
  goLive: string[];
  pipelineChips: { label: string; value: number; icon: string; color: string }[];
  projectsByYear: { year: string; value: number; color: string; note?: string }[];
  onQueue: {
    total: number;
    types: { label: string; value: number; kind: string }[];
    top: { name: string; status: string; kind: string }[];
  };
  throughput: {
    points: { ym: string; label: string; value: number }[];
    comparison?: { monthIndex: number; monthName: string; val2025: number; val2026: number }[];
  };
  heatmap: { year: string; completed: number; active: number; canceled: number }[];
  depth: { year: string; completed: number; inflight: number }[];
  slaTotal2026: number;
  slaChips: { label: string; value: string | number; icon: string; color: string }[];
  slaStageSummary: { stage: string; pct: number; notAch: number }[];
  devSlaYoY: { year: string; achieved: number; not: number }[];
  rootCause: { label: string; value: number; color: string }[];
  multiStage: {
    name: string;
    stages: [string, number][];
    year: number;
    status: string;
    statusKind: string;
    severity: "Critical" | "High" | "Medium";
  }[];
  phaseDelays: {
    no: number;
    ticket: string;
    name: string;
    period: string;
    stages: [string, number][];
    reason: string;
    days: number;
    status: string;
    statusKind: string;
  }[];
  projectChips: { label: string; value: number; icon: string; color: string }[];
  categoryCards: { label: string; value: string | number; value2?: string; sub: string; icon: string; color: string }[];
  categories: { label: string; value: number; color: string }[];
  statusPie: { label: string; value: number; color: string }[];
  priorities: { label: string; value: number; color: string }[];
  divisions: { label: string; value: number; color: string }[];
  leaderboard: { rank: number; division: string; sla: number; not: number; evaluated: number; pinned?: boolean }[];
  activeByType: { label: string; value: number }[];
  activeByDivision: { label: string; value: number }[];
}

export interface KpiItem {
  key: string;
  label: string;
  value: number;
  sub: string;
  color: string;
  icon: string;
  filter: string;
  highlight?: boolean;
  split?: { label: string; value: number }[];
}

export interface MilestoneItem {
  stage: string;
  pct: number;
  notAch: number;
  color: string;
}
