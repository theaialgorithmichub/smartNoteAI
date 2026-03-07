"use client";

import { CollaborationProvider } from "@/components/collaboration/CollaborationProvider";
import { NotebookViewer } from "./notebook-viewer";

interface NotebookCollabWrapperProps {
  notebookId: string;
  userId: string;
  userName: string;
  initialPage: number;
}

export function NotebookCollabWrapper({
  notebookId,
  userId,
  userName,
  initialPage,
}: NotebookCollabWrapperProps) {
  return (
    <CollaborationProvider notebookId={notebookId} userName={userName}>
      <NotebookViewer
        notebookId={notebookId}
        userId={userId}
        initialPage={initialPage}
      />
    </CollaborationProvider>
  );
}
