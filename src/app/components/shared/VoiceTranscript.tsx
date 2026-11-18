"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

type Answer = { status?: boolean; message?: string; data?: IVoiceTranscript } | null | undefined;

type View =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; text: string; language: string | null }
  // no_speech is kept; unavailable is asked again next time.
  | { kind: "note"; text: string; keep: boolean }
  | { kind: "error"; text: string };

interface Props {
  load: () => Promise<Answer>;
  onDark?: boolean;
}

const GIVE_UP_AFTER_MS = 60_000;
const UNAVAILABLE = "Transcription isn't available at the moment";
const NO_SPEECH = "No speech was found in this voice note";

// "Show transcript" under a voice note. The transcript is made the first time
// anyone asks; while it's made, ask again after retry_after, for up to a minute.
const VoiceTranscript = ({ load, onDark }: Props) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ kind: "idle" });
  const run = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      run.current += 1;
      clearTimeout(timer.current);
    },
    []
  );

  const ask = async (token: number, startedAt: number) => {
    let res: Answer;
    try {
      res = await load();
    } catch {
      res = null;
    }
    if (token !== run.current) return;
    const t = res?.data;
    if (!res?.status || !t) {
      setView({ kind: "error", text: res?.message || "Couldn't load the transcript." });
    } else if (t.status === "ready" && t.text) {
      setView({ kind: "ready", text: t.text, language: t.language });
    } else if (t.status === "processing") {
      if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
        setView({ kind: "error", text: "This is taking longer than usual." });
        return;
      }
      setView({ kind: "loading" });
      timer.current = setTimeout(() => ask(token, startedAt), (t.retry_after ?? 3) * 1000);
    } else if (t.status === "no_speech") {
      setView({ kind: "note", text: t.message || NO_SPEECH, keep: true });
    } else {
      setView({ kind: "note", text: t.message || UNAVAILABLE, keep: false });
    }
  };

  const start = () => {
    clearTimeout(timer.current);
    const token = ++run.current;
    setView({ kind: "loading" });
    ask(token, Date.now());
  };

  const toggle = () => {
    if (open) {
      setOpen(false);
      run.current += 1;
      clearTimeout(timer.current);
      if (view.kind === "loading") setView({ kind: "idle" });
      return;
    }
    setOpen(true);
    const kept = view.kind === "ready" || (view.kind === "note" && view.keep);
    if (!kept) start();
  };

  const muted = onDark ? "text-white/70" : "text-darklink";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={`self-start flex items-center gap-1.5 text-xs font-semibold ${
          onDark ? "text-white/80 hover:text-white" : "text-darklink hover:text-primary"
        }`}
      >
        <Icon icon="solar:document-text-linear" height={14} />
        {open ? "Hide transcript" : "Show transcript"}
      </button>
      {open && (
        <div
          className={`rounded-lg px-3 py-2 text-sm text-left ${
            onDark ? "bg-white/10 text-white" : "bg-lightgray dark:bg-dark"
          }`}
        >
          {view.kind === "loading" || view.kind === "idle" ? (
            <span className={`flex items-center gap-2 ${muted}`}>
              <Icon icon="svg-spinners:180-ring" height={14} /> Transcribing…
            </span>
          ) : view.kind === "ready" ? (
            <p lang={view.language ?? undefined} className="whitespace-pre-wrap break-words select-text">
              {view.text}
            </p>
          ) : view.kind === "note" ? (
            <p className={muted}>{view.text}</p>
          ) : (
            <p className={muted}>
              {view.text}{" "}
              <button type="button" onClick={start} className="font-semibold text-primary hover:underline">
                Try again
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceTranscript;
