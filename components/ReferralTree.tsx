"use client";

import { useState } from "react";
import { FaCrown } from "react-icons/fa";

export default function ReferralTree({ root, currentUsername }: { root: any; currentUsername: string }) {
  const [closed, setClosed] = useState(() => new Set());

  const toggleNode = (username: string) => {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  };

  const countTeam = (node: any): number => {
    const children = Array.isArray(node?.children) ? node.children : [];
    return children.reduce((sum: number, child: any) => sum + 1 + countTeam(child), 0);
  };

  const renderNode = (node: any, level = 0, isRoot = false) => {
    if (!node) return null;

    const username = node.username || "member";
    const children = Array.isArray(node.children) ? node.children : [];
    const hasChildren = children.length > 0;
    const isClosed = closed.has(username);
    const isMe = username.toLowerCase() === String(currentUsername || "").toLowerCase();

    return (
      <div className="relative flex flex-col items-center" key={username}>
        {/* Node Card */}
        <div 
          className={`relative z-10 w-[260px] min-h-[170px] p-4 rounded-[1.2rem] border shadow-[0_18px_42px_rgba(156,64,73,0.08)] bg-white
            ${isRoot || isMe ? "border-[#d89c4c] bg-gradient-to-br from-[#fffdfa] to-white" : "border-[#f0ddd6]"}
          `}
        >
          {/* Avatar Area using the website's circular style */}
          <div className="flex flex-col items-center -mt-10">
            <div className="relative">
              <div className={`relative flex items-center justify-center overflow-hidden rounded-full border-[#edc7b9] bg-[#fff1eb] 
                ${isRoot ? "h-20 w-20 border-[4px] shadow-[0_0_0_8px_rgba(239,209,193,0.42),0_16px_32px_rgba(127,49,68,0.12)]" : "h-14 w-14 border-[2px] shadow-[0_0_0_6px_rgba(239,209,193,0.30),0_12px_24px_rgba(127,49,68,0.08)]"}
              `}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),rgba(255,255,255,0)_58%)]" />
                <span className={`${isRoot ? "text-3xl" : "text-xl"} font-bold uppercase text-[#9c4049]`}>
                  {username.charAt(0)}
                </span>
              </div>
              <div className="absolute -inset-3 -z-10 rounded-full bg-[radial-gradient(circle,rgba(215,162,77,0.30)_0%,rgba(215,162,77,0.12)_44%,rgba(215,162,77,0)_70%)] blur-md" />
              {isRoot && (
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#fff7f3] bg-[#7f3144] text-white shadow-[0_10px_20px_rgba(127,49,68,0.18)]">
                  <FaCrown className="text-[0.65rem]" />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[1rem] font-bold text-[#2a2430]">
              @{username}
              {isMe && <span className="rounded-full bg-[#d89c4c] px-2 py-0.5 text-[0.65rem] font-bold text-white">YOU</span>}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <span className="rounded-full bg-[#fcf9f4] px-2.5 py-1 text-[0.65rem] font-bold text-[#7b6f69] border border-[#f0ddd6]">
              {isRoot ? "ROOT" : `L${level}`}
            </span>
            <span className="rounded-full bg-[#fff3ee] px-2.5 py-1 text-[0.65rem] font-bold text-[#9c4049]">
              {node.directCount ?? children.length} Dir
            </span>
            <span className="rounded-full bg-[#f5efe6] px-2.5 py-1 text-[0.65rem] font-bold text-[#d89c4c]">
              {node.totalTeamCount ?? countTeam(node)} Team
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center justify-center rounded-[0.6rem] border border-[#f0ddd6] bg-[#fcf9f4] p-2 text-center">
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[#8b837b]">Sales</span>
              <b className="mt-1 text-[0.8rem] text-[#2a2430]">₹{Number(node.businessUsdc || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</b>
            </div>
            <div className="flex flex-col items-center justify-center rounded-[0.6rem] border border-[#f0ddd6] bg-[#fcf9f4] p-2 text-center">
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[#8b837b]">Rank</span>
              <b className="mt-1 text-[0.8rem] text-[#2a2430] truncate w-full">{node.rankName || "Member"}</b>
            </div>
          </div>

          {hasChildren && (
            <button 
              className="mt-4 w-full rounded-[0.6rem] bg-[#9c4049] py-2.5 text-[0.75rem] font-bold text-white transition-colors hover:bg-[#7f3144]" 
              onClick={() => toggleNode(username)}
            >
              {isClosed ? `Show ${children.length} Directs` : "Hide Directs"}
              <span className="ml-2">{isClosed ? "⌄" : "⌃"}</span>
            </button>
          )}
        </div>

        {/* Children Render & Connecting Lines */}
        {hasChildren && !isClosed && (
          <div className="relative mt-8 flex justify-center gap-6 pt-6">
            {/* Top vertical line from parent to horizontal line */}
            <div className="absolute top-0 left-1/2 h-6 w-[2px] -translate-x-1/2 bg-[#edc7b9]" />
            
            {/* Horizontal connecting line */}
            {children.length > 1 && (
              <div className="absolute top-6 left-[calc(50%_-_(var(--child-width)_*_(var(--child-count)_-_1)_/_2))] right-[calc(50%_-_(var(--child-width)_*_(var(--child-count)_-_1)_/_2))] h-[2px] bg-[#edc7b9]" 
                   style={{
                     left: '20%', // A rough approximation for now, flex handles the actual positioning
                     right: '20%' 
                   }}
              />
            )}

            {children.map((child: any, idx: number) => (
              <div key={child.username || idx} className="relative pt-6">
                {/* Vertical line from horizontal line to child */}
                <div className="absolute top-0 left-1/2 h-6 w-[2px] -translate-x-1/2 bg-[#edc7b9]" />
                
                {/* For the first and last child, extend the horizontal line to them (if flex gap isn't enough, we can use an absolute border on the wrapper. For simplicity, we use flex lines.) */}
                {children.length > 1 && idx === 0 && (
                   <div className="absolute top-0 left-1/2 right-0 h-[2px] bg-[#edc7b9]" />
                )}
                {children.length > 1 && idx === children.length - 1 && (
                   <div className="absolute top-0 left-0 right-1/2 h-[2px] bg-[#edc7b9]" />
                )}
                {children.length > 1 && idx > 0 && idx < children.length - 1 && (
                   <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#edc7b9]" />
                )}

                {renderNode(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!root) return <div className="p-10 text-center text-[#7b6f69]">No tree data found.</div>;

  return (
    <div className="w-full overflow-auto rounded-[2rem] border border-[#e6dcd4] bg-white p-8 pt-16 shadow-[0_24px_70px_rgba(95,93,62,0.06)] min-h-[600px]">
      <div className="min-w-max flex justify-center pb-16">
        {renderNode(root, 0, true)}
      </div>
    </div>
  );
}
