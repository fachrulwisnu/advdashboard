import React from "react";
import {
  LayoutGrid, Layers, Gauge, Folder, PieChart, Settings, HelpCircle,
  Inbox, Play, CheckSquare, Activity, Pause, Search, Eye, X, Download,
  Upload, ChevronRight, AlertTriangle, Users, Calendar, Clock, Sparkles, Check, Percent
} from "lucide-react";

// ---- Dynamic Icon Component maps original strings ----
interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className = "w-4 h-4" }: IconProps) {
  switch (name.trim().toLowerCase()) {
    case "grid": return <LayoutGrid className={className} />;
    case "layers": return <Layers className={className} />;
    case "gauge": return <Gauge className={className} />;
    case "folder": return <Folder className={className} />;
    case "pie": return <PieChart className={className} />;
    case "settings": return <Settings className={className} />;
    case "help": return <HelpCircle className={className} />;
    case "inbox": return <Inbox className={className} />;
    case "play": return <Play className={className} />;
    case "check": return <Check className={className} />;
    case "checksquare":
    case "check-square": return <CheckSquare className={className} />;
    case "activity": return <Activity className={className} />;
    case "pause": return <Pause className={className} />;
    case "search": return <Search className={className} />;
    case "eye": return <Eye className={className} />;
    case "x": return <X className={className} />;
    case "download": return <Download className={className} />;
    case "upload": return <Upload className={className} />;
    case "chevron": return <ChevronRight className={className} />;
    case "warn":
    case "warning": return <AlertTriangle className={className} />;
    case "users": return <Users className={className} />;
    case "calendar": return <Calendar className={className} />;
    case "clock": return <Clock className={className} />;
    case "sparkles": return <Sparkles className={className} />;
    case "percent": return <Percent className={className} />;
    default: return <Folder className={className} />;
  }
}

// ---- Pill (Status badge) ----
interface PillProps {
  label: string;
  kind?: string; // stable, critical, progress, hold, queue etc.
}

export function Pill({ label, kind = "progress" }: PillProps) {
  const styles: Record<string, string> = {
    stable: "bg-emerald-50 text-emerald-700 border-emerald-100",
    critical: "bg-rose-50 text-rose-700 border-rose-100",
    progress: "bg-blue-50 text-blue-700 border-blue-100",
    hold: "bg-purple-50 text-purple-700 border-purple-100",
    queue: "bg-amber-50 text-amber-700 border-amber-100",
    uat: "bg-sky-50 text-sky-700 border-sky-100",
    monitoring: "bg-cyan-50 text-cyan-700 border-cyan-100"
  };
  const currentClass = styles[kind] || styles["progress"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${currentClass}`}>
      {label}
    </span>
  );
}

// ---- Card Wrapper ----
interface CardProps {
  title?: string;
  sub?: string;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
  padding?: string;
  onClick?: () => void;
}

export function Card({ title, sub, children, rightElement, className = "", padding = "p-5", onClick }: CardProps) {
  return (
    <div onClick={onClick} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {(title || rightElement) && (
        <div className="border-b border-gray-50 px-5 py-4 flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-gray-800 font-display tracking-tight">{title}</h3>}
            {sub && <p className="text-[11px] text-gray-400 font-sans mt-0.5">{sub}</p>}
          </div>
          {rightElement && <div className="flex-shrink-0">{rightElement}</div>}
        </div>
      )}
      <div className={`${padding} flex-1 flex flex-col justify-start`}>
        {children}
      </div>
    </div>
  );
}

// ---- Chip stats header component ----
interface ChipRowProps {
  chips: { label: string; value: string | number; icon: string; color: string }[];
  activeFilter?: string;
  onFilterChange?: (lbl: string) => void;
}

export function ChipRow({ chips, activeFilter, onFilterChange }: ChipRowProps) {
  const getBorderColor = (col: string, isActive: boolean) => {
    if (!isActive) return "border-gray-100 bg-white hover:bg-gray-50/50";
    if (col === "green") return "border-emerald-200 bg-emerald-50/20";
    if (col === "amber") return "border-amber-200 bg-amber-50/20";
    if (col === "red") return "border-rose-200 bg-rose-50/20";
    return "border-blue-200 bg-blue-50/20";
  };

  const getTextColor = (col: string, isActive: boolean) => {
    if (!isActive) return "text-gray-900";
    if (col === "green") return "text-emerald-700";
    if (col === "amber") return "text-amber-700";
    if (col === "red") return "text-rose-700";
    return "text-blue-700";
  };

  const getIconColor = (col: string) => {
    if (col === "green") return "text-emerald-500";
    if (col === "amber") return "text-amber-500";
    if (col === "red") return "text-rose-500";
    return "text-blue-500";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5 select-none">
      {chips.map((c, i) => {
        const isClickable = !!onFilterChange;
        const isActive = activeFilter === c.label;
        return (
          <div
            key={i}
            onClick={() => isClickable && onFilterChange?.(c.label)}
            className={`border rounded-xl p-3.5 flex items-center justify-between transition-all duration-200 ${getBorderColor(c.color, isActive)} ${isClickable ? 'cursor-pointer hover:shadow-xs active:scale-[99%]' : ''}`}
          >
            <div>
              <div className="text-[11px] text-gray-400 font-medium font-sans uppercase tracking-wider">{c.label}</div>
              <div className={`text-2xl font-bold font-display tracking-tight mt-0.5 ${getTextColor(c.color, isActive)}`}>
                {c.value}
              </div>
            </div>
            <div className={`p-2 rounded-lg bg-gray-50/50 ${getIconColor(c.color)}`}>
              <Icon name={c.icon} className="w-5 h-5 stroke-[1.8px]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
