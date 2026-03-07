"use client";

import { useOthers } from "@/liveblocks.config";

export function LiveCursors() {
  const others = useOthers();

  return (
    <>
      {others.map(({ connectionId, presence }) => {
        if (!presence.cursor) return null;
        return (
          <div
            key={connectionId}
            className="pointer-events-none fixed z-50"
            style={{
              left: presence.cursor.x,
              top: presence.cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            {/* Cursor SVG */}
            <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
              <path
                d="M0.5 0.5L0.5 17.5L4.5 13.5L7.5 20.5L9.5 19.5L6.5 12.5L12.5 12.5L0.5 0.5Z"
                fill={presence.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            {/* Name tag */}
            <div
              className="ml-3 -mt-1 px-2 py-0.5 rounded-full text-white text-xs font-semibold whitespace-nowrap shadow"
              style={{ backgroundColor: presence.color }}
            >
              {presence.name}
            </div>
          </div>
        );
      })}
    </>
  );
}
