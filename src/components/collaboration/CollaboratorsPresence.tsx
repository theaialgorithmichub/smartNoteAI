"use client";

import { useOthers, useSelf } from "@/liveblocks.config";

export function CollaboratorsPresence() {
  const others = useOthers();
  const self = useSelf();

  const all = [
    ...(self ? [{ connectionId: -1, info: self.info, isYou: true }] : []),
    ...others.map((o) => ({ connectionId: o.connectionId, info: o.info, isYou: false })),
  ];

  if (all.length <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {all.slice(0, 5).map(({ connectionId, info, isYou }) => (
          <div
            key={connectionId}
            className="relative w-7 h-7 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center text-white text-xs font-bold shadow"
            style={{ backgroundColor: info?.color || "#6B7280" }}
            title={isYou ? "You" : info?.name}
          >
            {info?.avatar ? (
              <img src={info.avatar} alt={info.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              (info?.name?.[0] || "?").toUpperCase()
            )}
            {isYou && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
            )}
          </div>
        ))}
        {all.length > 5 && (
          <div className="w-7 h-7 rounded-full bg-neutral-400 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-white text-xs font-bold">
            +{all.length - 5}
          </div>
        )}
      </div>
      <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
        {others.length > 0 ? `${others.length} other${others.length > 1 ? "s" : ""} here` : "Just you"}
      </span>
    </div>
  );
}
