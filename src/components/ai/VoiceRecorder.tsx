"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

type RecordState = "idle" | "recording" | "processing" | "done" | "error";

export function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick a supported MIME type
      const mimeType = ["audio/webm", "audio/ogg", "audio/mp4"]
        .find(t => MediaRecorder.isTypeSupported(t)) || "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        await transcribe(new Blob(chunksRef.current, { type: mimeType || "audio/webm" }), mimeType);
      };

      recorder.start(250);
      setState("recording");
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (err: any) {
      setErrorMsg("Microphone access denied");
      setState("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      setState("processing");
      mediaRecorderRef.current.stop();
    }
  }, []);

  const transcribe = async (blob: Blob, mimeType: string) => {
    const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "webm";
    const file = new File([blob], `recording.${ext}`, { type: mimeType || "audio/webm" });

    const form = new FormData();
    form.append("audio", file);

    try {
      const res = await fetch("/api/ai/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Transcription failed");
        setState("error");
        return;
      }
      onTranscription(data.text || "");
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setErrorMsg("Network error");
      setState("error");
    }
  };

  const cancel = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setState("idle");
    setDuration(0);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative flex items-center gap-1">
      {/* Main mic button */}
      <button
        type="button"
        disabled={disabled || state === "processing"}
        onClick={state === "recording" ? stopRecording : startRecording}
        title={state === "recording" ? "Stop recording" : "Record voice note"}
        className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${
          state === "recording"
            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse"
            : state === "processing"
            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
            : state === "done"
            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
            : state === "error"
            ? "bg-red-100 dark:bg-red-900/30 text-red-500"
            : "text-neutral-500 dark:text-neutral-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600"
        }`}
      >
        {state === "processing" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : state === "done" ? (
          <Check className="w-4 h-4" />
        ) : state === "recording" ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Cancel while recording */}
      {state === "recording" && (
        <button
          type="button"
          onClick={cancel}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Status label */}
      <AnimatePresence>
        {(state === "recording" || state === "processing" || state === "error") && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            className={`text-xs font-medium whitespace-nowrap ${
              state === "error"
                ? "text-red-500"
                : state === "processing"
                ? "text-amber-600 dark:text-amber-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {state === "recording" && `● ${fmt(duration)}`}
            {state === "processing" && "Transcribing…"}
            {state === "error" && errorMsg}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
