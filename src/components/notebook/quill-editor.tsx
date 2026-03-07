"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { Loader2, Wand2 } from "lucide-react"
import "react-quill-new/dist/quill.snow.css"
import { VoiceRecorder } from "@/components/ai/VoiceRecorder"

// Dynamic import for Quill (client-only) with font registration
const ReactQuill = dynamic(
  async () => {
    const { default: RQ, Quill } = await import("react-quill-new")
    
    // Register fonts BEFORE any Quill instance is created
    const Font = Quill.import("formats/font") as any
    Font.whitelist = [
      "arial", "georgia", "verdana", "tahoma", "trebuchet",
      "impact", "courier", "times", "palatino", "garamond",
      "roboto", "lato", "poppins", "montserrat", "inter",
      "raleway", "nunito", "oswald", "merriweather", "ubuntu",
      "playfair", "opensans", "sourcesans", "worksans", "dmsans",
    ]
    Quill.register({ "formats/font": Font }, true)
    
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    ),
  }
)

interface QuillEditorProps {
  pageId: string
  notebookId: string
  initialContent: string
  initialTitle: string
  pageNumber: number
  isEditing: boolean
  onSave?: () => void
  flushRef?: React.MutableRefObject<(() => Promise<void>) | null>
  onContentChange?: (pageId: string, content: string, title: string) => void
}

export function QuillEditor({
  pageId,
  notebookId,
  initialContent,
  initialTitle,
  pageNumber,
  isEditing,
  onSave,
  flushRef,
  onContentChange,
}: QuillEditorProps) {
  const [content, setContent] = useState(initialContent || "")
  const [title, setTitle] = useState(initialTitle || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const quillRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Track latest content/title in refs so unmount flush always has current values
  const contentRef = useRef(initialContent || "")
  const titleRef = useRef(initialTitle || "")
  const isDirtyRef = useRef(false)
  // Store pageId/notebookId in refs for use in unmount cleanup
  const pageIdRef = useRef(pageId)
  const notebookIdRef = useRef(notebookId)
  useEffect(() => { pageIdRef.current = pageId }, [pageId])
  useEffect(() => { notebookIdRef.current = notebookId }, [notebookId])


  // Quill modules configuration - built-in toolbar (reliable)
  const modules = {
    toolbar: {
      container: [
        [{ font: [
          "arial", "georgia", "verdana", "tahoma", "trebuchet",
          "impact", "courier", "times", "palatino", "garamond",
          "roboto", "lato", "poppins", "montserrat", "inter",
          "raleway", "nunito", "oswald", "merriweather", "ubuntu",
          "playfair", "opensans", "sourcesans", "worksans", "dmsans",
        ]}, { header: [1, 2, 3, 4, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: () => {
          fileInputRef.current?.click()
        },
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }

  // Quill formats
  const formats = [
    "header", "font", "size", "bold", "italic", "underline", "strike",
    "color", "background", "list", "bullet", "align",
    "blockquote", "code-block", "link", "image", "width", "height", "style"
  ]

  // Re-sync state ONLY when switching to a different page (pageId changes).
  // Do NOT include initialContent/initialTitle in deps — that would overwrite
  // in-progress edits whenever the parent re-renders (e.g. after image save).
  const initialContentRef = useRef(initialContent || "")
  const initialTitleRef = useRef(initialTitle || "")
  useEffect(() => {
    // Capture the latest initial values at the time pageId changes
    initialContentRef.current = initialContent || ""
    initialTitleRef.current = initialTitle || ""
    setContent(initialContentRef.current)
    setTitle(initialTitleRef.current)
    contentRef.current = initialContentRef.current
    titleRef.current = initialTitleRef.current
    isDirtyRef.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  // Silent save — does NOT call onSave to avoid re-fetching/refreshing the viewer
  const saveContentSilent = useCallback(
    async (newContent: string, currentTitle: string) => {
      setIsSaving(true)
      try {
        await fetch(`/api/notebooks/${notebookId}/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent, title: currentTitle }),
        })
        isDirtyRef.current = false
      } catch (error) {
        console.error("Failed to save:", error)
      } finally {
        setIsSaving(false)
      }
    },
    [notebookId, pageId]
  )

  // Debounced save — silent, no viewer refresh
  const scheduleDebounce = useCallback(
    (newContent: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveContentSilent(newContent, titleRef.current)
      }, 1000)
    },
    [saveContentSilent]
  )

  // Fetch AI autocomplete suggestion after user pauses typing (3s debounce)
  const scheduleAiSuggestion = useCallback((value: string) => {
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current)
    setAiSuggestion("")
    // Only suggest when there's meaningful content and user has stopped typing
    const plain = value.replace(/<[^>]*>/g, "").trim()
    if (plain.length < 20) return
    suggestionTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestion(true)
      try {
        const res = await fetch("/api/ai/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: plain, cursorPosition: plain.length }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.completion?.trim()) setAiSuggestion(data.completion.trim())
        }
      } catch {}
      finally { setIsLoadingSuggestion(false) }
    }, 3000)
  }, [])

  // Accept suggestion — append to editor
  const acceptSuggestion = useCallback(() => {
    if (!aiSuggestion) return
    const quill = quillRef.current?.getEditor()
    if (quill) {
      const len = quill.getLength()
      quill.insertText(len - 1, " " + aiSuggestion)
      const newContent = quill.root.innerHTML
      setContent(newContent)
      contentRef.current = newContent
      isDirtyRef.current = true
      onContentChange?.(pageId, newContent, titleRef.current)
      scheduleDebounce(newContent)
    }
    setAiSuggestion("")
  }, [aiSuggestion, pageId, onContentChange, scheduleDebounce])

  // Handle content change — only update state + schedule debounce, no refresh
  const handleChange = (value: string) => {
    setContent(value)
    contentRef.current = value
    isDirtyRef.current = true
    // Notify viewer of latest content so it can update pages state in memory
    onContentChange?.(pageId, value, titleRef.current)
    if (isEditing) {
      scheduleDebounce(value)
      scheduleAiSuggestion(value)
    }
  }

  // Save title silently on blur
  const saveTitle = async () => {
    titleRef.current = title
    // Notify viewer so TOC updates immediately
    onContentChange?.(pageId, contentRef.current, title)
    try {
      await fetch(`/api/notebooks/${notebookId}/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
    } catch (error) {
      console.error("Failed to save title:", error)
    }
  }

  // Insert transcribed voice text at end of editor
  const handleVoiceTranscription = useCallback((text: string) => {
    if (!text.trim()) return
    const quill = quillRef.current?.getEditor()
    if (quill) {
      const len = quill.getLength()
      quill.insertText(len - 1, "\n" + text)
      const newContent = quill.root.innerHTML
      setContent(newContent)
      contentRef.current = newContent
      isDirtyRef.current = true
      onContentChange?.(pageId, newContent, titleRef.current)
      scheduleDebounce(newContent)
    } else {
      // Fallback: append to HTML content
      const newContent = content + `<p>${text}</p>`
      setContent(newContent)
      contentRef.current = newContent
      isDirtyRef.current = true
      onContentChange?.(pageId, newContent, titleRef.current)
      scheduleDebounce(newContent)
    }
  }, [pageId, content, onContentChange, scheduleDebounce])

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "attachment")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()

      // Insert image with default width
      const quill = quillRef.current?.getEditor()
      if (quill) {
        const range = quill.getSelection(true)
        quill.insertEmbed(range.index, "image", data.url)
        quill.setSelection(range.index + 1)
        // Save immediately after image insert so it's never lost
        const newContent = quill.root.innerHTML
        contentRef.current = newContent
        isDirtyRef.current = false
        await saveContentSilent(newContent, titleRef.current)
        onSave?.()
      }
    } catch (error) {
      console.error("Image upload failed:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Setup image resize on click
  useEffect(() => {
    const setupImageResize = () => {
      const quill = quillRef.current?.getEditor()
      if (!quill) return

      const editor = quill.root as HTMLElement

      const handleClick = (e: Event) => {
        const target = e.target as HTMLElement
        
        // Don't process clicks on resize handles
        if (target.classList.contains('img-resize-handle') || 
            target.classList.contains('img-delete-btn') ||
            target.classList.contains('img-size-display')) {
          return
        }
        
        // Remove existing resize wrapper
        const existingWrapper = editor.querySelector('.img-resize-wrapper')
        if (existingWrapper) {
          const img = existingWrapper.querySelector('img')
          if (img) {
            existingWrapper.parentNode?.insertBefore(img, existingWrapper)
            existingWrapper.remove()
          }
        }

        if (target.tagName === 'IMG') {
          const img = target as HTMLImageElement
          
          // Create wrapper
          const wrapper = document.createElement('div')
          wrapper.className = 'img-resize-wrapper'
          wrapper.style.cssText = 'display:inline-block;position:relative;outline:2px solid #d97706;outline-offset:2px;'
          
          // Insert wrapper
          img.parentNode?.insertBefore(wrapper, img)
          wrapper.appendChild(img)
          
          // Create size display
          const sizeDisplay = document.createElement('div')
          sizeDisplay.className = 'img-size-display'
          sizeDisplay.style.cssText = `
            position:absolute;top:-28px;left:50%;transform:translateX(-50%);
            background:#92400e;color:white;padding:3px 10px;border-radius:4px;
            font-size:12px;white-space:nowrap;z-index:100;font-weight:500;
          `
          sizeDisplay.textContent = `${img.width} × ${img.height}px`
          wrapper.appendChild(sizeDisplay)
          
          // Create delete button
          const deleteBtn = document.createElement('button')
          deleteBtn.className = 'img-delete-btn'
          deleteBtn.innerHTML = '×'
          deleteBtn.style.cssText = `
            position:absolute;top:-12px;right:-12px;width:24px;height:24px;
            background:#dc2626;color:white;border:2px solid white;border-radius:50%;
            cursor:pointer;font-size:16px;line-height:18px;z-index:100;
            display:flex;align-items:center;justify-content:center;
          `
          deleteBtn.onclick = (e) => {
            e.stopPropagation()
            wrapper.remove()
            handleChange(quill.root.innerHTML)
          }
          wrapper.appendChild(deleteBtn)
          
          // Create resize handles for all 4 corners + 4 edges
          const handles = [
            { pos: 'nw', cursor: 'nw-resize', style: 'top:-6px;left:-6px;' },
            { pos: 'ne', cursor: 'ne-resize', style: 'top:-6px;right:-6px;' },
            { pos: 'sw', cursor: 'sw-resize', style: 'bottom:-6px;left:-6px;' },
            { pos: 'se', cursor: 'se-resize', style: 'bottom:-6px;right:-6px;' },
            { pos: 'n', cursor: 'n-resize', style: 'top:-6px;left:50%;transform:translateX(-50%);' },
            { pos: 's', cursor: 's-resize', style: 'bottom:-6px;left:50%;transform:translateX(-50%);' },
            { pos: 'w', cursor: 'w-resize', style: 'left:-6px;top:50%;transform:translateY(-50%);' },
            { pos: 'e', cursor: 'e-resize', style: 'right:-6px;top:50%;transform:translateY(-50%);' },
          ]
          
          handles.forEach(({ pos, cursor, style }) => {
            const handle = document.createElement('div')
            handle.className = 'img-resize-handle'
            handle.dataset.pos = pos
            handle.style.cssText = `
              position:absolute;${style}width:12px;height:12px;
              background:#d97706;border:2px solid white;border-radius:50%;
              cursor:${cursor};z-index:100;
            `
            wrapper.appendChild(handle)
            
            // Resize logic for each handle
            handle.onmousedown = (e) => {
              e.preventDefault()
              e.stopPropagation()
              
              const startX = e.clientX
              const startY = e.clientY
              const startWidth = img.offsetWidth
              const startHeight = img.offsetHeight
              const aspectRatio = startHeight / startWidth
              
              const onMouseMove = (e: MouseEvent) => {
                let newWidth = startWidth
                let newHeight = startHeight
                const diffX = e.clientX - startX
                const diffY = e.clientY - startY
                
                // Handle different resize directions
                if (pos.includes('e')) {
                  newWidth = Math.max(50, Math.min(600, startWidth + diffX))
                } else if (pos.includes('w')) {
                  newWidth = Math.max(50, Math.min(600, startWidth - diffX))
                }
                
                if (pos.includes('s')) {
                  newHeight = Math.max(50, Math.min(600, startHeight + diffY))
                } else if (pos.includes('n')) {
                  newHeight = Math.max(50, Math.min(600, startHeight - diffY))
                }
                
                // For corner handles, maintain aspect ratio
                if (pos.length === 2) {
                  newHeight = newWidth * aspectRatio
                }
                
                img.style.width = newWidth + 'px'
                img.style.height = newHeight + 'px'
                sizeDisplay.textContent = `${Math.round(newWidth)} × ${Math.round(newHeight)}px`
              }
              
              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
                handleChange(quill.root.innerHTML)
              }
              
              document.addEventListener('mousemove', onMouseMove)
              document.addEventListener('mouseup', onMouseUp)
            }
          })
        }
      }

      editor.addEventListener('click', handleClick)
      return () => editor.removeEventListener('click', handleClick)
    }

    // Wait for Quill to be ready
    const timer = setTimeout(setupImageResize, 500)
    return () => clearTimeout(timer)
  }, [])

  // Keep titleRef in sync
  useEffect(() => {
    titleRef.current = title
  }, [title])

  // Expose a flush function so the viewer can await a save before navigating
  useEffect(() => {
    if (!flushRef) return
    flushRef.current = async () => {
      if (!isDirtyRef.current) return
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      await saveContentSilent(contentRef.current, titleRef.current)
    }
    return () => {
      if (flushRef) flushRef.current = null
    }
  }, [flushRef, saveContentSilent])

  // On unmount: flush any remaining dirty content with keepalive fetch
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (isDirtyRef.current) {
        const body = JSON.stringify({ content: contentRef.current, title: titleRef.current })
        const url = `/api/notebooks/${notebookIdRef.current}/pages/${pageIdRef.current}`
        fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {})
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col p-6 relative min-h-0">
      {/* Page Number */}
      <div className="text-right text-xs text-amber-400 dark:text-amber-600 mb-2 flex-shrink-0">
        Page {pageNumber}
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={saveTitle}
        placeholder="Page Title"
        className="text-xl font-semibold text-amber-900 dark:text-amber-200 bg-transparent border-none outline-none mb-4 placeholder:text-amber-300 dark:placeholder:text-amber-700 flex-shrink-0"
        disabled={!isEditing}
      />

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Upload indicator */}
      {isUploading && (
        <div className="flex items-center gap-2 mb-2 text-amber-600 text-sm flex-shrink-0">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading image...
        </div>
      )}

      {/* Quill Editor - Full height and scrollable */}
      <div className="flex-1 min-h-0 quill-container">
        <style jsx global>{`
          .quill-container {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .quill-container .quill {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .quill-container .ql-toolbar {
            flex-shrink: 0;
          }
          .quill-container .ql-container {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
          }
          .quill-container .ql-editor {
            min-height: 100%;
            padding: 20px;
          }
          .quill-container .ql-toolbar {
            background: #f8f8f8;
            border-bottom: 1px solid #ccc;
          }
          .ql-font-arial { font-family: Arial, sans-serif !important; }
          .ql-font-georgia { font-family: Georgia, serif !important; }
          .ql-font-verdana { font-family: Verdana, sans-serif !important; }
          .ql-font-tahoma { font-family: Tahoma, sans-serif !important; }
          .ql-font-trebuchet { font-family: 'Trebuchet MS', sans-serif !important; }
          .ql-font-impact { font-family: Impact, sans-serif !important; }
          .ql-font-courier { font-family: 'Courier New', monospace !important; }
          .ql-font-times { font-family: 'Times New Roman', serif !important; }
          .ql-font-palatino { font-family: Palatino, serif !important; }
          .ql-font-garamond { font-family: Garamond, serif !important; }
          .ql-font-roboto { font-family: 'Roboto', sans-serif !important; }
          .ql-font-lato { font-family: 'Lato', sans-serif !important; }
          .ql-font-poppins { font-family: 'Poppins', sans-serif !important; }
          .ql-font-montserrat { font-family: 'Montserrat', sans-serif !important; }
          .ql-font-inter { font-family: 'Inter', sans-serif !important; }
          .ql-font-raleway { font-family: 'Raleway', sans-serif !important; }
          .ql-font-nunito { font-family: 'Nunito', sans-serif !important; }
          .ql-font-oswald { font-family: 'Oswald', sans-serif !important; }
          .ql-font-merriweather { font-family: 'Merriweather', serif !important; }
          .ql-font-ubuntu { font-family: 'Ubuntu', sans-serif !important; }
          .ql-font-playfair { font-family: 'Playfair Display', serif !important; }
          .ql-font-opensans { font-family: 'Open Sans', sans-serif !important; }
          .ql-font-sourcesans { font-family: 'Source Sans 3', sans-serif !important; }
          .ql-font-worksans { font-family: 'Work Sans', sans-serif !important; }
          .ql-font-dmsans { font-family: 'DM Sans', sans-serif !important; }
        `}</style>
        <ReactQuill
          forwardedRef={quillRef}
          theme="snow"
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          readOnly={!isEditing}
          placeholder="Start writing..."
          className="h-full"
        />
      </div>

      {/* Voice recorder + AI suggestion — shown below editor toolbar */}
      {isEditing && (
        <div className="flex-shrink-0 border-t border-amber-100 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-4 py-1.5 flex items-center gap-3">
          <VoiceRecorder
            onTranscription={handleVoiceTranscription}
            disabled={!isEditing}
          />
          {isLoadingSuggestion && (
            <span className="flex items-center gap-1 text-xs text-purple-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              AI thinking…
            </span>
          )}
          {aiSuggestion && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Wand2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
              <p className="text-xs text-purple-700 dark:text-purple-300 italic truncate flex-1">{aiSuggestion}</p>
              <button onClick={acceptSuggestion} className="text-xs px-2 py-0.5 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium flex-shrink-0">Tab ↵</button>
              <button onClick={() => setAiSuggestion("")} className="text-xs text-purple-400 hover:text-purple-600 flex-shrink-0">✕</button>
            </div>
          )}
        </div>
      )}

      {/* Save indicator */}
      {isSaving && (
        <div className="absolute bottom-4 right-4 text-xs text-amber-500 flex items-center gap-1 z-50">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  )
}
