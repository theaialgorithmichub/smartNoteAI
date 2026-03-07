"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@/liveblocks.config";
import { LiveList } from "@liveblocks/client";

interface CollaborationProviderProps {
  notebookId: string;
  userName: string;
  children: ReactNode;
}

export function CollaborationProvider({
  notebookId,
  userName,
  children,
}: CollaborationProviderProps) {
  return (
    <RoomProvider
      id={`notebook-${notebookId}`}
      initialPresence={{
        cursor: null,
        name: userName,
        color: "#3B82F6",
        currentPage: 1,
      }}
      initialStorage={{
        comments: new LiveList([]),
      }}
    >
      {children}
    </RoomProvider>
  );
}
