"use client"

import React from "react"
import { QuillEditor } from "./quill-editor"

interface PageContentProps {
  page: {
    _id: string
    pageNumber: number
    title: string
    content: string
  }
  notebookId: string
  paperPattern: string
  onUpdate: () => void
  isEditing: boolean
  flushRef?: React.MutableRefObject<(() => Promise<void>) | null>
  onContentChange?: (pageId: string, content: string, title: string) => void
}

export function PageContent({ 
  page, 
  notebookId, 
  paperPattern, 
  onUpdate,
  isEditing,
  flushRef,
  onContentChange,
}: PageContentProps) {
  return (
    <QuillEditor
      pageId={page._id}
      notebookId={notebookId}
      initialContent={page.content}
      initialTitle={page.title}
      pageNumber={page.pageNumber}
      isEditing={isEditing}
      onSave={onUpdate}
      flushRef={flushRef}
      onContentChange={onContentChange}
    />
  )
}
