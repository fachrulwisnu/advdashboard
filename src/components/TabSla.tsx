import React, { useState, useMemo, useRef, useEffect } from "react";
import { DashboardDataset } from "../types";
import { Card, Icon, Pill } from "./UI";
import { PieChart, GroupedBarChart } from "./Charts";
import { statusKindOfStatus } from "../parser";
import { getActiveSlaPool } from "../utils";


function getProfessionalReason(rawReason: string | null | undefined): string {
  if (!rawReason) return "Lainnya";
  const reason = rawReason.trim().toLowerCase();
  
  if (reason.includes("kesalahan planning") || reason.includes("planning")) return "Penyesuaian estimasi & optimalisasi roadmap pengembangan";
  if (reason.includes("fixing bug") || reason.includes("bug")) return "Optimalisasi arsitektur kode & pengujian kualitas menyeluruh (Quality & Stabilization Cycle)";
  if (reason.includes("requirement change") || reason.includes("change request") || reason.includes("scope")) return "Penyelarasan kebutuhan bisnis & penyesuaian scope berkelanjutan";
  if (reason.includes("waiting owner") || reason.includes("tunggu owner") || reason.includes("owner")) return "Sinkronisasi kebutuhan & penguatan koordinasi antar-stakeholder";
  
  return rawReason;
}

function getBusinessOperationalData(dataset: any[]): any[] {
  if (!dataset || !Array.isArray(dataset)) return [];
  return dataset.filter(item => {
    if (!item || typeof item !== "object") return false;
    const projType = (item["Project Type"] || item["Type"] || item["Type Project"] || "").toString().toUpperCase();
    const division = item["Owner Div"] ? String(item["Owner Div"]).trim().toUpperCase() : "";
    const type = item["Type Project"] ? String(item["Type Project"]).trim().toUpperCase() : "";
    const name = item["Project Name"] ? String(item["Project Name"]).trim().toUpperCase() : "";
    
    if (projType === "INTERNAL IT" || projType === "WISESA" || division === "IT" || division === "INFORMATION TECHNOLOGY" || division === "WISESA") {
      return false;
    }
    
    const isApprovalDigital = type === "APPROVAL DIGITAL" || name.startsWith("APPROVAL DIGITAL");
    return !isApprovalDigital;
  });
}


interface TabSlaProps {
  dataset: DashboardDataset;
  rawProjects?: any[];
  filteredProjects?: any[];
  allProjects?: any[];
  startMonth?: string;
  endMonth?: string;
  startYear?: number;
  endYear?: number;
  onUploadFile?: (file: File) => void;
}

const MONTHS_LOWER: Record<string, number> = {
  jan: 0, januari: 0,
  feb: 1, februari: 1,
  mar: 2, maret: 2,
  apr: 3, april: 3,
  may: 4, mei: 4,
  jun: 5, juni: 5,
  jul: 6, juli: 6,
  aug: 7, agustus: 7,
  sep: 8, september: 8,
  oct: 9, oktober: 9,
  nov: 10, november: 10,
  dec: 11, des: 11, desember: 11
};

function getProjMonthIdx(p: any): number {
  const period = p["Period"] || p["_period"];
  if (!period) return -1;
  const parts = String(period).trim().split("-");
  if (parts.length === 0) return -1;
  const mStr = parts[0].trim().toLowerCase();
  const index = MONTHS_LOWER[mStr];
  return index !== undefined ? index : -1;
}

function isMonthInRange(mIdx: number, startIdx: number, endIdx: number): boolean {
  if (mIdx === -1) return false;
  if (startIdx <= endIdx) {
    return mIdx >= startIdx && mIdx <= endIdx;
  } else {
    return mIdx >= startIdx || mIdx <= endIdx;
  }
}

export function TabSla({
  dataset,
  rawProjects,
  filteredProjects: rawFilteredProjects = [],
  allProjects: rawAllProjects = [],
  startMonth = "Jan",
  endMonth = "Dec",
  startYear = 2026,
  endYear = 2026,
  onUploadFile
}: TabSlaProps) {
  // Exclude Canceled projects from SLA Review Views
  const filteredProjects = useMemo(() => getActiveSlaPool(rawFilteredProjects), [rawFilteredProjects]);
  const allProjects = useMemo(() => getActiveSlaPool(rawAllProjects), [rawAllProjects]);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");
  const [delayPage, setDelayPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [drillDownModal, setDrillDownModal] = useState<"avg" | "2026" | "notAchieved" | "multiStage" | "yoy2025" | "yoy2026" | "rootCause" | null>(null);
  const [clickedRootCause, setClickedRootCause] = useState<string | null>(null);

  // Reset page of delay tracker when query changes
  useEffect(() => {
    setDelayPage(1);
  }, [searchQuery]);

  // Convert start/end months to indices
  const startIdx = useMemo(() => MONTHS_LOWER[startMonth.toLowerCase()] ?? 0, [startMonth]);
  const endIdx = useMemo(() => MONTHS_LOWER[endMonth.toLowerCase()] ?? 11, [endMonth]);

  // 1. Avg DEV SLA metric and related projects inside the active date range filter
  const activeDevSlaProjs = useMemo(() => {
    return filteredProjects.filter(p => p["DEV SLA"] === "Achieved" || (p._lateDev || 0) > 0);
  }, [filteredProjects]);

  const activeDevSlaAchievedCount = useMemo(() => {
    return activeDevSlaProjs.filter(p => p["DEV SLA"] === "Achieved").length;
  }, [activeDevSlaProjs]);

  const overallSlaPct = useMemo(() => {
    return activeDevSlaProjs.length > 0
      ? Math.round((activeDevSlaAchievedCount / activeDevSlaProjs.length) * 100)
      : 0;
  }, [activeDevSlaProjs, activeDevSlaAchievedCount]);

  // 2026 DEV SLA metrics in selected range
  const activeDevSlaProjs2026 = useMemo(() => {
    return filteredProjects.filter(p => {
      const yr = String(p._year || p["Year"]);
      return yr === "2026" && (p["DEV SLA"] === "Achieved" || (p._lateDev || 0) > 0);
    });
  }, [filteredProjects]);

  const activeDevSlaAchievedCount2026 = useMemo(() => {
    return activeDevSlaProjs2026.filter(p => p["DEV SLA"] === "Achieved").length;
  }, [activeDevSlaProjs2026]);

  const devSla2026Pct = useMemo(() => {
    return activeDevSlaProjs2026.length > 0
      ? Math.round((activeDevSlaAchievedCount2026 / activeDevSlaProjs2026.length) * 100)
      : 100; // default to 100 if no data
  }, [activeDevSlaProjs2026, activeDevSlaAchievedCount2026]);

  // 2025 DEV SLA metrics for Like-for-Like period comparison
  const activeDevSlaProjs2025 = useMemo(() => {
    return allProjects.filter(p => {
      const yr = String(p._year || p["Year"]);
      if (yr !== "2025") return false;
      const mIdx = getProjMonthIdx(p);
      return isMonthInRange(mIdx, startIdx, endIdx) && (p["DEV SLA"] === "Achieved" || (p._lateDev || 0) > 0);
    });
  }, [allProjects, startIdx, endIdx]);

  const activeDevSlaAchievedCount2025 = useMemo(() => {
    return activeDevSlaProjs2025.filter(p => p["DEV SLA"] === "Achieved").length;
  }, [activeDevSlaProjs2025]);

  const devSla2025Pct = useMemo(() => {
    return activeDevSlaProjs2025.length > 0
      ? Math.round((activeDevSlaAchievedCount2025 / activeDevSlaProjs2025.length) * 100)
      : 0;
  }, [activeDevSlaProjs2025, activeDevSlaAchievedCount2025]);

  // Define activeFailedProjects exactly as instructed
  const activeFailedProjects = useMemo(() => {
    const sourceData = (window as any).rawMasterDataset || rawProjects || allProjects || filteredProjects || [];
    return getBusinessOperationalData(sourceData).filter(item => {
      const is2026 = (item["Intake"] || item["Year"] || item["_year"] || "").toString().includes("2026");
      const lastStatus = (item["Last Status"] || "").trim().toLowerCase();
      
      const slaState = (item["DEV SLA"] || item["DEV SLA STATE"] || item["SLA Status"] || "").trim().toLowerCase();

      // 1. STRICT EXCLUSION: Terminated or Canceled
      if (lastStatus.includes("cancel") || lastStatus.includes("terminated")) {
        return false;
      }

      // 2. STRICT EXCLUSION: Drop projects that successfully achieved the SLA
      if (slaState === "achieved" || (slaState.includes("achieved") && !slaState.includes("not achieved"))) {
        return false;
      }

      // 3. INCLUSION: Only keep genuine failures
      const isDevFailed = slaState.includes("not achieved") || slaState.includes("failed") || (item._lateDev || 0) > 0;

      return is2026 && isDevFailed;
    });
  }, [rawProjects, allProjects, filteredProjects]);

  // Not Achieved in selected range (mapped directly to activeFailedProjects for system-wide sync)
  const devSlaNotAchievedProjs = activeFailedProjects;

  // Multi Stage Failure in selected range
  const activeMultiStage = useMemo(() => {
    return filteredProjects
      .filter(p => {
        let failedCount = 0;
        if (p["FSD SLA"] === "Not Achieved") failedCount++;
        if (p["DEV SLA"] === "Not Achieved") failedCount++;
        if (p["SIT SLA"] === "Not Achieved") failedCount++;
        if (p["UAT SLA"] === "Not Achieved") failedCount++;
        if (p["Live SLA"] === "Not Achieved") failedCount++;
        return failedCount >= 2;
      })
      .map(p => {
        const stages: [string, number][] = [
          ['FSD', p["FSD SLA"] === "Not Achieved" ? 1 : 0],
          ['DEV', p["DEV SLA"] === "Not Achieved" ? 1 : 0],
          ['SIT', p["SIT SLA"] === "Not Achieved" ? 1 : 0],
          ['UAT', p["UAT SLA"] === "Not Achieved" ? 1 : 0],
          ['LIVE', p["Live SLA"] === "Not Achieved" ? 1 : 0]
        ];
        const failedCount = stages.filter(s => s[1] === 1).length;
        return {
          ticket: p["Ticket"] || "—",
          name: p["Project Name"],
          stages,
          year: p["Year"] || p._year || 2026,
          status: p["Last Status"] || "Unknown",
          statusKind: statusKindOfStatus(p["Last Status"]),
          severity: (failedCount >= 4 ? 'Critical' : failedCount >= 3 ? 'High' : 'Medium') as 'Critical' | 'High' | 'Medium',
          pic: p["PIC Short Name"] || p["PIC Name"] || "—",
          div: p["Owner Div"] || "—"
        };
      });
  }, [filteredProjects]);

  const filteredMultiStage = useMemo(() => {
    return searchQuery.trim() === ""
      ? activeMultiStage
      : activeMultiStage.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(p.year).includes(searchQuery)
        );
  }, [activeMultiStage, searchQuery]);

  // SLA Phase Delay Tracker Table (Dynamic and reactive)
  const dynamicPhaseDelays = useMemo(() => {
    return filteredProjects
      .filter(p => {
        const fsdLate = p._lateFSD || 0;
        const devLate = p._lateDev || 0;
        const sitLate = p._lateSIT || 0;
        const uatLate = p._lateUAT || 0;
        const liveLate = p._lateLive || 0;
        return (fsdLate + devLate + sitLate + uatLate + liveLate) > 0;
      })
      .map(p => {
        const fsdLate = p._lateFSD || 0;
        const devLate = p._lateDev || 0;
        const sitLate = p._lateSIT || 0;
        const uatLate = p._lateUAT || 0;
        const liveLate = p._lateLive || 0;
        const totalDelay = fsdLate + devLate + sitLate + uatLate + liveLate;

        const stages: [string, number][] = [];
        if (fsdLate > 0) stages.push(['FSD', fsdLate]);
        if (devLate > 0) stages.push(['DEV', devLate]);
        if (sitLate > 0) stages.push(['SIT', sitLate]);
        if (uatLate > 0) stages.push(['UAT', uatLate]);
        if (liveLate > 0) stages.push(['LIVE', liveLate]);

        return {
          ticket: p["Ticket"] || "—",
          name: p["Project Name"],
          period: p["Durasi Project (IT)"] || p._period || "—",
          stages,
          reason: p["(Dev) Kategori Alasan Terlambat >=2022"] || p["(FSD) Kategori Alasan Terlambat >=2022"] || "Planning IT",
          days: totalDelay,
          status: p["Last Status"] || "Unknown",
          statusKind: statusKindOfStatus(p["Last Status"]),
          pic: p["PIC Short Name"] || p["PIC Name"] || "—",
          div: p["Owner Div"] || "—"
        };
      })
      .sort((a, b) => b.days - a.days)
      .map((item, idx) => ({
        no: idx + 1,
        ...item
      }));
  }, [filteredProjects]);

  const filteredPhaseDelays = useMemo(() => {
    return searchQuery.trim() === ""
      ? dynamicPhaseDelays
      : dynamicPhaseDelays.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.ticket.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.reason.toLowerCase().includes(searchQuery.toLowerCase())
        );
  }, [dynamicPhaseDelays, searchQuery]);

  // SLA Phase Delay Tracker Pagination
  const pageSize = 5;
  const totalDelayPages = Math.max(Math.ceil(filteredPhaseDelays.length / pageSize), 1);
  const paginatedPhaseDelays = useMemo(() => {
    const sIdx = (delayPage - 1) * pageSize;
    return filteredPhaseDelays.slice(sIdx, sIdx + pageSize);
  }, [filteredPhaseDelays, delayPage]);

  // Recalculate average delay count from active delays table
  const totalDelayedCount = filteredPhaseDelays.length;
  const avgDelayCount = totalDelayedCount > 0
    ? Math.round(filteredPhaseDelays.reduce((acc, p) => acc + p.days, 0) / totalDelayedCount)
    : 0;

  // SLA Stage Performance Horizontal metrics (Dynamic recalculation - centralized)
  const dynamicSlaStageSummary = useMemo(() => {
    return dataset.slaStageSummary || [];
  }, [dataset.slaStageSummary]);

  // Delay Root Cause Pie Chart Dynamic re-rendering
  const dynamicRootCause = useMemo(() => {
    const counts: Record<string, number> = {};
    activeFailedProjects.forEach(p => {
      const cause = p["(Dev) Kategori Alasan Terlambat >=2022"] || "No Info";
      const profCause = getProfessionalReason(cause);
      counts[profCause] = (counts[profCause] || 0) + 1;
    });

    const pieChartColors = [
      "#6366f1", // Indigo-500
      "#14b8a6", // Teal-500
      "#f59e0b", // Amber-500
      "#ec4899", // Pink-500
      "#8b5cf6"  // Violet-500
    ];

    return Object.keys(counts).map(k => ({
      label: k,
      value: counts[k]
    }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      color: pieChartColors[index % pieChartColors.length]
    }));
  }, [activeFailedProjects]);

  const totalPieProjects = useMemo(() => {
    return activeFailedProjects.length;
  }, [activeFailedProjects]);

  // YoY Growth Trend Comparison Bar Chart (strictly 2025 vs 2026 like-for-like)
  const yoyCompareData = useMemo(() => {
    const projs2025 = activeDevSlaProjs2025;
    const achieved25 = activeDevSlaAchievedCount2025;
    const notAchieved25 = projs2025.filter(p => (p._lateDev || 0) > 0).length;

    const projs2026 = activeDevSlaProjs2026;
    const achieved26 = activeDevSlaAchievedCount2026;
    const notAchieved26 = activeFailedProjects.length;

    return [
      { year: "2025", achieved: achieved25, not: notAchieved25, projects: projs2025 },
      { year: "2026", achieved: achieved26, not: notAchieved26, projects: activeFailedProjects }
    ];
  }, [activeDevSlaProjs2025, activeDevSlaAchievedCount2025, activeDevSlaProjs2026, activeDevSlaAchievedCount2026, activeFailedProjects]);

  // File Download Handler
  const handleDownloadJSON = () => {
    if (!rawProjects) return;
    const blob = new Blob([JSON.stringify(rawProjects, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ADV_SLA_Database_${dataset.report.date.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Determine subtext YoY sign
  const diffPct26vs25 = devSla2026Pct - devSla2025Pct;
  const diffSign = diffPct26vs25 >= 0 ? "+" : "";

  // Dynamic Pop-up Modal selector data helper
  const getModalProjects = () => {
    switch (drillDownModal) {
      case "avg":
        return activeDevSlaProjs;
      case "2026":
        return activeDevSlaProjs2026;
      case "notAchieved":
        return devSlaNotAchievedProjs;
      case "multiStage":
        return activeMultiStage;
      case "yoy2025":
        return yoyCompareData[0].projects;
      case "yoy2026":
        return yoyCompareData[1].projects;
      case "rootCause":
        return filteredProjects.filter(p => {
          const devLate = p._lateDev || 0;
          if (devLate <= 0) return false;
          const cause = p["(Dev) Kategori Alasan Terlambat >=2022"] || "No Info";
          const profCause = getProfessionalReason(cause);
          return profCause === clickedRootCause;
        });
      default:
        return [];
    }
  };

  const modalList = getModalProjects();

  return (
    <div className="space-y-6">
      {/* Dynamic Header Block of SLA View */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl font-extrabold font-display text-gray-900 tracking-tight">
            Analisis Performansi SLA
          </h1>
          <p className="text-xs text-gray-400 font-medium font-sans mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Weekly Report Periode {dataset.report.date} • {filteredProjects.length} Proyek Terfilter
          </p>
        </div>

        {/* Search tool block and custom isomorphic upload inputs */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Interactive Search Bar */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Icon name="search" className="w-3.5 h-3.5 pointer-events-none" />
            </div>
            <input
              type="text"
              placeholder="Cari proyek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 focus:bg-white rounded-xl w-full focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-inner placeholder-gray-400 font-semibold font-sans transition-all text-gray-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Controllers */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0] && onUploadFile) {
                  onUploadFile(e.target.files[0]);
                }
              }}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Unggah File JSON Kustom"
              className="p-2.5 h-9.5 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:shadow-xs shadow-xs"
            >
              <Icon name="upload" className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadJSON}
              disabled={!rawProjects}
              title="Unduh File Database Aktif"
              className="p-2.5 h-9.5 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:shadow-xs shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="download" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Professional KPI Row Cards (All Clickable with custom scale layout transformations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* KPI 1: Avg DEV SLA */}
        <button
          onClick={() => setDrillDownModal("avg")}
          className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex items-center gap-4 hover:border-blue-200 hover:shadow-md active:scale-98 text-left focus:outline-none transition-all duration-250 select-none cursor-pointer w-full"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100/50">
            <Icon name="clock" className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[25px] font-extrabold text-gray-900 leading-none font-display tracking-tight flex items-baseline gap-1">
              {overallSlaPct}%
            </h4>
            <p className="text-[10px] font-extrabold text-gray-400 mt-1.5 uppercase tracking-wider font-sans whitespace-nowrap">
              Avg DEV SLA
            </p>
            <p className="text-[9.5px] font-semibold text-blue-600 mt-0.5 font-sans flex items-center gap-0.5">
              <span>Rerata Evaluasi</span>
              <Icon name="chevron" className="w-2.5 h-2.5 shrink-0 rotate-90" />
            </p>
          </div>
        </button>

        {/* KPI 2: 2026 Avg DEV SLA (Featuring Data Mapping Fix and Comparison YoY view block) */}
        <button
          onClick={() => setDrillDownModal("2026")}
          className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex items-center gap-4 hover:border-emerald-200 hover:shadow-md active:scale-98 text-left focus:outline-none transition-all duration-250 select-none cursor-pointer w-full"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#10B981] border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <Icon name="activity" className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 justify-between">
              <h4 className="text-[25px] font-extrabold text-gray-900 leading-none font-display tracking-tight">
                {devSla2026Pct}%
              </h4>
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                diffPct26vs25 >= 0 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                  : "bg-rose-50 text-rose-800 border-rose-100"
              }`}>
                {diffSign}{diffPct26vs25}% YoY
              </span>
            </div>
            <p className="text-[10px] font-extrabold text-gray-400 mt-1.5 uppercase tracking-wider font-sans">
              2026 DEV SLA
            </p>
            <p className="text-[9.5px] text-gray-500 font-medium font-sans mt-0.5 truncate">
              vs 2025: <span className="font-bold text-gray-750">{devSla2025Pct}%</span> (Period-match)
            </p>
          </div>
        </button>

        {/* KPI 3: Total SLA Not Achieved */}
        <button
          onClick={() => setDrillDownModal("notAchieved")}
          className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex items-center gap-4 hover:border-rose-200 hover:shadow-md active:scale-98 text-left focus:outline-none transition-all duration-250 select-none cursor-pointer w-full"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#EF4444] border border-rose-100 flex items-center justify-center flex-shrink-0">
            <Icon name="warn" className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[25px] font-extrabold text-gray-900 leading-none font-display tracking-tight text-rose-600">
              {activeFailedProjects.length}
            </h4>
            <p className="text-[10px] font-extrabold text-gray-400 mt-1.5 uppercase tracking-wider font-sans">
              Not Achieved
            </p>
            <p className="text-[9.5px] text-rose-500 font-semibold mt-0.5 font-sans flex items-center gap-0.5">
              <span>Proyek Telat</span>
              <Icon name="chevron" className="w-2.5 h-2.5 shrink-0 rotate-90" />
            </p>
          </div>
        </button>

        {/* KPI 4: Multi-Stage Failures */}
        <button
          onClick={() => setDrillDownModal("multiStage")}
          className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex items-center gap-4 hover:border-amber-200 hover:shadow-md active:scale-98 text-left focus:outline-none transition-all duration-250 select-none cursor-pointer w-full"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D97706] border border-amber-100 flex items-center justify-center flex-shrink-0">
            <Icon name="layers" className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[25px] font-extrabold text-gray-900 leading-none font-display tracking-tight text-amber-700">
              {activeMultiStage.length}
            </h4>
            <p className="text-[10px] font-extrabold text-gray-400 mt-1.5 uppercase tracking-wider font-sans">
              Multi-Stage Failures
            </p>
            <p className="text-[9.5px] text-amber-600 font-semibold mt-0.5 font-sans flex items-center gap-0.5">
              <span>Keterlambatan Berantai</span>
              <Icon name="chevron" className="w-2.5 h-2.5 shrink-0 rotate-90" />
            </p>
          </div>
        </button>

      </div>

      {/* Main Grid: Achievement Progress & Root Causes Delay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* SLA Stage Performance Horizontal bars Row Card (Left - Fully linked to dynamic Month range) */}
        <div className="lg:col-span-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card
            title="SLA Stage Performance"
            sub="Persentase pemenuhan target SLA per tahapan pengembangan (Terfilter)"
            padding="p-6"
            className="h-full"
          >
            <div className="flex flex-col justify-space-around h-full space-y-4">
              {dynamicSlaStageSummary.map((s, idx) => {
                const names: Record<string, string> = {
                  FSD: "FSD",
                  DEV: "Development",
                  SIT: "SIT",
                  UAT: "UAT",
                  LIVE: "Live",
                };
                const longName = names[s.stage] || s.stage;
                const isGreenBar = s.stage === "UAT" || s.stage === "LIVE";

                return (
                  <div key={idx} className="flex items-center justify-between gap-4 select-none">
                    {/* Stage Label */}
                    <span className="w-24 text-[13px] font-bold text-gray-500 font-sans">
                      {longName}
                    </span>
                    {/* Progress Bar Container */}
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${s.pct}%`,
                          backgroundColor: isGreenBar ? "#10B981" : "#2563EB",
                        }}
                      />
                    </div>
                    {/* Percent Text */}
                    <span className="w-12 text-right text-[13px] font-bold text-gray-900 font-mono">
                      {s.pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Delay Root Cause Card with solid clean Pie Chart (Right - Fully dynamic & responsive) */}
        <div className="lg:col-span-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card
            title="Delay Root Cause (Faktor Utama)"
            sub="Pembagian kategori penyebab kegagalan SLA berdasarkan filter rentang waktu berjalan (Klik segmen/legenda untuk rincian)"
            padding="p-6"
            className="h-full"
          >
            <div className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">
              Total Evaluasi Keterlambatan: {totalPieProjects} Proyek
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center h-full">
              {/* Pie Chart Display Area */}
              <div className="flex-shrink-0">
                <PieChart
                  segments={dynamicRootCause}
                  size={150}
                  onClick={(label) => {
                    setClickedRootCause(label);
                    setDrillDownModal("rootCause");
                  }}
                />
              </div>

              {/* Legend with absolute numbers & percentage shares */}
              <div className="space-y-2.5 flex-1 w-full select-none divide-y divide-gray-50/50">
                {dynamicRootCause.map((rc, idx) => {
                  const totalCauseSum = dynamicRootCause.reduce((s, p) => s + p.value, 0);
                  const pctShare = totalCauseSum > 0 ? Math.round((rc.value / totalCauseSum) * 105 - 5) : 0;
                  const finalPct = Math.max(0, pctShare > 100 ? 100 : pctShare);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setClickedRootCause(rc.label || "");
                        setDrillDownModal("rootCause");
                      }}
                      className="flex items-center justify-between text-xs pt-2.5 first:pt-0 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors"
                    >
                      {/* Left: Indicator circle + label */}
                      <span className="flex items-start gap-2 font-bold text-gray-500 whitespace-normal word-wrap break-word leading-tight text-[11px]">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: rc.color }}
                        />
                        <span className="whitespace-normal word-wrap break-word leading-tight text-[11px]">
                          {rc.label}
                        </span>
                      </span>
                      {/* Right: absolute count (percentage percent) */}
                      <div className="flex items-baseline gap-1.5 flex-shrink-0">
                        <strong className="text-gray-900 font-extrabold font-sans text-xs">
                          {rc.value}
                        </strong>
                        <span className="text-[10px] text-gray-400 font-semibold font-mono">
                          ({totalCauseSum > 0 ? Math.round((rc.value / totalCauseSum) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
                {dynamicRootCause.length === 0 && (
                  <div className="py-8 text-center text-xs text-gray-400 font-sans">
                    Tidak ada catatan deviasi dev untuk rentang filter aktif.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Large YoY Growth Trend Card (Refactored to strictly visualize 2025 vs 2026 like-for-like) */}
      <Card
        title="SLA YoY Growth Ratio Analysis"
        sub={`Komparasi Like-for-Like: Perbandingan Volume Berhasil vs Gagal khusus Bulan ${startMonth}–${endMonth} (Tahun 2025 vs 2026)`}
        padding="p-6"
      >
        <div className="space-y-4">
          <GroupedBarChart 
            data={yoyCompareData} 
            height={230} 
            onBarClick={(year) => {
              if (year === "2025") setDrillDownModal("yoy2025");
              if (year === "2026") setDrillDownModal("yoy2026");
            }}
          />
          {/* Custom Legends & Interactive drill down helpers */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] pt-3.5 border-t border-gray-55/70 select-none">
            <div className="flex items-center gap-4 font-bold text-gray-500 tracking-wide uppercase font-display">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-[#2563EB] block" /> DEV SLA Achieved
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-[#EF4444] block" /> DEV SLA Not Achieved
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-450 italic font-medium">Bilah Grafik Interaktif:</span>
              <button 
                onClick={() => setDrillDownModal("yoy2025")}
                className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                Detail 2025
              </button>
              <button 
                onClick={() => setDrillDownModal("yoy2026")}
                className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                Detail 2026
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tables Section: Multi Stage Failures & Delay Tracker Row (Fully reactive and synchronized) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Multi-Stage Failures Warning Table */}
        <Card
          title="Multi-Stage SLA Failures"
          sub="Daftar proyek dengan deviasi keterlambatan di lebih dari satu gerbang SLA dalam rentang filter aktif"
          rightElement={
            <span className="text-xs font-mono font-bold bg-rose-50 border border-rose-100 text-rose-700 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-inner select-none">
              <Icon name="warn" className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              {filteredMultiStage.length} warnings
            </span>
          }
          padding="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider font-display select-none">
                  <th className="py-3 px-4 w-[45%] min-w-[200px]">Nama Proyek</th>
                  <th className="py-3 px-3 w-[25%]">SLA Gerbang</th>
                  <th className="py-3 px-3 text-center w-[10%]">Tahun</th>
                  <th className="py-3 px-3 text-center w-[10%]">Severity</th>
                  <th className="py-3 px-4 text-right w-[10%]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 select-text">
                {filteredMultiStage.map((p, idx) => {
                  const failedStages = p.stages.filter((s) => s[1] === 1).map((s) => s[0]);
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-55/20 transition-all text-gray-755 font-sans"
                    >
                      <td className="py-3 px-4 min-w-[200px] whitespace-normal break-words">
                        <p className="font-bold text-gray-800 text-xs whitespace-normal break-words">
                          {p.name}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {failedStages.map((stName, sIdx) => (
                            <span
                              key={sIdx}
                              className="bg-rose-50 text-rose-600 border border-rose-100/50 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md"
                            >
                              {stName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-500 text-center text-[11px]">
                        {p.year}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            p.severity === "Critical"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : p.severity === "High"
                              ? "bg-amber-50 text-[#D97706] border-amber-100"
                              : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}
                        >
                          {p.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Pill label={p.status} kind={p.statusKind} />
                      </td>
                    </tr>
                  );
                })}
                {filteredMultiStage.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-gray-400 font-sans">
                      Tidak ada data multi-stage SLA delay untuk filter terpilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* SLA Phase Delay Tracker Table (with interactive client side pagination) */}
        <Card
          title="SLA Phase Delay Tracker"
          sub="Analisis deviasi waktu & gerbang keterlambatan pengembangan per tkt"
          rightElement={
            <div className="flex items-center gap-2 select-none">
              <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">
                Avg: <strong className="text-gray-755 font-sans">{avgDelayCount} hari</strong>
              </span>
              <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>
              {/* Pagination controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500 font-mono">
                  {delayPage}/{totalDelayPages}
                </span>
                <button
                  onClick={() => setDelayPage((p) => Math.max(p - 1, 1))}
                  disabled={delayPage === 1}
                  className="p-1 rounded-md bg-white border border-gray-200 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer hover:bg-gray-50"
                >
                  <Icon name="chevron" className="w-3 h-3 rotate-180" />
                </button>
                <button
                  onClick={() => setDelayPage((p) => Math.min(p + 1, totalDelayPages))}
                  disabled={delayPage >= totalDelayPages}
                  className="p-1 rounded-md bg-white border border-gray-200 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer hover:bg-gray-50"
                >
                  <Icon name="chevron" className="w-3 h-3" />
                </button>
              </div>
            </div>
          }
          padding="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider font-display select-none">
                  <th className="py-3 px-4 text-center w-[5%]">No</th>
                  <th className="py-3 px-3 w-[10%]">Tkt ID</th>
                  <th className="py-3 px-3 w-[35%] min-w-[180px]">Nama Proyek</th>
                  <th className="py-3 px-3 text-center w-[12%]">SLA Delay (Hari)</th>
                  <th className="py-3 px-3 w-[25%] min-w-[180px]">Faktor Penyebab</th>
                  <th className="py-3 px-4 text-right w-[13%]">Gerbang Terlambat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 select-text">
                {paginatedPhaseDelays.map((row, idx) => {
                  const globalRowNo = (delayPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-55/20 transition-all text-gray-750 font-sans"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-gray-400 text-center">
                        {globalRowNo}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-600 text-xs text-center md:text-left whitespace-nowrap">
                        {row.ticket}
                      </td>
                      <td className="py-3 px-3 min-w-[180px] whitespace-normal break-words">
                        <p className="font-bold text-gray-800 text-xs whitespace-normal break-words">
                          {row.name}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block text-[11px] font-extrabold text-red-650 bg-red-50 px-2 py-0.5 border border-red-100/60 rounded-md font-mono text-xs">
                          +{row.days}d
                        </span>
                      </td>
                      <td className="py-3 px-3 min-w-[180px] whitespace-normal break-words text-xs leading-relaxed font-medium text-gray-600">
                        {getProfessionalReason(row.reason)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {row.stages.map((st, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[9.5px] font-bold text-rose-600 bg-rose-50 border border-rose-100/50 px-1.5 py-0.5 rounded-md font-mono"
                            >
                              {st[0]} (+{st[1]}d)
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredPhaseDelays.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-gray-400 font-sans">
                      Tidak ada project deviasi waktu yang cocok untuk filter perpilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Stylized Absolute Drill-Down Modal Box viewport */}
      {drillDownModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-250">
            {/* Modal headers */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display flex items-center gap-1.5 leading-tight">
                  <Icon name="grid" className="w-4 h-4 text-blue-600 shrink-0" />
                  {drillDownModal === "avg" && "Semua Evaluasi DEV SLA"}
                  {drillDownModal === "2026" && "Evaluasi DEV SLA - Tahun 2026"}
                  {drillDownModal === "notAchieved" && "Project Gagal Memenuhi SLA (Not Achieved)"}
                  {drillDownModal === "multiStage" && "Proyek Ber-delay di Multi-Stage Gerbang"}
                  {drillDownModal === "yoy2025" && `Rincian SLA DEV - Tahun 2025 (${startMonth}–${endMonth})`}
                  {drillDownModal === "yoy2026" && `Rincian SLA DEV - Tahun 2026 (${startMonth}–${endMonth})`}
                  {drillDownModal === "rootCause" && `Root Cause Details: ${clickedRootCause}`}
                </h3>
                <p className="text-[11px] text-gray-400 font-sans mt-1">
                  Menampilkan {modalList.length} catatan proyek dari rentang filter berjalan
                </p>
              </div>
              <button
                onClick={() => setDrillDownModal(null)}
                className="p-1 px-3 bg-gray-100 hover:bg-gray-200/80 text-gray-650 border border-gray-250 text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Modal table listing */}
            <div className="flex-1 overflow-auto p-5 select-text animate-in fade-in duration-200">
              {modalList.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 font-sans">
                  Tidak ada catatan proyek yang memenuhi kriteria filter saat ini.
                </div>
              ) : drillDownModal === "rootCause" ? (
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10.5px] text-gray-400 font-bold uppercase tracking-wider font-display select-none">
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3">Ticket & Name</th>
                      <th className="py-2.5 px-3">Owner Division</th>
                      <th className="py-2.5 px-3">PIC Short</th>
                      <th className="py-2.5 px-3">Last Status</th>
                      <th className="py-2.5 px-3 min-w-[180px] max-w-[250px]">REASON / FAKTOR PENYEBAB</th>
                      <th className="py-2.5 px-3 text-right">Delay Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {modalList.map((p, idx) => {
                      const ticket = p["Ticket ID"] || p["Ticket"] || p.ticket || "—";
                      const name = p["Project Name"] || p.name || "—";
                      const division = p["Owner Div"] || p.div || "—";
                      const picShort = p["PIC Short Name"] || p["PIC Name"] || p.pic || "—";
                      const status = p["Last Status"] || "—";
                      const statusKind = statusKindOfStatus(status);
                      const lateDays = p._lateDev || 0;
                      const rawReason = p["Reason"] || p["reason"] || p["(Dev) Kategori Alasan Terlambat >=2022"] || "";
                      const displayReason = getProfessionalReason(rawReason);

                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-gray-400 text-center">{idx + 1}</td>
                          <td className="py-3 px-3 pr-4">
                            <span className="font-mono font-bold text-gray-450 text-[10.5px] block">{ticket}</span>
                            <span className="font-semibold text-gray-900 whitespace-normal block leading-tight mt-0.5 max-w-md">
                              {name}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-650">
                            {division}
                          </td>
                          <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                            {picShort}
                          </td>
                          <td className="py-3 px-3">
                            <Pill label={status} kind={statusKind} />
                          </td>
                          <td className="py-3 px-3 whitespace-normal text-xs min-w-[180px] max-w-[250px] leading-relaxed text-gray-600">
                            {displayReason}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-rose-600 whitespace-nowrap text-[12px]">
                            +{lateDays} d
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10.5px] text-gray-400 font-bold uppercase tracking-wider font-display select-none">
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Ticket</th>
                      <th className="py-2.5 px-3">Project Name</th>
                      <th className="py-2.5 px-3">Owner Division</th>
                      <th className="py-2.5 px-3">PIC Name</th>
                      <th className="py-2.5 px-3 text-center">Period</th>
                      {drillDownModal === "multiStage" ? (
                        <th className="py-2.5 px-3 text-center">Failed Stages</th>
                      ) : (
                        <th className="py-2.5 px-3 text-right">DEV SLA State</th>
                      )}
                      <th className="py-2.5 px-3 text-right">Milestone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {modalList.map((p, idx) => {
                      const isAchieved = p["DEV SLA"] === "Achieved";
                      return (
                        <tr key={idx} className="hover:bg-gray-55/20 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-gray-450">{idx + 1}</td>
                          <td className="py-3 px-3 font-mono font-bold text-gray-500 whitespace-nowrap">
                            {p["Ticket"] || p.ticket || "—"}
                          </td>
                          <td className="py-3 px-3 pr-4">
                            <span className="font-semibold text-gray-900 whitespace-normal block leading-tight">
                              {p["Project Name"] || p.name}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-650">
                            {p["Owner Div"] || p.div || "—"}
                          </td>
                          <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                            {p["PIC Short Name"] || p["PIC Name"] || p.pic || "—"}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-gray-450 whitespace-nowrap">
                            {p["Period"] || p.period || "—"}
                          </td>
                          {drillDownModal === "multiStage" ? (
                            <td className="py-3 px-3 text-center">
                              <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                                {(p.stages || []).filter((s: any) => s[1] === 1).map((s: any, sIdx: number) => (
                                  <span
                                    key={sIdx}
                                    className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-1 rounded"
                                  >
                                    {s[0]}
                                  </span>
                                ))}
                              </div>
                            </td>
                          ) : (
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isAchieved
                                  ? "bg-blue-50 text-blue-700 border-blue-150"
                                  : "bg-rose-50 text-rose-700 border-rose-150"
                              }`}>
                                {p["DEV SLA"] || "—"}
                              </span>
                            </td>
                          )}
                          <td className="py-3 px-3 text-right">
                            <div className="inline-block px-2 py-1 text-[10px] font-semibold rounded-full border border-slate-200 bg-slate-50 text-slate-700 capitalize whitespace-nowrap">
                              {p["Last Status"] || "In Progress"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
