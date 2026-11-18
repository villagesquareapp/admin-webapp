"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

// One voice note at a time across the page: starting one pauses the last.
let playing: HTMLAudioElement | null = null;

const SPEEDS = [1, 1.5, 2];
const BARS = 36;

const clock = (s: number) => {
  const t = Math.max(0, Math.round(s || 0));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

// The waveform from the app's loudness samples (0–100), stretched or
// squeezed to a fixed number of bars; flat bars when there are none.
const bars = (waveform?: number[] | null) => {
  if (!waveform?.length) return Array(BARS).fill(30);
  return Array.from({ length: BARS }, (_, i) => {
    const v = waveform[Math.floor((i * waveform.length) / BARS)] ?? 0;
    return Math.max(12, Math.min(100, v));
  });
};

interface Props {
  src: string;
  duration?: number | null;
  waveform?: number[] | null;
  // On the dark media stage rather than a card.
  onDark?: boolean;
  size?: "sm" | "md";
}

const VoiceNotePlayer = ({ src, duration, waveform, onDark, size = "sm" }: Props) => {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(duration ?? 0);
  const [speed, setSpeed] = useState(1);
  const heights = bars(waveform);

  useEffect(() => () => audio.current?.pause(), []);

  const toggle = async () => {
    const el = audio.current;
    if (!el) return;
    if (!el.paused) return el.pause();
    if (playing && playing !== el) playing.pause();
    playing = el;
    setFailed(false);
    setLoading(true);
    try {
      el.playbackRate = speed;
      await el.play();
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audio.current;
    if (!el || !length) return;
    const box = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - box.left) / box.width) * length;
    setTime(el.currentTime);
  };

  const nextSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (audio.current) audio.current.playbackRate = next;
  };

  const progress = length ? time / length : 0;
  const md = size === "md";
  const tone = onDark
    ? { box: "bg-white/10", played: "bg-white", rest: "bg-white/30", text: "text-white/80", btn: "bg-white text-dark" }
    : { box: "bg-lightgray dark:bg-dark", played: "bg-primary", rest: "bg-primary/25", text: "text-darklink", btn: "bg-primary text-white" };

  return (
    <div className={`flex items-center gap-2.5 rounded-full ${tone.box} ${md ? "px-3 py-2.5" : "px-2 py-1.5"} min-w-0 max-w-full`}>
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setTime(0);
          if (audio.current) audio.current.currentTime = 0;
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setLength(d);
        }}
        onError={() => setFailed(true)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "Pause voice note" : `Play voice note, ${Math.round(length)} seconds`}
        className={`${md ? "size-10" : "size-8"} shrink-0 rounded-full grid place-items-center ${tone.btn} hover:opacity-90 transition`}
      >
        <Icon
          icon={loading ? "svg-spinners:180-ring" : isPlaying ? "solar:pause-bold" : "solar:play-bold"}
          height={md ? 18 : 15}
        />
      </button>
      <div
        role="presentation"
        aria-hidden
        onClick={seek}
        className={`flex-1 min-w-[90px] flex items-center gap-[2px] cursor-pointer ${md ? "h-9" : "h-6"}`}
      >
        {heights.map((h, i) => (
          <span
            key={i}
            className={`flex-1 rounded-full ${i / BARS < progress ? tone.played : tone.rest}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <span className={`text-[11px] tabular-nums shrink-0 ${tone.text}`}>
        {failed ? "Can't play" : clock(isPlaying || time ? length - time : length)}
      </span>
      <button
        type="button"
        onClick={nextSpeed}
        aria-label={`Playback speed ${speed}×`}
        className={`text-[10px] font-bold shrink-0 rounded-full px-1.5 py-0.5 border ${onDark ? "border-white/30 text-white/80" : "border-ld text-darklink"}`}
      >
        {speed}×
      </button>
    </div>
  );
};

export default VoiceNotePlayer;
