import React, { useState, useMemo, useRef, useEffect } from "react";
import { DEFAULT_RAW_PROJECTS, FALLBACK_DATE } from "./data";
import { sanitizeProjects, computeDashboardMetrics } from "./parser";
import { Icon } from "./components/UI";
import { TabOverview } from "./components/TabOverview";
import { TabPipeline } from "./components/TabPipeline";
import { TabSla } from "./components/TabSla";
import { TabCategory } from "./components/TabCategory";
import { TabProjects } from "./components/TabProjects";
import static2025Data from "./Project 2025_2.json";
import { getProjectMonthAndYear } from "./utils";

function sanitizeAndLoadMasterJSON(rawJSONData: any[]): any[] {
  if (!rawJSONData || !Array.isArray(rawJSONData)) return [];

  const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return rawJSONData.map((row) => {
    // Standardize division mapping directly from the active JSON structural property keys
    const rawDiv = row["Owner Div"] || row["Owner Division"] || row["Divisi"] || "";
    const rawProjectName = row["Project Name"] || row["Nama Project"] || "";

    // Dynamically reconstruct missing Period field if necessary
    let period = row["Period"] || row["_period"] || "";
    if (!period || period === "Unscheduled") {
      const { month, year } = getProjectMonthAndYear(row);
      const monthStr = MONTH_NAMES_SHORT[month - 1] || "Jan";
      const yearShort = year.toString().substring(2);
      period = `${monthStr}-${yearShort}`;
    }

    return {
      ...row,
      "Project Name": rawProjectName.toString().trim(),
      "Owner Div": rawDiv.toString().trim(),
      "Owner Name": row["Owner Name"] ? String(row["Owner Name"]).trim() : "Unknown Owner",
      "PIC Name": row["PIC Name"] ? String(row["PIC Name"]).trim() : "Unknown PIC",
      "Last Status": row["Last Status"] ? String(row["Last Status"]).trim() : "Unknown Status",
      "Type Project": row["Type Project"] ? String(row["Type Project"]).trim() : "Project Utama",
      "Period": period,
      "(FSD) Status": row["(FSD) Status"] ? String(row["(FSD) Status"]).trim() : "",
      "(Dev) Status": row["(Dev) Status"] ? String(row["(Dev) Status"]).trim() : "",
      "(SIT) Status": row["(SIT) Status"] ? String(row["(SIT) Status"]).trim() : ""
    };
  });
}

declare global {
  interface Window {
    rawMasterDataset?: any[];
  }
}

function getUnifiedDataset(masterList: any[], static2025: any[]): any[] {
  // 1. Take everything from master EXCEPT 2025 data (to avoid duplication/conflict)
  const masterFiltered = masterList.filter((item) => {
    const { year } = getProjectMonthAndYear(item);
    return year !== 2025;
  });

  // Ensure 2025 static data is properly sanitized and has valid Period
  const sanitizedStatic2025 = sanitizeAndLoadMasterJSON(static2025);

  // 2. Merge with our exclusive 2025 source
  return [...masterFiltered, ...sanitizedStatic2025];
}

function getBusinessOperationalData(dataset: any[]): any[] {
  if (!dataset || !Array.isArray(dataset)) return [];
  
  return dataset.filter(item => {
    if (!item || typeof item !== "object") return false;
    const projType = (item["Project Type"] || item["Type"] || item["Type Project"] || "").toString().toUpperCase();
    const division = item["Owner Div"] ? String(item["Owner Div"]).trim().toUpperCase() : "";
    const type = item["Type Project"] ? String(item["Type Project"]).trim().toUpperCase() : "";
    const name = item["Project Name"] ? String(item["Project Name"]).trim().toUpperCase() : "";
    
    // Strict Internal IT & Wisesa Exclusion based on project type, and standard IT division/Approval Digital rules
    if (projType === "INTERNAL IT" || projType === "WISESA" || division === "IT" || division === "INFORMATION TECHNOLOGY" || division === "WISESA") {
      return false;
    }
    
    const isApprovalDigital = type === "APPROVAL DIGITAL" || name.startsWith("APPROVAL DIGITAL");
    return !isApprovalDigital;
  });
}

export default function App() {
  // ---- Internal Core States ----
  const [rawProjects, setRawProjects] = useState<any[]>(() => {
    const sanitized = sanitizeAndLoadMasterJSON(DEFAULT_RAW_PROJECTS);
    const unified = getUnifiedDataset(sanitized, static2025Data);
    if (typeof window !== "undefined") {
      window.rawMasterDataset = unified;
    }
    return unified;
  });
  const [isCustomLoaded, setIsCustomLoaded] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Sync banner visibility when isCustomLoaded changes
  useEffect(() => {
    if (isCustomLoaded) {
      setShowSuccessAlert(true);
    } else {
      setShowSuccessAlert(false);
    }
  }, [isCustomLoaded]);

  // Auto-hide banner after 5 seconds to maximize visual real estate
  useEffect(() => {
    if (isCustomLoaded && showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isCustomLoaded, showSuccessAlert]);
  const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: Pipeline, 2: SLA, 3: Category, 4: Projects
  const [isDragging, setIsDragging] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Period Filter Date Range States ----
  const [startMonth, setStartMonth] = useState<string>("Jan");
  const [startYear, setStartYear] = useState<number>(2024);
  const [endMonth, setEndMonth] = useState<string>("Dec");
  const [endYear, setEndYear] = useState<number>(2026);

  // Helper arrays for date validation
  const MONTH_NAMES = useMemo(() => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], []);
  const MONTH_INDEX_MAP = useMemo<Record<string, number>>(() => ({
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  }), []);

  const getPeriodScoreIdx = (month: string, year: number): number => {
    const mIdx = MONTH_INDEX_MAP[month] ?? 0;
    return (year * 12) + mIdx;
  };

  const handleStartMonthChange = (val: string) => {
    setStartMonth(val);
    const scoreStart = getPeriodScoreIdx(val, startYear);
    const scoreEnd = getPeriodScoreIdx(endMonth, endYear);
    if (scoreStart > scoreEnd) {
      setEndMonth(val);
      setEndYear(startYear);
    }
  };

  const handleStartYearChange = (val: number) => {
    setStartYear(val);
    const scoreStart = getPeriodScoreIdx(startMonth, val);
    const scoreEnd = getPeriodScoreIdx(endMonth, endYear);
    if (scoreStart > scoreEnd) {
      setEndMonth(startMonth);
      setEndYear(val);
    }
  };

  const handleEndMonthChange = (val: string) => {
    const sysDate = new Date();
    const curYear = sysDate.getFullYear();
    const curMonthIdx = sysDate.getMonth();

    let targetMonth = val;
    if (endYear === curYear) {
      const idx = MONTH_INDEX_MAP[val] ?? 0;
      if (idx > curMonthIdx) {
        targetMonth = MONTH_NAMES[curMonthIdx];
      }
    }

    setEndMonth(targetMonth);
    const scoreStart = getPeriodScoreIdx(startMonth, startYear);
    const scoreEnd = getPeriodScoreIdx(targetMonth, endYear);
    if (scoreStart > scoreEnd) {
      setEndMonth(startMonth);
      setEndYear(startYear);
    }
  };

  const handleEndYearChange = (val: number) => {
    const sysDate = new Date();
    const curYear = sysDate.getFullYear();
    const curMonthIdx = sysDate.getMonth();

    let targetYear = val;
    let targetMonth = endMonth;

    if (targetYear === curYear) {
      const idx = MONTH_INDEX_MAP[endMonth] ?? 0;
      if (idx > curMonthIdx) {
        targetMonth = MONTH_NAMES[curMonthIdx];
        setEndMonth(targetMonth);
      }
    }

    setEndYear(targetYear);
    const scoreStart = getPeriodScoreIdx(startMonth, startYear);
    const scoreEnd = getPeriodScoreIdx(targetMonth, targetYear);
    if (scoreStart > scoreEnd) {
      setEndMonth(startMonth);
      setEndYear(startYear);
    }
  };

  // ---- Parsing & Sanitising Pipeline ----
  const sanitizedProjects = useMemo(() => {
    return sanitizeProjects(rawProjects);
  }, [rawProjects]);

  const businessRawProjects = useMemo(() => {
    const rawList = window.rawMasterDataset || rawProjects || [];
    return getBusinessOperationalData(rawList);
  }, [rawProjects]);

  const businessSanitizedProjects = useMemo(() => {
    return sanitizeProjects(businessRawProjects);
  }, [businessRawProjects]);

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    sanitizedProjects.forEach((p) => {
      const yr = parseInt(p._year, 10);
      if (!isNaN(yr)) {
        yearsSet.add(yr);
      }
    });
    const list = Array.from(yearsSet).sort((a, b) => a - b);
    if (list.length === 0) {
      return [2024, 2025, 2026];
    }
    return list;
  }, [sanitizedProjects]);

  // Synchronise when dataset available years change
  React.useEffect(() => {
    if (availableYears.length > 0) {
      const sysDate = new Date();
      const curYear = sysDate.getFullYear();
      const curMonthIdx = sysDate.getMonth();

      const defaultStartYear = availableYears[0];
      const defaultEndYear = availableYears[availableYears.length - 1];

      setStartYear(defaultStartYear);
      setEndYear(defaultEndYear);
      setStartMonth("Jan");

      if (defaultEndYear === curYear) {
        setEndMonth(MONTH_NAMES[curMonthIdx]);
      } else {
        setEndMonth("Dec");
      }
    }
  }, [availableYears, MONTH_NAMES]);

  const businessFilteredProjects = useMemo(() => {
    const MONTH_MAP: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      mei: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      agu: 7,
      sep: 8,
      oct: 9,
      okt: 9,
      nov: 10,
      dec: 11,
      des: 11
    };

    const parsePeriodToScore = (period: string | null | undefined): number | null => {
      if (!period) return null;
      const parts = period.trim().split("-");
      if (parts.length < 2) return null;
      const monthStr = parts[0].toLowerCase();
      const yearStr = parts[1];

      const monthIndex = MONTH_MAP[monthStr];
      if (monthIndex === undefined) return null;

      let year = parseInt(yearStr, 10);
      if (isNaN(year)) return null;

      if (yearStr.length === 2) {
        year = 2000 + year;
      }
      return (year * 12) + monthIndex;
    };

    const getComboScore = (month: string, year: number): number => {
      const mIndex = MONTH_MAP[month.toLowerCase()] ?? 0;
      return (year * 12) + mIndex;
    };

    const scoreStart = getComboScore(startMonth, startYear);
    const scoreEnd = getComboScore(endMonth, endYear);

    return businessSanitizedProjects.filter((p) => {
      const periodStr = p["Period"];
      if (!periodStr) return false;

      const scoreProject = parsePeriodToScore(periodStr);
      if (scoreProject === null) return false;

      return scoreProject >= scoreStart && scoreProject <= scoreEnd;
    });
  }, [businessSanitizedProjects, startMonth, startYear, endMonth, endYear]);

  const businessDataset = useMemo(() => {
    return computeDashboardMetrics(businessFilteredProjects, businessSanitizedProjects, startMonth, endMonth);
  }, [businessFilteredProjects, businessSanitizedProjects, startMonth, endMonth]);

  // ---- File Upload Handlers (FileReader HTML5 API) ----
  const processUploadedFile = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      triggerAlert("Format file tidak valid. Silakan unggah file dengan format .json");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          throw new Error("Struktur data tidak valid. File JSON harus berupa Array of Objects.");
        }

        if (parsed.length === 0) {
          throw new Error("Array JSON kosong! Unggah file yang memiliki catatan project valid.");
        }

        // Run validation on critical fields of first object as quick sanity check
        const sample = parsed[0];
        if (!sample || (typeof sample !== "object")) {
          throw new Error("Elemen di dalam array bukan merupakan objek.");
        }

        const sanitizedFullData = sanitizeAndLoadMasterJSON(parsed);
        const unifiedData = getUnifiedDataset(sanitizedFullData, static2025Data);
        window.rawMasterDataset = unifiedData;
        console.log("Global State Ingested:", window.rawMasterDataset.length); // Must equal 530

        setRawProjects(unifiedData);
        setIsCustomLoaded(true);
        setActiveTab(0); // bounce user back to first view to immediately notice visual changes!
        triggerAlert(`${unifiedData.length} Records Loaded Successfully! Berhasil memproses & menyelaraskan database kustom Anda!`);
      } catch (err: any) {
        triggerAlert(`Gagal mengurai JSON: ${err.message}`);
      }
    };
    reader.onerror = () => {
      triggerAlert("Gagal membaca file dari penyimpanan lokal Anda.");
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const triggerAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => {
      setAlertMessage(null);
    }, 4500);
  };

  const handleResetToDefault = () => {
    if (confirm("Apakah Anda yakin ingin mematikan data kustom dan kembali ke database default?")) {
      const sanitizedDefault = sanitizeAndLoadMasterJSON(DEFAULT_RAW_PROJECTS);
      window.rawMasterDataset = sanitizedDefault;
      setRawProjects(sanitizedDefault);
      setIsCustomLoaded(false);
      setActiveTab(0);
      triggerAlert("Database dashboard berhasil dipulihkan ke default!");
    }
  };

  // ---- Navigation Definition ----
  const tabs = [
    { label: "Overview", icon: "grid", description: "" },
    { label: "Pipelines", icon: "layers", description: "" },
    { label: "Milestone & SLA", icon: "gauge", description: "" },
    { label: "Kategori & Divisi", icon: "pie", description: "" },
    { label: "Project List", icon: "folder", description: "" }
  ];

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleFileDrop}
      className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row relative font-sans text-gray-800 antialiased selection:bg-blue-100 selection:text-blue-900"
    >
      {/* Immersive Fullscreen Drag Over Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-600/90 flex flex-col items-center justify-center text-white backdrop-blur-md p-10 pointer-events-none transition-all duration-300">
          <div className="p-6 bg-white/10 rounded-full animate-bounce mb-4 border border-white/20">
            <Icon name="upload" className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-center">
            Lepas file JSON kustom Anda di sini
          </h2>
          <p className="text-white/80 text-sm font-medium mt-2 max-w-sm text-center leading-relaxed">
            Metrik, bagan, leaderboard, dan audit project akan langsung mengkalibrasi ulang seketika!
          </p>
        </div>
      )}

      {/* Floating System Alerts */}
      {alertMessage && (
        <div className="fixed top-5 right-5 z-40 bg-gray-950 text-white rounded-xl shadow-2xl p-4 border border-white/10 max-w-sm select-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-white/10 text-blue-400 flex-shrink-0">
              <Icon name="sparkles" className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 pr-4">
              <p className="text-xs font-bold font-sans text-white/95 leading-snug">System Notification</p>
              <p className="text-[11px] text-white/70 font-medium leading-relaxed mt-0.5">{alertMessage}</p>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className="text-white/40 hover:text-white cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR: Static Panel */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col pt-5 shrink-0 select-none">
        <div className="px-5 pb-5 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Icon name="grid" className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-gray-900 font-display tracking-tight uppercase leading-none">
                ADV
              </h1>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wide font-sans uppercase mt-1">
                Project Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 px-3.5 py-4 space-y-1">
          {tabs.map((t, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-500 hover:bg-gray-55/40 hover:text-gray-900"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? "bg-white/15 text-white" : "text-gray-400 group-hover:text-blue-600"}`}>
                  <Icon name={t.icon} className="w-4 h-4 stroke-[1.8px]" />
                </div>
                <div>
                  <span className="text-[12.5px] font-bold block leading-none font-display">
                    {t.label}
                  </span>
                  {t.description && (
                    <span className={`text-[10px] block mt-0.5 font-medium ${isActive ? "text-white/70" : "text-gray-400"}`}>
                      {t.description}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Reset / Branding bottom panel */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/50 space-y-2">
          {isCustomLoaded ? (
            <button
              onClick={handleResetToDefault}
              className="w-full h-8.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-100 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Icon name="x" className="w-3.5 h-3.5" />
              Kembalikan Default
            </button>
          ) : (
            <div className="text-[10px] text-gray-400 text-center font-sans">
              Menampilkan <span className="text-gray-600 font-semibold">Database default</span>
            </div>
          )}
          <div className="text-[9.5px] text-gray-400 font-mono text-center leading-relaxed">
            ADV PRO DASHBOARD V2.5
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER: Sticky Header, Banner and view port rendering */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Responsive Sticky Header */}
        <header className="sticky top-0 z-25 bg-white border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 select-none shrink-0 shadow-xs/10">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
              <span>Weekly Publication Report</span>
              <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-sm border border-amber-100/40 text-[9px] uppercase tracking-normal">
                RELEASE 2026
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight font-display mt-1">
              {tabs[activeTab].label} View
            </h2>
          </div>

          {/* Clean Top controls containing interactive file inputs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-gray-400 font-medium font-sans hidden lg:inline mr-2">
              Publication Date: <strong className="text-gray-700">{businessDataset.report.date}</strong>
            </span>

            {/* Dropdown Filter Date Range (Start Date & End Date) */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Start Date Selection */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 h-10 rounded-xl shadow-inner hover:bg-gray-100/50 transition-all focus-within:ring-1 focus-within:ring-blue-650 select-none">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider font-sans whitespace-nowrap">
                  Start:
                </span>
                <select
                  value={startMonth}
                  onChange={(e) => handleStartMonthChange(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-gray-700 focus:outline-none focus:ring-0 cursor-pointer pr-1 leading-none"
                >
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <span className="text-gray-300">|</span>
                <select
                  value={startYear}
                  onChange={(e) => handleStartYearChange(parseInt(e.target.value, 10))}
                  className="bg-transparent border-none text-xs font-bold text-gray-700 focus:outline-none focus:ring-0 cursor-pointer pr-1 leading-none"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* End Date Selection */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 h-10 rounded-xl shadow-inner hover:bg-gray-100/50 transition-all focus-within:ring-1 focus-within:ring-blue-650 select-none">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider font-sans whitespace-nowrap">
                  End:
                </span>
                <select
                  value={endMonth}
                  onChange={(e) => handleEndMonthChange(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-gray-700 focus:outline-none focus:ring-0 cursor-pointer pr-1 leading-none"
                >
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => {
                    const sysDate = new Date();
                    const curYear = sysDate.getFullYear();
                    const curMonthIdx = sysDate.getMonth();
                    const mIdx = MONTH_INDEX_MAP[m] ?? 0;
                    const isFuturistic = endYear === curYear && mIdx > curMonthIdx;
                    if (isFuturistic) return null;
                    return (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    );
                  })}
                </select>
                <span className="text-gray-300">|</span>
                <select
                  value={endYear}
                  onChange={(e) => handleEndYearChange(parseInt(e.target.value, 10))}
                  className="bg-transparent border-none text-xs font-bold text-gray-700 focus:outline-none focus:ring-0 cursor-pointer pr-1 leading-none"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Client-Side HTML5 input click trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer hover:shadow-md active:scale-95 transition-all"
            >
              <Icon name="upload" className="w-3.5 h-3.5" />
              Unggah File JSON
            </button>
          </div>
        </header>

        {/* Status Indicator Banner */}
        {isCustomLoaded && showSuccessAlert && (
          <div className="mx-6 mt-4.5 bg-emerald-50 border border-emerald-100/50 rounded-2xl p-3.5 px-4.5 flex items-center justify-between select-none animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pr-2">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Icon name="sparkles" className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 font-sans">
                  {rawProjects.length} Records Loaded Successfully!
                </p>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5 truncate max-w-[280px] sm:max-w-md lg:max-w-2xl">
                  Dashboard saat ini menampilkan total <strong className="text-emerald-700">{rawProjects.length} catatan</strong> kustom yang dibaca asinkron langsung di browser Anda.
                </p>
              </div>
            </div>
            <button
              onClick={handleResetToDefault}
              className="px-3 py-1 bg-white text-rose-600 border border-rose-100 hover:bg-rose-50 text-[10.5px] font-bold rounded-lg cursor-pointer transition-colors shrink-0"
            >
              Reset
            </button>
          </div>
        )}

        {/* Content Screens Container Port */}
        <div className="flex-1 p-6">
          {activeTab === 0 && (
            <React.Fragment key={`tab-0-${rawProjects.length}`}>
              <TabOverview
                dataset={businessDataset}
                filteredProjects={businessFilteredProjects}
                allProjects={businessSanitizedProjects}
                startMonth={startMonth}
                endMonth={endMonth}
                onNavigateToTab={(idx) => setActiveTab(idx)}
              />
            </React.Fragment>
          )}
          {activeTab === 1 && (
            <React.Fragment key={`tab-1-${rawProjects.length}`}>
              <TabPipeline
                dataset={businessDataset}
                filteredProjects={businessFilteredProjects}
              />
            </React.Fragment>
          )}
          {activeTab === 2 && (
            <React.Fragment key={`tab-2-${rawProjects.length}`}>
              <TabSla
                dataset={businessDataset}
                rawProjects={businessRawProjects}
                filteredProjects={businessFilteredProjects}
                allProjects={businessSanitizedProjects}
                startMonth={startMonth}
                endMonth={endMonth}
                startYear={startYear}
                endYear={endYear}
                onUploadFile={processUploadedFile}
              />
            </React.Fragment>
          )}
          {activeTab === 3 && (
            <React.Fragment key={`tab-3-${rawProjects.length}`}>
              <TabCategory
                dataset={businessDataset}
                rawProjects={businessRawProjects}
                filteredProjects={businessFilteredProjects}
                startMonth={startMonth}
                endMonth={endMonth}
                startYear={startYear}
                endYear={endYear}
                onUploadFile={processUploadedFile}
              />
            </React.Fragment>
          )}
          {activeTab === 4 && (
            <React.Fragment key={`tab-4-${rawProjects.length}`}>
              <TabProjects
                projects={sanitizeProjects(window.rawMasterDataset || rawProjects || [])}
              />
            </React.Fragment>
          )}
        </div>
      </main>
    </div>
  );
}
