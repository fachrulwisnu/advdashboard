import React, { useState } from "react";
import { DashboardDataset } from "../types";
import { Card, ChipRow, Pill } from "./UI";
import { MonthlyBarChart, StackedBar, VBarChart, ThroughputComparisonChart } from "./Charts";

interface TabPipelineProps {
  dataset: DashboardDataset;
  filteredProjects?: any[];
}

export function TabPipeline({ dataset, filteredProjects = [] }: TabPipelineProps) {
  const { pipelineChips, projectsByYear, onQueue, throughput, heatmap, depth } = dataset;

  // Let's compute a dynamic maximum value for StackedBar components to align scaling perfectly.
  const heatmapMax = Math.max(...heatmap.map(h => h.completed + h.active + h.canceled), 10) * 1.1;
  const depthMax = Math.max(...depth.map(d => d.completed + d.inflight), 10) * 1.1;

  // Set up pagination for queue
  const [queuePage, setQueuePage] = useState(1);
  const queuePageSize = 5;
  const totalQueueItems = onQueue.top.length;
  const totalQueuePages = Math.ceil(totalQueueItems / queuePageSize) || 1;
  const currentQueueItems = onQueue.top.slice((queuePage - 1) * queuePageSize, queuePage * queuePageSize);

  // Set up modal state
  const [activeModal, setActiveModal] = useState<"Total Projects" | "Completed" | "Active" | "Canceled" | null>(null);

  // Filter project lists purely on actual client-side condition
  const getModalProjects = () => {
    switch (activeModal) {
      case "Total Projects":
        return filteredProjects;
      case "Completed":
        return filteredProjects.filter(p => {
          const m = (p["Milestone"] || "").toLowerCase();
          const s = (p["Last Status"] || "").toLowerCase();
          return m === "closed" || m.includes("closed") || s === "live" || s.includes("live");
        });
      case "Active":
        return filteredProjects.filter(p => {
          const m = (p["Milestone"] || "").toLowerCase();
          const s = (p["Last Status"] || "").toLowerCase();
          // active is non-CLOSED, non-Canceled
          const isClosed = m === "closed" || m.includes("closed") || s === "live" || s.includes("live");
          const isCanceled = m === "canceled" || m.includes("canceled") || s === "canceled" || s.includes("canceled") || s === "deleted";
          return !isClosed && !isCanceled;
        });
      case "Canceled":
        return filteredProjects.filter(p => {
          const m = (p["Milestone"] || "").toLowerCase();
          const s = (p["Last Status"] || "").toLowerCase();
          return m === "canceled" || m.includes("canceled") || s === "canceled" || s.includes("canceled");
        });
      default:
        return [];
    }
  };

  const modalProjects = getModalProjects();

  return (
    <div className="space-y-6">
      {/* Overview Stat Chips with clickable interaction details */}
      <ChipRow
        chips={pipelineChips}
        activeFilter={activeModal || undefined}
        onFilterChange={(lbl) => setActiveModal(lbl as any)}
      />

      {/* Main Grid: On Queue & Throughput */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Queue Management */}
        <div className="lg:col-span-4 space-y-5">
          <Card
            title="Incoming Queue (On Queue)"
            sub="Backlog of verified intakes standing by"
            rightElement={
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg font-mono">
                {onQueue.total} in queue
              </span>
            }
            padding="p-4.5"
          >
            {/* Dynamic Status Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4 select-none">
              {onQueue.types.map((tp, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100/50 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                    {tp.label}
                  </span>
                  <span className={`text-xl font-bold font-mono tracking-tight block mt-0.5 ${tp.kind === 'uat' ? 'text-sky-600' : 'text-amber-600'}`}>
                    {tp.value}
                  </span>
                </div>
              ))}
            </div>

            {/* List on queue projects */}
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 font-display">
              Top Priority In Queue
            </h4>
            <div className="divide-y divide-gray-55 flex-1 flex flex-col justify-between">
              <div className="space-y-0.5 min-h-[195px]">
                {currentQueueItems.map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between border-b border-gray-50 last:border-none">
                    <span className="text-[11.5px] font-semibold text-gray-800 truncate pr-2 flex-1">
                      {p.name}
                    </span>
                    <div className="flex-shrink-0">
                      <Pill label={p.status} kind={p.kind} />
                    </div>
                  </div>
                ))}
                {currentQueueItems.length === 0 && (
                  <div className="py-12 text-center text-xs text-gray-400">
                    No projects in the queue.
                  </div>
                )}
              </div>

              {/* Minimalist Pagination controls inside queue card */}
              {totalQueuePages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 font-sans">
                  <span>
                    Page <strong>{queuePage}</strong> of <strong>{totalQueuePages}</strong>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={queuePage === 1}
                      onClick={() => setQueuePage(p => Math.max(1, p - 1))}
                      className="px-2.5 py-1 bg-white border border-gray-250 hover:bg-gray-50 text-[11px] font-bold rounded-lg cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={queuePage === totalQueuePages}
                      onClick={() => setQueuePage(p => Math.min(totalQueuePages, p + 1))}
                      className="px-2.5 py-1 bg-white border border-gray-250 hover:bg-gray-50 text-[11px] font-bold rounded-lg cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Delivery Volume Year-on-Year */}
          <Card title="Project Volume by Intake Year" sub="Historical intakes absolute size" padding="p-4.5">
            <VBarChart
              data={projectsByYear}
              height={145}
            />
          </Card>
        </div>

        {/* Right: Throughput Output Trend */}
        <div className="lg:col-span-8 space-y-5">
          <Card
            title="Completion Rate (Go-Live Throughput)"
            sub="Completed production rolls comparison (2025 vs 2026 active evaluation window)"
            padding="p-5"
          >
            <div className="mt-2">
              <ThroughputComparisonChart
                data={throughput.comparison || []}
                height={200}
              />
            </div>
            <div className="border-t border-gray-50 pt-3 mt-3.5 flex items-center justify-between text-xs text-gray-400 font-sans">
              <span className="flex items-center gap-1.5 font-medium text-gray-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#1D4ED8] inline-block" /> 2026 Completed Projects
              </span>
              <span className="flex items-center gap-1.5 font-medium text-gray-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#93C5FD] inline-block" /> 2025 Completed Projects
              </span>
            </div>
          </Card>

          {/* Disposition & Delivery Depth heatmaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Disposition heatmap */}
            <Card title="Historical Pipeline Disposition" sub="Finished vs active pipelines per intake" padding="p-5">
              <div className="space-y-3 mt-1.5">
                {heatmap.map((h, idx) => (
                  <StackedBar
                    key={idx}
                    year={h.year}
                    completed={h.completed}
                    inflight={h.active}
                    max={heatmapMax}
                  />
                ))}
              </div>
              <div className="border-t border-gray-50 pt-2.5 mt-4 flex items-center gap-4 text-[10.5px] font-semibold tracking-wide text-gray-500 uppercase font-display">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-blue-600 block" /> Completed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-amber-400 block" /> Active In-Flight
                </span>
              </div>
            </Card>

            {/* Depth Card */}
            <Card title="Delivery Depth (2025–2026)" sub="Dynamic delivery rates active capacity" padding="p-5">
              <div className="space-y-4 mt-2">
                {depth.map((d, idx) => (
                  <StackedBar
                    key={idx}
                    year={d.year}
                    completed={d.completed}
                    inflight={d.inflight}
                    max={depthMax}
                  />
                ))}
              </div>
              <div className="border-t border-gray-50 pt-3 mt-5 text-[11px] text-gray-400 font-sans italic leading-relaxed">
                Indicates the proportion of completed projects relative to active backlog under development. Evaluation data is continuously updated.
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Dynamic Pop-up Modal with absolute backdrop focus */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-250">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-display">
                  {activeModal} Rincian Project
                </h3>
                <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                  Menampilkan {modalProjects.length} catatan project sesuai kategori dari rentang filter aktif
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200/80 text-gray-600 border border-gray-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-auto p-5">
              {modalProjects.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 font-sans">
                  Tidak ada data project yang sesuai dengan kategori ini.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider font-display">
                      <th className="py-2.5 px-3">Ticket</th>
                      <th className="py-2.5 px-3">Project Name</th>
                      <th className="py-2.5 px-3">Owner Div</th>
                      <th className="py-2.5 px-3">PIC Name</th>
                      <th className="py-2.5 px-3 text-center">Period</th>
                      <th className="py-2.5 px-3 text-right">Last Status</th>
                      <th className="py-2.5 px-3 text-right font-display">Milestone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {modalProjects.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-55/20 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-gray-500">{p["Ticket"] || "-"}</td>
                        <td className="py-3 px-3 font-semibold text-gray-900 pr-4">{p["Project Name"]}</td>
                        <td className="py-3 px-3 font-medium text-gray-600">{p["Owner Div"] || "-"}</td>
                        <td className="py-3 px-3 text-gray-500">{p["PIC Short Name"] || p["PIC Name"] || "-"}</td>
                        <td className="py-3 px-3 text-center font-mono text-gray-500">{p["Period"] || "-"}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            {p["Last Status"]}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                            {p["Milestone"] || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
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
