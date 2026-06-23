import { RawProject, SanitizedProject, DashboardDataset, KpiItem, MilestoneItem } from "./types";
import { getProjectIntakeYear, getActiveSlaPool } from "./utils";

export function statusGroupOf(status: string | null): string {
  const s = (status || '').trim();
  if (/Queue/i.test(s)) return 'Antrian';
  if (/^(FPS|FSD|Dev|SIT)$/i.test(s) || /Progress/i.test(s)) return 'Dalam Proses';
  if (/UAT/i.test(s)) return 'UAT';
  if (/Monitoring/i.test(s)) return 'Monitoring';
  if (/Hold/i.test(s)) return 'Hold';
  if (/Change Request/i.test(s)) return 'Change Request';
  if (/Canceled/i.test(s)) return 'Canceled';
  if (/Live/i.test(s)) return 'Live';
  return 'Lainnya';
}

export function statusKindOfStatus(status: string | null): string {
  const g = statusGroupOf(status);
  if (g === 'Live') return 'stable';
  if (g === 'Canceled') return 'critical';
  if (g === 'Hold') return 'hold';
  if (g === 'Antrian') return 'queue';
  if (g === 'UAT') return 'uat';
  if (g === 'Monitoring') return 'monitoring';
  return 'progress';
}

function parseLate(val: any): number | null {
  if (val == null) return null;
  const m = String(val).match(/^(-?\d+)/);
  return m ? parseInt(m[1]) : null;
}

function parsePercent(val: any): number | null {
  if (val == null) return null;
  const m = String(val).match(/(\d+)/);
  return m ? parseInt(m[1]) : null;
}

// Strictly adheres to the requested sanitization block
export function sanitizeProjects(data: RawProject[]): SanitizedProject[] {
  return data.map(d => ({
    ...d,
    _year:       getProjectIntakeYear(d),
    _period:     d["Period"] != null ? d["Period"] : "Unscheduled",
    _typeGroup: (function(t) {
      if (!t) return "Other";
      if (["Enhance Kecil","Hold Enhance Kecil","Antrian Enhance Kecil"].includes(t)) return "Enhance Kecil";
      if (["Project Utama","Hold Project Utama","Antrian Project Utama"].includes(t)) return "Project Utama";
      if (t === "Approval Digital") return "Approval Digital";
      if (t === "Internal IT") return "Internal IT";
      return "Other";
    })(d["Type Project"]),
    _lateFSD:    parseLate(d["(FSD) Late Days"]),
    _lateDev:    parseLate(d["(Dev) Late Days"]),
    _lateSIT:    parseLate(d["(SIT) Late Days"]),
    _lateUAT:    parseLate(d["(UAT) Late Days"]),
    _lateLive:   parseLate(d["Live (Late Days)"]),
    _achDev:     parsePercent(d["Achieved Dev %"]),
    _achFSD:     parsePercent(d["Achieved FSD %"]),
    _achLive:    parsePercent(d["Achieved Live"]),
    _achSIT:     parsePercent(d["Achieved SIT %"]),
    _achUAT:     parsePercent(d["Achieved UAT %"]),
    _feedback:   (d["Rata-rata Nilai Feedback User : "] && d["Rata-rata Nilai Feedback User : "] > 0) ? d["Rata-rata Nilai Feedback User : "] : null
  }));
}

const MONTH_MAP_LOWER: Record<string, number> = {
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

export function getProjectMonthIndex(p: any): number {
  const period = p["Period"];
  if (!period) return -1;
  const parts = period.trim().split("-");
  if (parts.length === 0) return -1;
  const monthStr = parts[0].trim().toLowerCase();
  const index = MONTH_MAP_LOWER[monthStr];
  return index !== undefined ? index : -1;
}

export function isMonthInFilterRange(mIdx: number, startIdx: number, endIdx: number): boolean {
  if (mIdx === -1) return false;
  if (startIdx <= endIdx) {
    return mIdx >= startIdx && mIdx <= endIdx;
  } else {
    return mIdx >= startIdx || mIdx <= endIdx;
  }
}

export function computeDashboardMetrics(data: SanitizedProject[], rawData?: RawProject[], startMonth?: string, endMonth?: string): DashboardDataset {
  // 1. Report Date
  let reportDate = "17 Juni 2026";
  const editedTimes = data.map(d => d["Last edited time"]).filter(Boolean);
  if (editedTimes.length > 0) {
    // Attempt to extract the date from the first edited record or latest
    const firstVal = editedTimes[0];
    const m = firstVal.match(/^([A-Za-z]+ \d+, \d{4})/);
    if (m) reportDate = m[1];
  }

  // Active status groups are everything except Canceled and Live
  const activeTypes = ['Antrian', 'Dalam Proses', 'UAT', 'Monitoring', 'Hold', 'Change Request'];
  const activeProjects = data.filter(p => activeTypes.includes(statusGroupOf(p["Last Status"])));

  const actualRawData = rawData || data;
  const queueStatuses = ["On Queue", "Dev On Queue", "UAT On Queue", "Live On Queue"];
  const queueCount = actualRawData.filter(d => d["Last Status"] && queueStatuses.includes(d["Last Status"])).length;
  const progressCount = data.filter(p => statusGroupOf(p["Last Status"]) === 'Dalam Proses').length;
  const uatCount = data.filter(d => d["Last Status"] && (d["Last Status"].toLowerCase().includes("uat on queue") || d["Last Status"].toLowerCase().includes("uat on progress"))).length;
  const monitoringCount = data.filter(p => statusGroupOf(p["Last Status"]) === 'Monitoring').length;
  const holdCount = data.filter(p => statusGroupOf(p["Last Status"]) === 'Hold').length;

  const holdByOwner = data.filter(p => p["Last Status"] === "Hold By Owner").length;
  const holdByVendor = data.filter(p => ["Hold By Client/Vendor", "Hold By IT"].includes(p["Last Status"])).length;

  const activeTotalCount = activeProjects.length;

  // Let's count high delay active projects as needing attention
  const needAttentionCount = activeProjects.filter(p => {
    const devLate = p._lateDev || 0;
    const fsdLate = p._lateFSD || 0;
    const sitLate = p._lateSIT || 0;
    const uatLate = p._lateUAT || 0;
    const liveLate = p._lateLive || 0;
    return devLate > 14 || fsdLate > 14 || sitLate > 14 || uatLate > 14 || liveLate > 14 || (p["Reschedule UAT"] && p["Reschedule UAT"] > 1);
  }).length;

  const year2026Count = data.filter(p => p._year === "2026").length;

  const masterList = (rawData && rawData.length > 0) ? (rawData as SanitizedProject[]) : data;
  const activeMasterList = getActiveSlaPool(masterList);

  // 2. Milestone SLA Pct helper
  const getStageSlaResult = (field: "FSD SLA" | "DEV SLA" | "SIT SLA" | "UAT SLA" | "Live SLA") => {
    const activePool = getActiveSlaPool(data);
    const totalProj = activePool.length;
    const missedProj = activePool.filter(p => p[field] === "Not Achieved").length;
    const pct = totalProj > 0 ? Math.round(((totalProj - missedProj) / totalProj) * 100) : 100;
    return { pct, notAch: missedProj };
  };

  const fsdSla = getStageSlaResult("FSD SLA");
  const devSla = getStageSlaResult("DEV SLA");
  const sitSla = getStageSlaResult("SIT SLA");
  const uatSla = getStageSlaResult("UAT SLA");
  const liveSla = getStageSlaResult("Live SLA");

  const milestones: MilestoneItem[] = [
    { stage: "FSD", pct: fsdSla.pct, notAch: fsdSla.notAch, color: "#3B82F6" },
    { stage: "Development", pct: devSla.pct, notAch: devSla.notAch, color: "#2563EB" },
    { stage: "SIT", pct: sitSla.pct, notAch: sitSla.notAch, color: "#10B981" },
    { stage: "UAT", pct: uatSla.pct, notAch: uatSla.notAch, color: "#F59E0B" },
    { stage: "Live", pct: liveSla.pct, notAch: liveSla.notAch, color: "#059669" }
  ];

  const startIdx = startMonth ? (MONTH_MAP_LOWER[startMonth.toLowerCase()] ?? 0) : 0;
  const endIdx = endMonth ? (MONTH_MAP_LOWER[endMonth.toLowerCase()] ?? 11) : 11;

  // Dev SLA in 2026 KPI
  let devSla2026Proj = activeMasterList.filter(p => (p._year === "2026" || String(p["Year"]) === "2026") && (p["DEV SLA"] === "Achieved" || p["DEV SLA"] === "Not Achieved"));
  if (startMonth || endMonth) {
    devSla2026Proj = devSla2026Proj.filter(p => {
      const mIdx = getProjectMonthIndex(p);
      return isMonthInFilterRange(mIdx, startIdx, endIdx);
    });
  }
  const devSla2026Ach = devSla2026Proj.filter(p => p["DEV SLA"] === "Achieved").length;
  const devSla2026Total = devSla2026Proj.length;
  const devSla2026Pct = devSla2026Total > 0 ? Math.round((devSla2026Ach / devSla2026Total) * 100) : 100;
  
  let devSla2026MissedProjs = activeMasterList.filter(p => (p._year === "2026" || String(p["Year"]) === "2026") && p["DEV SLA"] === "Not Achieved");
  if (startMonth || endMonth) {
    devSla2026MissedProjs = devSla2026MissedProjs.filter(p => {
      const mIdx = getProjectMonthIndex(p);
      return isMonthInFilterRange(mIdx, startIdx, endIdx);
    });
  }

  // YoY SLA
  const years = ["2021", "2022", "2023", "2024", "2025", "2026"];
  const yoySla = years.map(y => {
    let yProj = activeMasterList.filter(p => p._year === y || String(p["Year"]) === y);
    if (startMonth || endMonth) {
      yProj = yProj.filter(p => {
        const mIdx = getProjectMonthIndex(p);
        return isMonthInFilterRange(mIdx, startIdx, endIdx);
      });
    }
    const slaProj = yProj.filter(p => p["DEV SLA"] === "Achieved" || p["DEV SLA"] === "Not Achieved");
    const yAch = slaProj.filter(p => p["DEV SLA"] === "Achieved").length;
    const yTotal = slaProj.length;
    const pct = yTotal > 0 ? Math.round((yAch / yTotal) * 100) : 100;

    const inProgress = yProj.filter(p => p["(Dev) Status"] && p["(Dev) Status"] !== "Done").length;
    const completed = yProj.filter(p => p["(Dev) Status"] === "Done").length;
    const totalDelayDays = yProj.reduce((acc, p) => acc + (p._lateDev || 0), 0);

    return {
      year: y,
      pct,
      color: y === "2026" ? "#F59E0B" : "#2563EB",
      inProgress,
      completed,
      totalDelayDays
    };
  });

  // User Feedback Summary
  const fbVals = data.map(p => p._feedback).filter((f): f is number => f !== null && f > 0);
  const fbAvg = fbVals.length > 0 ? fbVals.reduce((a, b) => a + b, 0) / fbVals.length : 0;
  const fbScore = fbAvg.toFixed(2);
  const fbFilled = Math.round(fbAvg);

  // UAT Rescheduled Active Rows
  const reschedTotalNum = data.filter(p => p["Reschedule UAT"] && p["Reschedule UAT"] > 0).length;
  const reschedActiveNum = activeProjects.filter(p => p["Reschedule UAT"] && p["Reschedule UAT"] > 0).length;

  const reschedRows = data
    .filter(p => p["Reschedule UAT"] && p["Reschedule UAT"] > 0)
    .sort((a, b) => (b["Reschedule UAT"] || 0) - (a["Reschedule UAT"] || 0))
    .slice(0, 5)
    .map(p => ({
      name: p["Project Name"],
      status: p["Last Status"] || "Unknown",
      statusKind: statusKindOfStatus(p["Last Status"]),
      count: `${p["Reschedule UAT"]}×`,
      originalProject: p
    }));

  // Go-live list (Completed projects, sorted by Live realized date)
  const goLiveList = data
    .filter(p => statusGroupOf(p["Last Status"]) === 'Live' || p["Last Status"] === "Live On Monitoring")
    .map(p => p["Project Name"])
    .slice(0, 9);

  // SLA Total 2026 (Dev SLA Total achieved count)
  const slaTotal2026 = devSla2026Ach;

  // Compute division leaderboard
  const divisionsMap: Record<string, { total: number; achieved: number; not: number }> = {};
  data.forEach(p => {
    const div = p["Owner Div"] || "Unassigned";
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

  const leaderboard = Object.keys(divisionsMap)
    .map(div => {
      const stats = divisionsMap[div];
      const sla = stats.total > 0 ? Math.round((stats.achieved / stats.total) * 100) : 100;
      return {
        division: div,
        sla,
        not: stats.not,
        evaluated: stats.total
      };
    })
    .sort((a, b) => b.sla - a.sla || b.evaluated - a.evaluated)
    .map((item, idx) => ({
      rank: idx + 1,
      ...item
    }));

  const lowestDivName = leaderboard.length > 0 ? leaderboard[leaderboard.length - 1].division : "None";
  const lowestDivSla = leaderboard.length > 0 ? leaderboard[leaderboard.length - 1].sla : 100;

  // Sum total unique PICs
  const uniquePics = new Set(data.map(p => p["PIC Name"]).filter(Boolean)).size;
  const uniqueDivs = new Set(data.map(p => p["Owner Div"]).filter(Boolean)).size;
  const uniqueTypes = new Set(data.map(p => p._typeGroup).filter(Boolean)).size;

  // Count projects grouped by type for bars
  const typeMap: Record<string, number> = {};
  data.forEach(p => {
    const val = p._typeGroup || "Other";
    typeMap[val] = (typeMap[val] || 0) + 1;
  });
  const categories = Object.keys(typeMap).map(k => ({
    label: k,
    value: typeMap[k],
    color: k === "Project Utama" ? "#2563EB" : k === "Enhance Kecil" ? "#3B82F6" : k === "Approval Digital" ? "#10B981" : k === "Internal IT" ? "#F59E0B" : "#64748B"
  })).sort((a, b) => b.value - a.value);

  // Group status by statusGroupOf for Pie
  const statusPieMap: Record<string, number> = {};
  data.forEach(p => {
    const val = statusGroupOf(p["Last Status"]);
    statusPieMap[val] = (statusPieMap[val] || 0) + 1;
  });
  const statusPieColors: Record<string, string> = {
    'Live': '#059669',
    'Canceled': '#E11D48',
    'Hold': '#A855F7',
    'Antrian': '#D97706',
    'UAT': '#3B82F6',
    'Monitoring': '#0891B2',
    'Dalam Proses': '#2563EB',
    'Change Request': '#7C3AED'
  };
  const statusPie = Object.keys(statusPieMap).map(k => ({
    label: k,
    value: statusPieMap[k],
    color: statusPieColors[k] || '#64748B'
  })).sort((a, b) => b.value - a.value);

  // Group by priority
  const priorityMap: Record<string, number> = {};
  data.forEach(p => {
    const val = p["Prioritas Mgmt"] || "Medium";
    priorityMap[val] = (priorityMap[val] || 0) + 1;
  });
  const priorityColors: Record<string, string> = {
    'High': '#EF4444',
    'Medium': '#F59E0B',
    'Low': '#10B981'
  };
  const priorities = Object.keys(priorityMap).map(k => ({
    label: k,
    value: priorityMap[k],
    color: priorityColors[k] || '#3B82F6'
  })).sort((a, b) => b.value - a.value);

  // Divisions absolute project counts
  const divCountMap: Record<string, number> = {};
  data.forEach(p => {
    const div = p["Owner Div"] || "Unassigned";
    divCountMap[div] = (divCountMap[div] || 0) + 1;
  });
  const divisions = Object.keys(divCountMap).map(k => ({
    label: k,
    value: divCountMap[k],
    color: "#2563EB"
  })).sort((a, b) => b.value - a.value);

  // Active projects grouped by type and division
  const activeTypeMap: Record<string, number> = {};
  const activeDivMap: Record<string, number> = {};
  activeProjects.forEach(p => {
    activeTypeMap[p._typeGroup] = (activeTypeMap[p._typeGroup] || 0) + 1;
    const div = p["Owner Div"] || "Unassigned";
    activeDivMap[div] = (activeDivMap[div] || 0) + 1;
  });

  const activeByType = Object.keys(activeTypeMap).map(k => ({ label: k, value: activeTypeMap[k] })).sort((a, b) => b.value - a.value);
  const activeByDivision = Object.keys(activeDivMap).map(k => ({ label: k, value: activeDivMap[k] })).sort((a, b) => b.value - a.value);

  // Projects by Year
  const projectsByYear = years.map(y => {
    const val = data.filter(p => p._year === y).length;
    return {
      year: y,
      value: val,
      color: y === "2026" ? "#F59E0B" : "#2563EB",
      note: y === "2026" ? "Running Year" : undefined
    };
  });

  // Heatmap completed vs active vs canceled per year
  const heatmap = years.map(y => {
    const yProj = data.filter(p => p._year === y);
    const completed = yProj.filter(p => statusGroupOf(p["Last Status"]) === 'Live').length;
    const active = yProj.filter(p => activeTypes.includes(statusGroupOf(p["Last Status"]))).length;
    const canceled = yProj.filter(p => statusGroupOf(p["Last Status"]) === 'Canceled').length;
    return {
      year: y,
      completed,
      active,
      canceled
    };
  });

  // Delivery Depth
  const depth = ["2025", "2026"].map(y => {
    let yProj = masterList.filter(p => p._year === y || String(p["Year"]) === y);
    if (startMonth || endMonth) {
      yProj = yProj.filter(p => {
        const mIdx = getProjectMonthIndex(p);
        return isMonthInFilterRange(mIdx, startIdx, endIdx);
      });
    }
    const completed = yProj.filter(p => statusGroupOf(p["Last Status"]) === 'Live').length;
    const inflight = yProj.filter(p => activeTypes.includes(statusGroupOf(p["Last Status"]))).length;
    return {
      year: y,
      completed,
      inflight
    };
  });

  // Dev SLA YoY grouped bar
  const devSlaYoY = years.map(y => {
    let yProj = masterList.filter(p => (p._year === y || String(p["Year"]) === y) && (p["DEV SLA"] === "Achieved" || p["DEV SLA"] === "Not Achieved"));
    if (startMonth || endMonth) {
      yProj = yProj.filter(p => {
        const mIdx = getProjectMonthIndex(p);
        return isMonthInFilterRange(mIdx, startIdx, endIdx);
      });
    }
    const achieved = yProj.filter(p => p["DEV SLA"] === "Achieved").length;
    const not = yProj.filter(p => p["DEV SLA"] === "Not Achieved").length;
    return {
      year: y,
      achieved,
      not
    };
  });

  // Delay phase top list (total delay > 0)
  const phaseDelays = data
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

      // compile list of delayed stages
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
        statusKind: statusKindOfStatus(p["Last Status"])
      };
    })
    .sort((a, b) => b.days - a.days)
    .map((item, idx) => ({
      no: idx + 1,
      ...item
    }));

  // Group root cause categories of delays
  const rootCauseMap: Record<string, number> = {};
  data.forEach(p => {
    const devLate = p._lateDev || 0;
    if (devLate > 0) {
      const cause = p["(Dev) Kategori Alasan Terlambat >=2022"] || "No Info";
      rootCauseMap[cause] = (rootCauseMap[cause] || 0) + 1;
    }
  });

  const rootCauseColors: Record<string, string> = {
    'Planning IT': '#2563EB',
    'Bug/Temuan': '#F59E0B',
    'Scope Change': '#38BDF8',
    'No Info': '#94A3B8',
    'Resource': '#10B981',
    'Vendor': '#EC4899'
  };

  const rootCause = Object.keys(rootCauseMap).map(k => ({
    label: k,
    value: rootCauseMap[k],
    color: rootCauseColors[k] || '#A855F7'
  })).sort((a, b) => b.value - a.value);

  // Multi Stage Failure (>1 stage SLA === "Not Achieved")
  const multiStage = data
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
        name: p["Project Name"],
        stages,
        year: p["Year"] || 2026,
        status: p["Last Status"] || "Unknown",
        statusKind: statusKindOfStatus(p["Last Status"]),
        severity: (failedCount >= 4 ? 'Critical' : failedCount >= 3 ? 'High' : 'Medium') as 'Critical' | 'High' | 'Medium'
      };
    });

  // Throughput (dynamic Monthly completed go live timeline)
  // Let's count completion count of live projects indexed by their starting or completed date
  const comp_months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const comp_months_mei = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des"];

  const getCompletionsForYearAndMonth = (year: number, mIdx: number) => {
    return actualRawData.filter(p => {
      const lastStatus = (p["Last Status"] || "").toLowerCase();
      const milestone = (p["Milestone"] || "").toLowerCase();
      const isCompleted = lastStatus === "live" || lastStatus.includes("live") || milestone === "closed" || milestone.includes("closed") || p["(Live) Realized in date"] != null;
      if (!isCompleted) return false;

      const rDate = p["(Live) Realized in date"];
      if (rDate) {
        const s = String(rDate).trim().toLowerCase();
        if (s.includes(String(year))) {
          if (s.includes(comp_months[mIdx]) || s.includes(comp_months_mei[mIdx])) {
            return true;
          }
        }
      }

      const period = p["Period"] || p["_period"];
      const yearVal = getProjectIntakeYear(p);
      if (period && yearVal) {
        const parts = String(period).trim().split("-");
        if (parts.length > 0) {
          const mStr = parts[0].trim().toLowerCase();
          const pMIdx = comp_months.indexOf(mStr) !== -1 ? comp_months.indexOf(mStr) : comp_months_mei.indexOf(mStr);
          const pYr = parseInt(String(yearVal), 10);
          if (pMIdx === mIdx && pYr === year) {
            return true;
          }
        }
      }
      return false;
    }).length;
  };

  const monthIndices: number[] = [];
  if (startIdx <= endIdx) {
    for (let i = startIdx; i <= endIdx; i++) {
      monthIndices.push(i);
    }
  } else {
    for (let i = startIdx; i < 12; i++) monthIndices.push(i);
    for (let i = 0; i <= endIdx; i++) monthIndices.push(i);
  }

  const points = monthIndices.map(idx => {
    const val25 = getCompletionsForYearAndMonth(2025, idx);
    const val26 = getCompletionsForYearAndMonth(2026, idx);
    return {
      ym: `2025-${String(idx + 1).padStart(2, "0")}`,
      label: `${comp_months[idx].toUpperCase()} 25`,
      value: val25 || 0,
      val2025: val25,
      val2026: val26
    };
  });

  // Calculate sum of evaluated SLAs across all projects of the dataset
  let totalEvaluations = 0;
  let totalSuccess = 0;
  const slaFields: ("FSD SLA" | "DEV SLA" | "SIT SLA" | "UAT SLA" | "Live SLA")[] = ["FSD SLA", "DEV SLA", "SIT SLA", "UAT SLA", "Live SLA"];
  data.forEach(p => {
    slaFields.forEach(f => {
      if (p[f] === "Achieved" || p[f] === "Not Achieved") {
        totalEvaluations++;
        if (p[f] === "Achieved") {
          totalSuccess++;
        }
      }
    });
  });

  const overallSlaPct = totalEvaluations > 0 ? Math.round((totalSuccess / totalEvaluations) * 100) : 100;

  return {
    report: {
      date: reportDate,
      newProjects: year2026Count,
      activeTotal: activeTotalCount,
      needAttention: needAttentionCount
    },
    kpis: [
      { key: 'queue', label: 'Queue', value: queueCount, sub: 'Waiting to start', color: '#D97706', icon: 'Inbox', filter: 'Antrian' },
      { key: 'progress', label: 'In Progress', value: progressCount, sub: 'FSD · Dev · SIT', color: '#2563EB', icon: 'Play', filter: 'Dalam Proses' },
      { key: 'uat', label: 'UAT', value: uatCount, sub: 'Queue & in progress', color: '#3B82F6', icon: 'CheckSquare', filter: 'UAT' },
      { key: 'monitoring', label: 'Monitoring', value: monitoringCount, sub: 'Post go-live', color: '#0891B2', icon: 'Activity', filter: 'Monitoring' },
      { key: 'hold', label: 'Hold', value: holdCount, sub: 'Paused pipelines', color: '#A855F7', icon: 'Pause', filter: 'Hold', split: [
        { label: 'Hold by Owner', value: holdByOwner },
        { label: 'Hold by Client/VENDOR', value: holdByVendor }
      ]}
    ],
    statusCounts: [
      { label: 'Queue', value: queueCount, kind: 'queue' },
      { label: 'In Progress', value: progressCount, kind: 'progress' },
      { label: 'UAT', value: uatCount, kind: 'uat' },
      { label: 'Monitoring', value: monitoringCount, kind: 'monitoring' },
      { label: 'Hold', value: holdCount, kind: 'hold' }
    ],
    milestones,
    devSla2026: {
      pct: devSla2026Pct,
      achieved: devSla2026Ach,
      notAchieved: devSla2026MissedProjs.length,
      target: 93,
      missedProjs: devSla2026MissedProjs
    },
    yoySla,
    feedback: {
      score: fbScore,
      of: 5,
      filled: fbFilled,
      evaluated: fbVals.length
    },
    uatRescheduled: {
      active: reschedActiveNum,
      total: reschedTotalNum,
      rows: reschedRows
    },
    goLive: goLiveList,
    pipelineChips: [
      { label: 'Total Projects', value: data.length, icon: 'Folder', color: 'blue' },
      { label: 'Completed', value: data.filter(p => statusGroupOf(p["Last Status"]) === 'Live').length, icon: 'Done', color: 'green' },
      { label: 'Active', value: activeTotalCount, icon: 'Activity', color: 'amber' },
      { label: 'Canceled', value: data.filter(p => statusGroupOf(p["Last Status"]) === 'Canceled').length, icon: 'X', color: 'red' }
    ],
    projectsByYear,
    onQueue: {
      total: actualRawData.filter(p => p["Last Status"] && ["On Queue", "Dev On Queue", "UAT On Queue", "Live On Queue"].includes(p["Last Status"])).length,
      types: [
        { label: 'On Queue & Dev Queue', value: actualRawData.filter(p => p["Last Status"] === 'On Queue' || p["Last Status"] === 'Dev On Queue').length, kind: 'queue' },
        { label: 'UAT & Live On Queue', value: actualRawData.filter(p => p["Last Status"] === 'UAT On Queue' || p["Last Status"] === 'Live On Queue').length, kind: 'uat' }
      ],
      top: actualRawData
        .filter(p => p["Last Status"] && ["On Queue", "Dev On Queue", "UAT On Queue", "Live On Queue"].includes(p["Last Status"]))
        .map(p => ({
          name: p["Project Name"],
          status: p["Last Status"] || "On Queue",
          kind: statusKindOfStatus(p["Last Status"])
        }))
    },
    throughput: {
      points,
      comparison: monthIndices.map(idx => {
        const val25 = getCompletionsForYearAndMonth(2025, idx);
        const val26 = getCompletionsForYearAndMonth(2026, idx);
        return {
          monthIndex: idx,
          monthName: comp_months[idx].toUpperCase(),
          val2025: val25,
          val2026: val26
        };
      })
    },
    heatmap,
    depth,
    slaTotal2026,
    slaChips: [
      { label: 'Evaluasi SLA', value: totalEvaluations, icon: 'Activity', color: 'blue' },
      { label: 'Achieved SLA', value: totalSuccess, icon: 'Check', color: 'green' },
      { label: 'Unachieved SLA', value: totalEvaluations - totalSuccess, icon: 'X', color: 'red' },
      { label: 'SLA Achievement %', value: `${overallSlaPct}%`, icon: 'Percent', color: 'amber' }
    ],
    slaStageSummary: [
      { stage: 'FSD', pct: fsdSla.pct, notAch: fsdSla.notAch },
      { stage: 'DEV', pct: devSla.pct, notAch: devSla.notAch },
      { stage: 'SIT', pct: sitSla.pct, notAch: sitSla.notAch },
      { stage: 'UAT', pct: uatSla.pct, notAch: uatSla.notAch },
      { stage: 'LIVE', pct: liveSla.pct, notAch: liveSla.notAch }
    ],
    devSlaYoY,
    rootCause,
    multiStage,
    phaseDelays,
    projectChips: [
      { label: 'Total Projects', value: data.length, icon: 'Folder', color: 'blue' },
      { label: 'Active', value: activeTotalCount, icon: 'Activity', color: 'amber' },
      { label: 'Completed', value: data.filter(p => statusGroupOf(p["Last Status"]) === 'Live').length, icon: 'Done', color: 'green' }
    ],
    categoryCards: [
      { label: 'Kategori', value: uniqueTypes, sub: 'Project Types Active', icon: 'Grid', color: 'blue' },
      { label: 'Divisi Terlibat', value: uniqueDivs, sub: 'Business divisions', icon: 'Users', color: 'green' },
      { label: 'Avg Dev SLA %', value: `${overallSlaPct}%`, sub: 'Overall performance', icon: 'Gauge', color: 'amber' },
      { label: 'SLA Dev Terendah', value: `${lowestDivSla}%`, value2: lowestDivName, sub: 'Critically delayed', icon: 'ChevronRight', color: 'red' }
    ],
    categories,
    statusPie,
    priorities,
    divisions,
    leaderboard,
    activeByType,
    activeByDivision
  };
}
