"use client";

import React from "react";
import {
  SaveTheDateTemplate,
  type SaveTheDateEvent,
  normalizeSaveTheDatePayload,
} from "@/components/notebook-templates/save-the-date-template";
import { TutorialLearnTemplate, type TutorialLearnProject } from "@/components/notebook-templates/tutorial-learn-template";
import { Card } from "@/components/ui/card";
import { FileText, CalendarDays, BookOpen, MapPin, FolderKanban } from "lucide-react";
import { getTemplatePageTitle } from "@/lib/shared-template-config";

interface SharedTemplateRendererProps {
  templateId: string;
  notebookTitle: string;
  pagesData: { _id: string; title?: string; content?: string }[];
}

/** Renders shared notebook content using the real template UI when supported, or a readable fallback for other JSON templates. */
export function SharedTemplateRenderer({
  templateId,
  notebookTitle,
  pagesData,
}: SharedTemplateRendererProps) {
  const pageTitle = getTemplatePageTitle(templateId);
  const templatePage = pageTitle
    ? pagesData.find((p) => p.title === pageTitle)
    : undefined;

  const parseJsonContent = (content: unknown): Record<string, unknown> => {
    if (!content) return {};
    if (typeof content === "string") {
      try {
        return JSON.parse(content || "{}") as Record<string, unknown>;
      } catch {
        return {};
      }
    }
    return (content as Record<string, unknown>) || {};
  };

  const data = templatePage ? parseJsonContent(templatePage.content) : {};

  // Templates with full readOnly support
  if (templateId === "save-the-date") {
    const normalized = normalizeSaveTheDatePayload(data as Record<string, unknown>);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedEvents: SaveTheDateEvent[] = normalized.events.map((e) => {
      const rawDate = e.rawDate || e.date;
      const eventDate = new Date(rawDate);
      eventDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(
        (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { ...e, rawDate, daysUntil: diffDays };
    });
    return (
      <div className="min-h-[400px] rounded-lg overflow-hidden">
        <SaveTheDateTemplate
          title={notebookTitle || "Save the Date"}
          readOnly
          initialProfiles={normalized.profiles}
          initialEvents={parsedEvents}
        />
      </div>
    );
  }

  if (templateId === "tutorial-learn") {
    const projects = (Array.isArray(data.projects) ? data.projects : []) as any[];
    const parsedProjects: TutorialLearnProject[] = projects.map((p: any) => ({
      ...p,
      category: p.category || "AI",
      steps: (p.steps || []).map((s: any) => ({
        ...s,
        sections: (s.sections || []).map((sec: any) => ({
          ...sec,
          url: sec.url || "",
          imageUrls: Array.isArray(sec.imageUrls)
            ? sec.imageUrls
            : sec.imageUrl
              ? [sec.imageUrl]
              : [],
        })),
      })),
    }));
    return (
      <div className="min-h-[400px] rounded-lg overflow-hidden">
        <TutorialLearnTemplate
          title={notebookTitle || "Tutorial Learn"}
          readOnly
          initialProjects={parsedProjects}
        />
      </div>
    );
  }

  // Fallback: render readable preview for other JSON templates
  if (templatePage) {
    return (
      <JsonPreviewFallback templateId={templateId} data={data} notebookTitle={notebookTitle} />
    );
  }

  return null;
}

function JsonPreviewFallback({
  templateId,
  data,
  notebookTitle,
}: {
  templateId: string;
  data: Record<string, unknown>;
  notebookTitle: string;
}) {
  const templateLabels: Record<string, { icon: React.ElementType; label: string }> = {
    planner: { icon: CalendarDays, label: "Agenda items" },
    diary: { icon: FileText, label: "Entries" },
    document: { icon: FileText, label: "Documents" },
    dashboard: { icon: FolderKanban, label: "Widgets" },
    trip: { icon: MapPin, label: "Trips" },
    loop: { icon: FolderKanban, label: "Workspaces" },
    project: { icon: FolderKanban, label: "Projects" },
    "prompt-diary": { icon: FileText, label: "Entries" },
    "ai-research": { icon: BookOpen, label: "Researches" },
    "code-notebook": { icon: FileText, label: "Notes" },
    whiteboard: { icon: FolderKanban, label: "Boards" },
    studybook: { icon: BookOpen, label: "Projects" },
  };

  const config = templateLabels[templateId] || { icon: FileText, label: "items" };
  const Icon = config.icon;

  const items: any[] =
    (Array.isArray(data.events) && data.events) ||
    (Array.isArray(data.entries) && data.entries) ||
    (Array.isArray(data.agendaItems) && data.agendaItems) ||
    (Array.isArray(data.projects) && data.projects) ||
    (Array.isArray(data.trips) && data.trips) ||
    (Array.isArray(data.workspaces) && data.workspaces) ||
    (Array.isArray(data.list) && data.list) ||
    (Array.isArray(data.boards) && data.boards) ||
    (Array.isArray(data.researches) && data.researches) ||
    [];
  const count = items.length;

  return (
    <Card className="p-6 bg-white/80 dark:bg-neutral-900/80">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {notebookTitle}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {count} {config.label}
          </p>
        </div>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 py-8 text-center">
            No {config.label} yet
          </p>
        ) : items.slice(0, 50).map((item: any, i: number) => (
          <div
            key={item?.id ?? i}
            className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
          >
            <p className="font-medium text-neutral-900 dark:text-white">
              {item?.title ?? item?.name ?? item?.text ?? `Item ${i + 1}`}
            </p>
            {(item?.date || item?.rawDate) && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {item.date || item.rawDate}
              </p>
            )}
            {item?.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
      {items.length > 50 && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
          ...and {items.length - 50} more. Open in the app to view all.
        </p>
      )}
    </Card>
  );
}
