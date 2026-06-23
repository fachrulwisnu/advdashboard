/**
 * Centralized global data mapping utility function to dynamically resolve 
 * and render the "Target/Realized Date" across ALL dashboard components.
 */
export function getGlobalProjectDate(d: any): string {
  if (!d) return "-";
  
  // Normalize the status string to prevent case-sensitivity or trimming bugs
  const status = d["Last Status"] ? String(d["Last Status"]).trim().toLowerCase() : "";
  
  // Base master fallback date to guarantee no row ever turns up blank
  const standardFallback = d["Target/Realized Date"] || "";

  // 1. CHANGE REQUEST ON PROGRESS
  if (status.includes("change request")) {
    return d["(Change Request) Plan in Week"] || d["Last Update"] || standardFallback || "-";
  }

  // 2. FSD ON PROGRESS
  if (status.includes("fsd")) {
    return d["(FSD) Plan in Week"] || 
           d["(FSD) Realized in Date Diisi saat Approval Digital FSD by Owner selesai"] || 
           d["FSD) Realized in Date Diisi saat Approval Digital FSD by Owner selesai"] || 
           standardFallback || "-";
  }
  
  // 3. DEV / DEVELOPMENT ON PROGRESS
  if (status.includes("dev") || status.includes("development")) {
    return d["(Dev) Plan in Week"] || 
           d["(Dev) Realized In Date"] || 
           d["(Dev) Realized Date"] || 
           d["(Dev) Realized in date"] || 
           standardFallback || "-";
  }
  
  // 4. SIT ON PROGRESS
  if (status.includes("sit")) {
    return d["(SIT) Plan in Week"] || 
           d["(SIT) Batch.\nMisal isinya :\n1 (21-11-2021 to 24-11-2021)\n2 (28-11-2021 to 01-12-2021)"] || 
           d["(SIT) Realized in date"] || 
           d["(SIT) Realized in Date"] || 
           standardFallback || "-";
  }
  
  // 5. UAT ON PROGRESS / UAT STAGES
  if (status.includes("uat")) {
    if (status.includes("progress") || status.includes("active") || status === "uat on progress") {
      let rawBatchData = d["(UAT) Batch\nMisal isinya :\n1 (23-11-2021)\n2 (29-11-2021, dilanjutkan 02-12-2021)"] || d["Target/Realized Date"] || "";
      
      if (rawBatchData && rawBatchData !== "-") {
        let formattedBatch = rawBatchData.toString()
          .replace(/\s+(?=\d+\s*\()/g, '\n')
          .trim();
        return formattedBatch;
      }
      return standardFallback || "-";
    }
    
    // Rule A: Formatting for UAT On Queue
    if (status === "uat on queue" || status.includes("queue")) {
      return "UAT On Queue (Menunggu Jadwal Owner)";
    }
    
    return d["(UAT) Progress Updated"] || d["(UAT) Realized In Date"] || standardFallback || "-";
  }
  
  // 6. LIVE STAGE
  if (status === "live") {
    return d["(Live) Realized in date"] || 
           d["(Live) Realized in Date"] || 
           standardFallback || "-";
  }
  
  // 7. LIVE MONITORING / MONITORING AFTER LIVE STAGES
  if (status.includes("live monitoring") || status.includes("monitoring after live")) {
    const primaryMonDate = d["(Mon After Live) Realized In Date"] || 
                           d["(Mon After Live) Realized in Date"] || 
                           d["(Mon After Live) Realized in date"];
    if (primaryMonDate && primaryMonDate.trim() !== "") {
      return primaryMonDate;
    } else {
      const durationText = d["Monitoring After Live\n15, 30, 60 Hari (Kecil/Menengah/Besar)"];
      return durationText ? `Live on Monitoring on Progress until : ${durationText}` : (standardFallback || "In Monitoring Phase");
    }
  }

  // Ultimate Catch-All Safety Net Rule: If no status matches perfectly, output the default file values
  return standardFallback !== "" ? standardFallback : "-";
}

export function formatLogWithNewLines(text: string | null | undefined): string {
  if (!text || text === "-") return "-";
  
  // Rule A: If the text already contains native structural newlines, preserve them
  let formatted = text;
  
  // Rule B: Foolproof regex fallback. If consecutive updates are squashed together with spaces, 
  // inject a clear newline character right before any date entry pattern (e.g., "17 Jun 26 :" or "12 Apr 2026 :")
  formatted = formatted.replace(/\s+(?=\d{1,2}\s+(?:Jan|Feb|Mar|Apr|Mei|Jun|Jul|Ags|Sep|Okt|Nov|Des|Januari|Februari|Maret|April|Mei|Juni|Juni|Agustus|September|Oktober|November|Desember)\s+\d{2,4}\b)/g, '\n');
  
  return formatted;
}

/**
 * Secondary global companion utility function to feed dynamic context into
 * a "LATEST PROGRESS LOG" column based on the active phase category.
 */
export function getGlobalProgressUpdate(d: any): string {
  if (!d) return "-";
  const status = d["Last Status"] ? String(d["Last Status"]).trim().toLowerCase() : "";
  
  let rawLog = "-";
  if (status.includes("change request")) {
    rawLog = d["(Change Request) Progress Updated"] || d["Progress Updated"] || "-";
  } else if (status.includes("fsd")) {
    rawLog = d["(FSD) Progress Updated"] || d["Progress Updated"] || "-";
  } else if (status.includes("dev") || status.includes("development")) {
    rawLog = d["(Dev) Progress Updated"] || d["Progress Updated"] || "-";
  } else if (status.includes("sit")) {
    rawLog = d["(SIT) Progress Updated"] || d["Progress Updated"] || "-";
  } else if (status.includes("uat")) {
    rawLog = d["(UAT) Progress Updated"] || d["Progress Updated"] || "-";
  } else if (status.includes("live") || status.includes("monitoring")) {
    rawLog = d["(Live) Progress Updated"] || d["Progress Updated"] || "-";
  } else {
    rawLog = d["Progress Updated"] || "-";
  }

  return formatLogWithNewLines(rawLog);
}

export function getProjectIntakeYear(d: any): string {
  // Extract the raw ticket value safely from either key variant
  const ticketStr = String(d["No Ticket"] || d["Ticket"] || "").trim();
  
  // Base operational year fallback from the dataset if available
  let assignedYear = d["Year"] || d["Tahun"] || d["SIT SLA YEAR"] || "";
  
  // Rule: If the year is blank, marked as "Unscheduled", or 0, extract it directly from the Ticket ID
  if (!assignedYear || assignedYear === "-" || assignedYear.toString().toLowerCase().includes("un") || assignedYear === 0 || assignedYear === "0") {
    if (ticketStr.length >= 2) {
      const prefix = ticketStr.substring(0, 2);
      if (prefix === "26") return "2026";
      if (prefix === "25") return "2025";
      if (prefix === "24") return "2024";
      if (prefix === "23") return "2023";
    }
  }
  
  // If it already has a clean valid year, return it as a standardized string
  return assignedYear ? String(assignedYear).replace(".0", "").trim() : "2026";
}

export function formatUATBatchText(text: string | null | undefined): string {
  if (!text || text === "-") return "-";
  
  // Rule A: Preserve our clean alert badge text format if the project is UAT On Queue
  if (text.toLowerCase().includes("queue")) {
    return text;
  }
  
  // Rule B: Enforce beautiful line breaks between multiple batches if squashed horizontally
  let formatted = text.toString().replace(/\s+(?=\d+\s*\()/g, '\n');
  
  // Rule C: Regex conversion to transform "1 (11-05-2026)" into "UAT Batch 1 : 11-05-2026"
  formatted = formatted.replace(/^(\d+)\s*\((.*?)\)/gm, 'UAT Batch $1 : $2');
  
  return formatted;
}

export function calculateProjectAverageScore(item: any): number | null {
  // Define the exact 11 feedback descriptor tokens from the JSON schema
  const feedbackKeys = [
    "Nilai Feedback User :\nDapat berkolaborasi dengan Department lain dengan baik dalam Project",
    "Nilai Feedback User :\nDevelopment (include Fixing temuan selama Testing PIC dan SIT)",
    "Nilai Feedback User :\nDiskusi FPS dengan Developer sebelum FSD\n",
    "Nilai Feedback User :\nKejelasan komunikasi dan mudah dihubungi.",
    "Nilai Feedback User :\nKeterampilan teknis dan dokumentasi Project yang lengkap.",
    "Nilai Feedback User :\nMembantu menyelesaikan konflik di dalam Project.",
    "Nilai Feedback User :\nMemenuhi terget waktu Project.",
    "Nilai Feedback User :\nPembuatan FSD dan Review Internal IT",
    "Nilai Feedback User :\nTesting PIC Project dan SIT",
    "Nilai Feedback User :\nUAT (include perbaikan temuan UAT) dan Change Request 1",
    "Nilai Feedback User : Memahami kebutuhan klien dengan tepat."
  ];

  let totalScore = 0;
  let validKeysCount = 0;

  feedbackKeys.forEach(key => {
    if (item && item[key] !== undefined && item[key] !== null) {
      const score = parseFloat(item[key]);
      // Only accumulate if the score is a valid number, greater than 0, and capped at 5
      if (!isNaN(score) && score > 0) {
        // Defensive handling: if any old data mistakenly uses a 100 scale, normalize it immediately
        const normalizedScore = score > 5 ? (score / 20) : score;
        totalScore += normalizedScore;
        validKeysCount++;
      }
    }
  });

  // Return null if no feedback has been submitted yet for the row
  if (validKeysCount === 0) return null;

  // Compute the absolute row average (Capped strictly at 5.00)
  return Math.min(5.00, totalScore / validKeysCount);
}

function getBusinessOperationalDataLocal(dataset: any[]): any[] {
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

export function getActiveSlaPool(dataset: any[]): any[] {
  if (!dataset) return [];
  return getBusinessOperationalDataLocal(dataset).filter(item => {
    const lastStatus = (item["Last Status"] || "").trim().toLowerCase();
    
    // STRICT EXCLUSION: Terminated or Canceled projects are exempt from SLA evaluation
    if (lastStatus.includes("cancel") || lastStatus.includes("terminated")) {
      return false; 
    }
    
    return true; // Allow active/completed projects to proceed to SLA evaluation
  });
}


