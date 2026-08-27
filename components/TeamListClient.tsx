"use client";

import { useState } from "react";

const filters = ["All", "Level 1", "Level 2", "Level 3"];

export default function TeamListClient({ teamRows }: { teamRows: any[] }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredRows = activeFilter === "All" 
    ? teamRows 
    : teamRows.filter(row => row.level === activeFilter);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
              activeFilter === filter
                ? "border-[#7f3144] bg-[#7f3144] text-white"
                : "border-[#e7ddd2] bg-white text-[#5f5d3e] hover:border-[#7f3144]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_12px_28px_rgba(95,93,62,0.04)] md:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-[family:var(--font-display)] text-[1.35rem] tracking-[-0.03em] text-[#382933] md:text-[1.7rem]">
            Team Level Members
          </h2>
          <span className="text-xs uppercase tracking-[0.14em] text-[#9c4049]">
            Live
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {filteredRows.length > 0 ? (
            filteredRows.map((row, index) => (
              <div
                key={`${row.name}-${row.level}-${index}`}
                className="grid gap-3 rounded-[1rem] bg-[#fff9f7] p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7f3144] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#2a2430]">{row.name}</p>
                    <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-[#7b6f69]">
                      {row.joined}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5e5a54]">
                  <span className="rounded-full border border-[#eddad3] bg-white px-3 py-1 text-xs uppercase tracking-[0.12em] text-[#9c4049]">
                    {row.level}
                  </span>
                  <span>{row.status}</span>
                </div>
                <div className="md:text-right">
                  <p className="text-lg font-bold text-[#2a2430]">{row.business}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#7b6f69] py-4">No members found in {activeFilter}.</p>
          )}
        </div>
      </div>
    </>
  );
}
