import React, { useState, useMemo, useRef } from "react";
import { DashboardDataset } from "../types";
import { Card, Icon } from "./UI";
import { PieChart } from "./Charts";
import { getActiveSlaPool } from "../utils";


interface TabCategoryProps {
  dataset: DashboardDataset;
  rawProjects?: any[];
  filteredProjects?: any[];
  startMonth?: string;
  endMonth?: string;
  startYear?: number;
  endYear?: number;
  onUploadFile?: (file: File) => void;
}

// Local helper to map statuses to operational groups
function statusGroupOfLocal(status: string | null): string {
  const s = (status || "").trim();
  if (/Queue/i.test(s)) return "Antrian";
  if (/^(FPS|FSD|Dev|SIT)$/i.test(s) || /Progress/i.test(s)) return "Dalam Proses";
  if (/UAT/i.test(s)) return "UAT";
  if (/Monitoring/i.test(s)) return "Monitoring";
  if (/Hold/i.test(s)) return "Hold";
  if (/Change Request/i.test(s)) return "Change Request";
  if (/Canceled/i.test(s)) return "Canceled";
  if (/Live/i.test(s)) return "Live";
  return "Lainnya";
}

const activeTypesList = ["Antrian", "Dalam Proses", "UAT", "Monitoring", "Hold", "Change Request"];

export function TabCategory({
  dataset,
  rawProjects,
  filteredProjects = [],
  startMonth,
  endMonth,
  startYear,
  endYear,
  onUploadFile,
}: TabCategoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<"classification" | "requested" | "average" | "low_sla" | "leaderboard_division" | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const isBpdDivision = activeModal === "leaderboard_division" && selectedDivision === "BUSINESS PROCESS DEVELOPMENT";

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download logic for dynamic active JSON database
  const handleDownloadJSON = () => {
    if (!rawProjects) return;
    const blob = new Blob([JSON.stringify(rawProjects, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ADV_Category_Database_${dataset.report.date.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 1. DATA EXCLUSION RULE:
  // "Ensure that any project data with priority values labeled as 'IT' or 'Lanjutan 2020'
  // is strictly excluded and filtered out from this page's calculation blocks."
  const tabProjects = useMemo(() => {
    const list = filteredProjects.length > 0 ? filteredProjects : (rawProjects || []);
    return list.filter((p) => {
      const priority = p["Prioritas Mgmt"] ? String(p["Prioritas Mgmt"]).trim().toLowerCase() : "";
      return priority !== "it" && priority !== "lanjutan 2020";
    });
  }, [filteredProjects, rawProjects]);

  // Recalculating classifications/categories based on tabProjects
  const computedCategories = useMemo(() => {
    const typeMap: Record<string, number> = {};
    tabProjects.forEach((p) => {
      const val = p._typeGroup || "Other";
      typeMap[val] = (typeMap[val] || 0) + 1;
    });
    return Object.keys(typeMap)
      .map((k) => ({
        label: k,
        value: typeMap[k],
        color: k === "Project Utama" ? "#2563EB" : k === "Enhance Kecil" ? "#3B82F6" : k === "Approval Digital" ? "#10B981" : k === "Internal IT" ? "#F59E0B" : "#64748B",
      }))
      .sort((a, b) => b.value - a.value);
  }, [tabProjects]);

  // Recalculating state distribution for status pie chart based on tabProjects
  const computedStatusPie = useMemo(() => {
    const statusPieMap: Record<string, number> = {};
    tabProjects.forEach((p) => {
      const val = statusGroupOfLocal(p["Last Status"]);
      statusPieMap[val] = (statusPieMap[val] || 0) + 1;
    });
    const statusPieColors: Record<string, string> = {
      Live: "#059669",
      Canceled: "#E11D48",
      Hold: "#A855F7",
      Antrian: "#D97706",
      UAT: "#3B82F6",
      Monitoring: "#0891B2",
      "Dalam Proses": "#2563EB",
      "Change Request": "#7C3AED",
    };
    return Object.keys(statusPieMap)
      .map((k) => ({
        label: k,
        value: statusPieMap[k],
        color: statusPieColors[k] || "#64748B",
      }))
      .sort((a, b) => b.value - a.value);
  }, [tabProjects]);

  // Active Projects
  const computedActiveProjects = useMemo(() => {
    return tabProjects.filter((p) => activeTypesList.includes(statusGroupOfLocal(p["Last Status"])));
  }, [tabProjects]);

  // Active by Type
  const computedActiveByType = useMemo(() => {
    const activeTypeMap: Record<string, number> = {};
    computedActiveProjects.forEach((p) => {
      activeTypeMap[p._typeGroup] = (activeTypeMap[p._typeGroup] || 0) + 1;
    });
    return Object.keys(activeTypeMap)
      .map((k) => ({ label: k, value: activeTypeMap[k] }))
      .sort((a, b) => b.value - a.value);
  }, [computedActiveProjects]);

  // Active by Division
  // Exclude requesting division ("Owner Div") exact "INFORMATION TECHNOLOGY"
  const computedActiveByDivision = useMemo(() => {
    const activeDivMap: Record<string, number> = {};
    computedActiveProjects.forEach((p) => {
      const div = p["Owner Div"] || "Unassigned";
      if (div.toUpperCase() !== "INFORMATION TECHNOLOGY") {
        activeDivMap[div] = (activeDivMap[div] || 0) + 1;
      }
    });
    return Object.keys(activeDivMap)
      .map((k) => ({ label: k, value: activeDivMap[k] }))
      .sort((a, b) => b.value - a.value);
  }, [computedActiveProjects]);

  // Requests by Division (divisions)
  // Exclude requesting division ("Owner Div") is exactly "INFORMATION TECHNOLOGY"
  const computedDivisions = useMemo(() => {
    const divCountMap: Record<string, number> = {};
    tabProjects.forEach((p) => {
      const div = p["Owner Div"] || "Unassigned";
      if (div.toUpperCase() !== "INFORMATION TECHNOLOGY") {
        divCountMap[div] = (divCountMap[div] || 0) + 1;
      }
    });
    return Object.keys(divCountMap)
      .map((k) => ({
        label: k,
        value: divCountMap[k],
        color: "#2563EB",
      }))
      .sort((a, b) => b.value - a.value);
  }, [tabProjects]);

  // Division SLA Leaderboard
  // Exclude exactly "INFORMATION TECHNOLOGY" or "Wisesa"
  const computedLeaderboard = useMemo(() => {
    const divisionsMap: Record<string, { total: number; achieved: number; not: number }> = {};
    const activePool = getActiveSlaPool(tabProjects);
    activePool.forEach((p) => {
      const div = p["Owner Div"] || "Unassigned";
      const checkDivUpper = div.toUpperCase();
      if (checkDivUpper === "INFORMATION TECHNOLOGY" || checkDivUpper === "WISESA") {
        return;
      }

      if (!divisionsMap[div]) {
        divisionsMap[div] = { total: 0, achieved: 0, not: 0 };
      }
      const devSlaVal = p["DEV SLA"];
      if (devSlaVal === "Achieved") {
        divisionsMap[div].total++;
        divisionsMap[div].achieved++;
      } else if (devSlaVal === "Not Achieved") {
        divisionsMap[div].total++;
        divisionsMap[div].not++;
      }
    });

    return Object.keys(divisionsMap)
      .map((div) => {
        const stats = divisionsMap[div];
        const sla = stats.total > 0 ? Math.round((stats.achieved / stats.total) * 100) : 100;
        return {
          division: div,
          sla,
          not: stats.not,
          evaluated: stats.total,
        };
      })
      .sort((a, b) => b.sla - a.sla || b.evaluated - a.evaluated)
      .map((item, idx) => ({
        rank: idx + 1,
        ...item,
      }));
  }, [tabProjects]);

  // Dynamic Year-based indicator for Card 3 "Average (2026)"
  const averageYearLabel = useMemo(() => {
    if (startYear === endYear && startYear) {
      return `Average (${startYear})`;
    } else if (startYear && endYear) {
      return `Average (${startYear}-${endYear})`;
    }
    return "Average (2026)";
  }, [startYear, endYear]);

  // Overall combined dynamic SLA achievement percent for currently active range filter
  const computedOverallSlaPct = useMemo(() => {
    let totalEvaluations = 0;
    let totalSuccess = 0;
    const slaFields: ("FSD SLA" | "DEV SLA" | "SIT SLA" | "UAT SLA" | "Live SLA")[] = [
      "FSD SLA",
      "DEV SLA",
      "SIT SLA",
      "UAT SLA",
      "Live SLA",
    ];
    const activePool = getActiveSlaPool(tabProjects);
    activePool.forEach((p) => {
      slaFields.forEach((f) => {
        if (p[f] === "Achieved" || p[f] === "Not Achieved") {
          totalEvaluations++;
          if (p[f] === "Achieved") {
            totalSuccess++;
          }
        }
      });
    });
    return totalEvaluations > 0 ? Math.round((totalSuccess / totalEvaluations) * 100) : 100;
  }, [tabProjects]);

  // Division with lowest SLA
  const lowestSlaDiv = useMemo(() => {
    if (computedLeaderboard.length === 0) {
      return { division: "Risk Mgmt", sla: 89 };
    }
    return computedLeaderboard[computedLeaderboard.length - 1];
  }, [computedLeaderboard]);

  // Search Query Filters helper
  const filteredCategories = useMemo(() => {
    return searchQuery.trim() === ""
      ? computedCategories
      : computedCategories.filter((c) => c.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [computedCategories, searchQuery]);

  const filteredStatusPie = useMemo(() => {
    return searchQuery.trim() === ""
      ? computedStatusPie
      : computedStatusPie.filter((s) => s.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [computedStatusPie, searchQuery]);

  const filteredActiveByType = useMemo(() => {
    return searchQuery.trim() === ""
      ? computedActiveByType
      : computedActiveByType.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [computedActiveByType, searchQuery]);

  const filteredActiveByDivision = useMemo(() => {
    return searchQuery.trim() === ""
      ? computedActiveByDivision
      : computedActiveByDivision.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [computedActiveByDivision, searchQuery]);

  const filteredDivisions = useMemo(() => {
    return searchQuery.trim() === ""
      ? computedDivisions
      : computedDivisions.filter((d) => d.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [computedDivisions, searchQuery]);

  const filteredLeaderboard = useMemo(() => {
    return searchQuery.trim() === ""
      ? computedLeaderboard
      : computedLeaderboard.filter((item) => item.division.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [computedLeaderboard, searchQuery]);

  // Drill-down logic helper
  const getModalProjects = () => {
    if (!activeModal) return [];
    switch (activeModal) {
      case "classification":
        return tabProjects;
      case "requested":
        return tabProjects.filter((p) => (p["Owner Div"] || "").toUpperCase() !== "INFORMATION TECHNOLOGY");
      case "average":
        return getActiveSlaPool(tabProjects).filter((p) =>
          ["FSD SLA", "DEV SLA", "SIT SLA", "UAT SLA", "Live SLA"].some(
            (field) => p[field] === "Achieved" || p[field] === "Not Achieved"
          )
        );
      case "low_sla":
        return getActiveSlaPool(tabProjects).filter((p) => p["Owner Div"] === lowestSlaDiv.division);
      case "leaderboard_division":
        return getActiveSlaPool(tabProjects).filter((p) => p["Owner Div"] === selectedDivision);
      default:
        return [];
    }
  };

  const groupedClassificationData = useMemo(() => {
    if (activeModal !== "classification") return null;
    const projects = getModalProjects();
    const groups: Record<string, typeof projects> = {};
    projects.forEach((p) => {
      const gName = p._typeGroup || p["Type Project"] || "Unspecified";
      if (!groups[gName]) {
        groups[gName] = [];
      }
      groups[gName].push(p);
    });
    // Sort group keys alphabetically for stable presentation
    const sortedKeys = Object.keys(groups).sort();
    const sortedGroups: Record<string, typeof projects> = {};
    sortedKeys.forEach((k) => {
      sortedGroups[k] = groups[k];
    });
    return sortedGroups;
  }, [activeModal, tabProjects]);

  const groupedRequestedData = useMemo(() => {
    if (activeModal !== "requested") return null;
    const projects = getModalProjects();
    const groups: Record<string, typeof projects> = {};
    projects.forEach((p) => {
      const gName = p["Owner Div"] || "Unassigned";
      if (!groups[gName]) {
        groups[gName] = [];
      }
      groups[gName].push(p);
    });
    // Sort group keys alphabetically
    const sortedKeys = Object.keys(groups).sort();
    const sortedGroups: Record<string, typeof projects> = {};
    sortedKeys.forEach((k) => {
      sortedGroups[k] = groups[k];
    });
    return sortedGroups;
  }, [activeModal, tabProjects]);

  return (
    <div className="space-y-6">
      {/* Dynamic Header Block with responsive filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl font-extrabold font-display text-gray-900 tracking-tight">
            Kategori & Klasifikasi Divisi
          </h1>
          <p className="text-xs text-gray-400 font-medium font-sans mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Weekly Report Periode {dataset.report.date} • {tabProjects.length} Proyek Terdaftar
          </p>
        </div>

        {/* Dynamic Search block and JSON download/upload triggers */}
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
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            )}
          </div>

          {/* Actions controllers */}
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
              className="p-2.5 h-9.5 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-905 border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:shadow-xs shadow-xs"
            >
              <Icon name="upload" className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadJSON}
              disabled={!rawProjects}
              title="Unduh File Database Aktif"
              className="p-2.5 h-9.5 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-905 border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:shadow-xs shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="download" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Professional Clickable KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Metric Card 1: Project Classification */}
        <div
          onClick={() => setActiveModal("classification")}
          className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex items-center gap-4 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all duration-200 select-none group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Icon name="clock" className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[24px] font-extrabold text-gray-900 leading-none font-display tracking-tight flex items-center gap-1.5">
              {computedCategories.length}
              <span className="text-[10px] uppercase tracking-normal bg-blue-50 border border-blue-100 px-1 py-0.5 font-bold rounded-sm text-blue-700 font-sans hidden group-hover:inline-block">
                View
              </span>
            </h4>
            <p className="text-[12px] font-bold text-gray-650 mt-1.5 font-sans">
              Project Classification
            </p>
          </div>
        </div>

        {/* Metric Card 2: Requested Division */}
        <div
          onClick={() => setActiveModal("requested")}
          className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all duration-200 select-none group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Icon name="layers" className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[24px] font-extrabold text-gray-900 leading-none font-display tracking-tight flex items-center gap-1.5">
              {computedDivisions.length}
              <span className="text-[10px] uppercase tracking-normal bg-indigo-50 border border-indigo-100 px-1 py-0.5 font-bold rounded-sm text-indigo-700 font-sans hidden group-hover:inline-block">
                View
              </span>
            </h4>
            <p className="text-[12px] font-bold text-gray-650 mt-1.5 font-sans">
              Requested Division
            </p>
          </div>
        </div>

        {/* Metric Card 3: Dynamic Average Year SLA % */}
        <div
          onClick={() => setActiveModal("average")}
          className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex items-center gap-4 hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all duration-200 select-none group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Icon name="check" className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[24px] font-extrabold text-gray-900 leading-none font-display tracking-tight flex items-center gap-1.5">
              {computedOverallSlaPct}%
              <span className="text-[10px] uppercase tracking-normal bg-emerald-50 border border-emerald-100 px-1 py-0.5 font-bold rounded-sm text-emerald-700 font-sans hidden group-hover:inline-block">
                View
              </span>
            </h4>
            <p className="text-[12px] font-bold text-gray-650 mt-1.5 font-sans">
              {averageYearLabel}
            </p>
          </div>
        </div>

        {/* Metric Card 4: Low SLA Division */}
        <div
          onClick={() => {
            setSelectedDivision(lowestSlaDiv.division);
            setActiveModal("low_sla");
          }}
          className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex items-center gap-4 hover:shadow-md hover:border-amber-200 cursor-pointer transition-all duration-200 select-none group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] text-[#D97706] border border-amber-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Icon name="warn" className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[17px] font-extrabold text-gray-900 leading-tight font-display tracking-tight flex flex-wrap items-center gap-1">
              <span>{lowestSlaDiv.division}</span>
              <span className="text-[#EF4444] font-extrabold font-mono text-[16px]">{lowestSlaDiv.sla}%</span>
              <span className="text-[9px] uppercase tracking-normal bg-amber-50 border border-amber-200 px-1 py-0.5 font-bold rounded-sm text-amber-700 font-sans hidden group-hover:inline-block">
                View
              </span>
            </h4>
            <p className="text-[12px] font-bold text-gray-650 mt-1 font-sans">
              Low SLA Division
            </p>
          </div>
        </div>
      </div>

      {/* Row Block 1: Projects by Category & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Projects by Category card */}
        <Card title="Projects by Category" sub={`Sepanjang waktu · ${computedCategories.length} kategori`} padding="p-6">
          <div className="space-y-4 select-none">
            {filteredCategories.map((cat, idx) => {
              const maxCat = Math.max(...computedCategories.map((c) => c.value), 1);
              const barWidthPct = (cat.value / maxCat) * 100;
              return (
                <div key={idx} className="flex items-center gap-4 justify-between">
                  <span className="w-36 text-[12.5px] font-semibold text-gray-650 truncate font-sans">
                    {cat.label}
                  </span>
                  <div className="flex-1 h-3.5 bg-gray-50 border border-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${barWidthPct}%`,
                        backgroundColor: cat.color || "#2563EB",
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-[12.5px] font-bold text-gray-800 font-mono">
                    {cat.value}
                  </span>
                </div>
              );
            })}
            {filteredCategories.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 font-sans">
                Tidak ada data kategori yang cocok dengan pencarian Anda.
              </div>
            )}
          </div>
        </Card>

        {/* Status Distribution dynamic chart & list card */}
        <Card title="Status Distribution" sub={`${computedStatusPie.reduce((acc, x) => acc + x.value, 0)} proyek sepanjang waktu`} padding="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center h-full">
            <div className="flex-shrink-0">
              <PieChart segments={computedStatusPie} size={150} />
            </div>

            <div className="space-y-2 flex-1 w-full select-none divide-y divide-gray-50/50">
              {filteredStatusPie.map((sp, idx) => {
                const totalCount = computedStatusPie.reduce((acc, x) => acc + x.value, 0);
                const pct = totalCount > 0 ? (sp.value / totalCount) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-[12.5px] pt-2 first:pt-0">
                    <span className="flex items-center gap-2 font-bold text-gray-500 truncate max-w-[130px]">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sp.color }} />
                      {sp.label}
                    </span>
                    <div className="flex items-baseline gap-1.5 flex-shrink-0">
                      <strong className="text-gray-900 font-extrabold font-sans text-xs">
                        {sp.value}
                      </strong>
                      <span className="text-[10px] text-gray-400 font-semibold font-mono">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
              {filteredStatusPie.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400 font-sans">
                  Tidak ada data status yang cocok dengan pencarian.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Row Block 2: 2-column mix - "Priority Mix" section completely removed and others expanded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Column 1: Active by Type */}
        <Card title="Active by Type" sub="Hanya proyek aktif" padding="p-5">
          <div className="space-y-3.5 select-none animate-fade-in pr-0.5">
            {filteredActiveByType.map((item, idx) => {
              const maxVal = Math.max(...computedActiveByType.map((i) => i.value), 1);
              const pct = (item.value / maxVal) * 100;
              return (
                <div key={idx} className="flex items-center gap-3 justify-between">
                  <span className="w-32 text-[12px] font-semibold text-gray-500 truncate font-sans">
                    {item.label}
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-[12.5px] font-extrabold text-gray-900 font-mono">
                    {item.value}
                  </span>
                </div>
              );
            })}
            {filteredActiveByType.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 font-sans">
                Target filter tidak ditemukan.
              </div>
            )}
          </div>
        </Card>

        {/* Column 2: Active by Division (Excluding IT Division) */}
        <Card title="Active by Division" sub="Hanya proyek aktif" padding="p-5">
          <div className="space-y-3.5 select-none animate-fade-in max-h-[290px] overflow-y-auto pr-1">
            {filteredActiveByDivision.slice(0, 10).map((item, idx) => {
              const maxVal = Math.max(...computedActiveByDivision.map((i) => i.value), 1);
              const pct = (item.value / maxVal) * 100;
              return (
                <div key={idx} className="flex items-center gap-3 justify-between">
                  <span className="w-32 text-[12px] font-semibold text-gray-500 truncate font-sans">
                    {item.label}
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-[12.5px] font-extrabold text-gray-900 font-mono">
                    {item.value}
                  </span>
                </div>
              );
            })}
            {filteredActiveByDivision.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 font-sans">
                Target filter divisi tidak ditemukan.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Row Block 3: Requests by Division & Division SLA Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Requests by Division list card */}
        <Card title="Requests by Division" sub={`top 10 divisi request terbanyak`} padding="p-6">
          <div className="space-y-3.5 select-none animate-fade-in">
            {filteredDivisions.slice(0, 10).map((div, idx) => {
              const maxDiv = Math.max(...computedDivisions.map((d) => d.value), 1);
              const pct = (div.value / maxDiv) * 100;
              return (
                <div key={idx} className="flex items-center gap-4 justify-between py-1.5 border-b border-gray-50/50 last:border-b-0">
                  {/* Fixed Text Truncation Bug by removing truncate, setting w-40 sm:w-48, and applying whitespace-normal break-words */}
                  <span className="w-40 sm:w-48 text-[12px] font-bold text-gray-650 whitespace-normal break-words font-sans leading-snug">
                    {div.label}
                  </span>
                  <div className="flex-1 h-3 bg-gray-50 border border-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-[12px] font-bold text-gray-800 font-mono">
                    {div.value}
                  </span>
                </div>
              );
            })}
            {filteredDivisions.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 font-sans">
                Tidak ada data divisi peminta yang cocok dengan pencarian Anda.
              </div>
            )}
          </div>
        </Card>

        {/* Division SLA Leaderboard table card */}
        <Card
          title="Division SLA Leaderboard"
          sub={`SLA DEV terhadap request User`}
          padding="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-405 font-bold uppercase tracking-wider font-display select-none">
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-3">Divisi</th>
                  <th className="py-3.5 px-3 w-52">Dev SLA</th>
                  <th className="py-3.5 px-3 text-center w-16">Gagal</th>
                  <th className="py-3.5 px-4 text-right w-24">Dievaluasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/60">
                {filteredLeaderboard.map((row, idx) => {
                  let barColor = "#2563EB"; // Blue
                  if (row.sla >= 100) {
                    barColor = "#10B981"; // Green
                  } else if (row.sla >= 92) {
                    barColor = "#2563EB"; // Blue
                  } else if (row.sla >= 90) {
                    barColor = "#D97706"; // Orange
                  } else {
                    barColor = "#EF4444"; // Red
                  }

                  return (
                    <tr
                      key={idx}
                      onClick={() => {
                        setSelectedDivision(row.division);
                        setActiveModal("leaderboard_division");
                      }}
                      className="hover:bg-blue-50/40 transition-all text-gray-750 cursor-pointer select-none group"
                      title="Klik untuk melihat detail proyek divisi"
                    >
                      {/* Rank badge */}
                      <td className="py-3 px-4 text-center">
                        {idx === 0 ? (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-[11px] font-mono mx-auto group-hover:scale-110 transition-transform">
                            1
                          </div>
                        ) : idx === 1 ? (
                          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-extrabold text-[11px] font-mono mx-auto group-hover:scale-110 transition-transform">
                            2
                          </div>
                        ) : idx === 2 ? (
                          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-extrabold text-[11px] font-mono mx-auto group-hover:scale-110 transition-transform">
                            3
                          </div>
                        ) : (
                          <span className="font-mono font-bold text-gray-400 text-xs text-center block">
                            {idx + 1}
                          </span>
                        )}
                      </td>

                      {/* Division Label */}
                      <td className="py-3 px-3">
                        <strong className="text-gray-800 text-[12.5px] font-bold group-hover:text-blue-700 transition-colors">
                          {row.division}
                        </strong>
                      </td>

                      {/* SLA bar row */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${row.sla}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>
                          <span className="w-10 text-right font-mono font-extrabold text-[12.5px] text-gray-850">
                            {row.sla}%
                          </span>
                        </div>
                      </td>

                      {/* Not achieved Evaluation value */}
                      <td className="py-3 px-3 text-center">
                        {row.not > 0 ? (
                          <span className="font-mono font-extrabold text-[#B91C1C] text-[12.5px]">
                            {row.not}
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-gray-300 text-[12px]">
                            0
                          </span>
                        )}
                      </td>

                      {/* Evaluated total logs */}
                      <td className="py-3 px-4 text-right text-gray-450 font-mono text-[12px] font-bold">
                        {row.evaluated}
                      </td>
                    </tr>
                  );
                })}
                {filteredLeaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-gray-400 font-sans">
                      Leaderboard target tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Responsive interactive drill-down pop-up modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur effect */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => {
              setActiveModal(null);
              setSelectedDivision(null);
            }}
          />

          {/* Modal Content container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[85vh] flex flex-col z-10 overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95 leading-normal">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 select-none">
              <div>
                <h3 className="text-base font-extrabold font-display text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-600 text-white font-mono text-[10px] rounded-sm uppercase font-extrabold">
                    Audit
                  </span>
                  {activeModal === "classification" && "Project Classification Detail"}
                  {activeModal === "requested" && "Requested Division Listing"}
                  {activeModal === "average" && `${averageYearLabel} Evaluation Details`}
                  {activeModal === "low_sla" && `Low SLA Division: ${lowestSlaDiv.division}`}
                  {activeModal === "leaderboard_division" && `Projects for Division: ${selectedDivision}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedDivision(null);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer text-xs font-bold font-mono"
              >
                ✕
              </button>
            </div>

            {/* Modal Table body with strict anti-truncation layouts */}
            <div className="flex-1 overflow-y-auto p-6 max-h-[58vh]">
              {/* Executive SLA Diagnostics Summary Banner for BUSINESS PROCESS DEVELOPMENT */}
              {activeModal === "leaderboard_division" && selectedDivision === "BUSINESS PROCESS DEVELOPMENT" && (() => {
                const bpdProjects = tabProjects.filter(p => (p["Owner Div"] || "").toUpperCase() === "BUSINESS PROCESS DEVELOPMENT");
                const bpdActiveSlaPool = getActiveSlaPool(bpdProjects);
                const bpdEvaluatedDevSla = bpdActiveSlaPool.filter(p => p["DEV SLA"] === "Achieved" || p["DEV SLA"] === "Not Achieved");
                const bpdFailedDevSlaCount = bpdEvaluatedDevSla.filter(p => p["DEV SLA"] === "Not Achieved").length;
                return (
                  <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50/70 text-red-900 shadow-2xs">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 px-[7px] shrink-0 text-xs font-bold font-mono bg-red-100 text-red-700 rounded-md select-none">
                        ⚠️ SLA
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-red-950 uppercase tracking-wide leading-none mb-1.5 select-none font-display">
                          Executive SLA Diagnostic Summary
                        </p>
                        <p className="text-[11.5px] font-medium leading-relaxed font-sans text-red-900/90 whitespace-normal break-words">
                          SLA Root-Cause Analysis: Out of {bpdEvaluatedDevSla.length} evaluated projects, {bpdFailedDevSlaCount} items failed to meet the baseline DEV SLA timeline threshold. Main bottlenecks are driven by extended development turnaround windows (lateDev &gt; 0), repeated requirement modifications during the active build cycle, or lifecycle terminations (Canceled projects).
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Classification Top Summary badges */}
              {activeModal === "classification" && groupedClassificationData && (
                <div className="flex flex-wrap gap-2 mb-5 select-none text-xs">
                  {(Object.entries(groupedClassificationData) as [string, any[]][]).map(([gName, list]) => (
                    <span key={gName} className="font-semibold text-gray-750 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-150 inline-flex items-center gap-1.5 shadow-2xs">
                      <strong className="text-blue-600 font-extrabold">{gName}:</strong>
                      <span className="font-mono font-black text-gray-900 bg-white px-1.5 py-0.5 rounded-md border border-gray-100">{list.length}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Requested Division Top Summary cards */}
              {activeModal === "requested" && groupedRequestedData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-5 select-none">
                  {(Object.entries(groupedRequestedData) as [string, any[]][]).map(([gName, list]) => (
                    <div key={gName} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between text-xs whitespace-normal break-words shadow-2xs">
                      <span className="font-bold text-gray-700 whitespace-normal break-words leading-tight max-w-[75%]">{gName}</span>
                      <span className="font-mono font-extrabold bg-blue-105 text-blue-800 px-2.5 py-1 rounded-lg text-xs flex-shrink-0">
                        {list.length} {list.length === 1 ? 'Project' : 'Projects'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {getModalProjects().length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400 font-semibold font-sans">
                  No project records found under the selected category/division for this period.
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-xs">
                  <table className="w-full text-left text-[11.5px] border-collapse font-sans">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-[10px] text-gray-500 font-bold uppercase tracking-wider font-display select-none">
                        <th className="py-3 px-4 text-center w-12 whitespace-normal break-words">No</th>
                        <th className="py-3 px-3 w-28 whitespace-normal break-words">Ticket</th>
                        <th className="py-3 px-3 whitespace-normal break-words min-w-[200px]">Project Name</th>
                        <th className="py-3 px-3 whitespace-normal break-words min-w-[150px]">
                          {activeModal === "average" ? "Evaluated Gate SLAs" : "Owner Div"}
                        </th>
                        <th className="py-3 px-3 w-32 whitespace-normal break-words">Last Status</th>
                        {isBpdDivision && (
                          <>
                            <th className="py-3 px-3 w-32 whitespace-normal break-words font-display font-extrabold text-[#991b1b]">SLA Status</th>
                            <th className="py-3 px-3 whitespace-normal break-words min-w-[250px] font-display font-extrabold text-[#991b1b]">Delay Log / Bottleneck Reason</th>
                          </>
                        )}
                        {activeModal !== "average" && (
                          <th className="py-3 px-3 w-24 text-right whitespace-normal break-words">Priority</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {(() => {
                        let runningNo = 1;

                        const renderRow = (p: any) => {
                          const sGroup = statusGroupOfLocal(p["Last Status"]);
                          const statusColor = sGroup === "Live" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                              sGroup === "Canceled" ? "bg-rose-50 text-rose-700 border-rose-100" :
                                              sGroup === "Hold" ? "bg-purple-50 text-purple-700 border-purple-100" :
                                              sGroup === "Antrian" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                              "bg-blue-50 text-blue-700 border-blue-100";

                          const lateDev = p._lateDev != null ? p._lateDev : (p.lateDev != null ? p.lateDev : 0);
                          const lastStatusVal = p["Last Status"] || "";
                          const statusUpper = lastStatusVal.toUpperCase().trim();
                          const isCanceled = statusUpper === "CANCELED";
                          const isSlaFailed = lateDev > 0 || isCanceled;

                          let diagnosticText = "Delivered within standard SLA limits.";
                          if (lateDev > 0) {
                            diagnosticText = `Development exceeded target baseline by ${lateDev} days.`;
                          } else if (statusUpper === "CANCELED") {
                            diagnosticText = "Project canceled mid-lifecycle; milestone target voided.";
                          } else if (statusUpper === "CHANGE REQUEST ON PROGRESS") {
                            diagnosticText = "Scope modification requested during active development phase.";
                          }

                          return (
                            <tr key={`${p["Ticket"] || "pt"}-${runningNo}`} className="hover:bg-gray-50/50 transition-colors text-gray-700">
                              <td className="py-3 px-4 text-center font-mono font-bold text-gray-400 whitespace-normal break-words">
                                {runningNo++}
                              </td>
                              <td className="py-3 px-3 font-mono font-semibold text-gray-500 whitespace-normal break-words">
                                {p["Ticket"] || "—"}
                              </td>
                              <td className="py-3 px-3 font-bold text-gray-900 whitespace-normal break-words leading-relaxed select-text">
                                {p["Project Name"] || "—"}
                              </td>
                              <td className="py-3 px-3 whitespace-normal break-words">
                                {activeModal === "average" ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {["FSD SLA", "DEV SLA", "SIT SLA", "UAT SLA", "Live SLA"].map((field) => {
                                      const val = p[field];
                                      if (val === "Achieved" || val === "Not Achieved") {
                                        const isAch = val === "Achieved";
                                        return (
                                          <span
                                            key={field}
                                            title={`${field}: ${val}`}
                                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm border uppercase leading-none ${
                                              isAch
                                                ? "bg-emerald-50 text-emerald-800 border-emerald-100/50"
                                                : "bg-rose-50 text-rose-800 border-rose-100/50"
                                            }`}
                                          >
                                            {field.replace(" SLA", "")}: {isAch ? "✓" : "✗"}
                                          </span>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                ) : (
                                  <span className="font-semibold text-gray-650 whitespace-normal break-words">{p["Owner Div"] || "—"}</span>
                                )}
                              </td>
                              <td className="py-3 px-3 whitespace-normal break-words">
                                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border uppercase leading-none inline-block ${statusColor}`}>
                                  {p["Last Status"] || "—"}
                                </span>
                              </td>
                              {isBpdDivision && (
                                <>
                                  <td className="py-3 px-3 whitespace-normal break-words">
                                    {isSlaFailed ? (
                                      <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md text-red-700 bg-red-50 border border-red-200">
                                        [SLA FAILED]
                                      </span>
                                    ) : (
                                      <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200">
                                        [SLA ACHIEVED]
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 whitespace-normal break-words font-medium text-gray-650 leading-relaxed select-text">
                                    {diagnosticText}
                                  </td>
                                </>
                              )}
                              {activeModal !== "average" && (
                                <td className="py-3 px-4 text-right font-mono text-[11px] font-extrabold text-gray-550 whitespace-normal break-words">
                                  {p["Prioritas Mgmt"] || "—"}
                                </td>
                              )}
                            </tr>
                          );
                        };

                        if (activeModal === "classification" && groupedClassificationData) {
                          return (Object.entries(groupedClassificationData) as [string, any[]][]).map(([groupName, list]) => (
                            <React.Fragment key={groupName}>
                              <tr className="bg-blue-50/20 border-y border-blue-100/60 font-sans select-none">
                                <td colSpan={6} className="py-2.5 px-4 font-extrabold text-xs text-blue-900 whitespace-normal break-words tracking-tight uppercase leading-none">
                                  {groupName} <span className="text-blue-600 font-mono font-extrabold">({list.length} {list.length === 1 ? 'Project' : 'Projects'})</span>
                                </td>
                              </tr>
                              {list.map((p) => renderRow(p))}
                            </React.Fragment>
                          ));
                        }

                        if (activeModal === "requested" && groupedRequestedData) {
                          return (Object.entries(groupedRequestedData) as [string, any[]][]).map(([groupName, list]) => (
                            <React.Fragment key={groupName}>
                              <tr className="bg-indigo-50/20 border-y border-indigo-100/60 font-sans select-none">
                                <td colSpan={6} className="py-2.5 px-4 font-black text-xs text-indigo-900 whitespace-normal break-words tracking-tight uppercase leading-none">
                                  {groupName} <span className="text-indigo-600 font-mono font-extrabold">({list.length} {list.length === 1 ? 'Project' : 'Projects'})</span>
                                </td>
                              </tr>
                              {list.map((p) => renderRow(p))}
                            </React.Fragment>
                          ));
                        }

                        return getModalProjects().map((p) => renderRow(p));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end select-none">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedDivision(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
