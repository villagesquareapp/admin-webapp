"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

// How the push looks on a lock screen. Approximate: each OS trims long text
// in its own way.
const PushPreview = ({
  title,
  body,
  imageUrl,
  when,
}: {
  title: string;
  body: string;
  imageUrl?: string;
  when?: string;
}) => {
  const [os, setOs] = useState<"ios" | "android">("ios");
  const [imageOk, setImageOk] = useState(true);
  useEffect(() => setImageOk(true), [imageUrl]);
  const showImage = !!imageUrl && imageOk;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="inline-flex rounded-full border border-ld p-0.5 text-xs font-semibold">
        {(["ios", "android"] as const).map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOs(o)}
            className={`px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${
              os === o ? "bg-primary text-white" : "text-darklink hover:text-primary"
            }`}
          >
            <Icon icon={o === "ios" ? "mdi:apple" : "mdi:android"} height={14} />
            {o === "ios" ? "iOS" : "Android"}
          </button>
        ))}
      </div>

      <div className="w-full max-w-[290px] rounded-[2.2rem] border-[6px] border-dark dark:border-black bg-gradient-to-b from-[#3b4a6b] via-[#5d4a7a] to-[#a8667a] p-3 pt-8 shadow-lg">
        <p className="text-center text-white/90 text-4xl font-light tabular-nums">9:41</p>
        <p className="text-center text-white/70 text-[11px] mb-5">{when || "Now"}</p>

        {os === "ios" ? (
          <div className="rounded-2xl bg-white/80 dark:bg-white/75 backdrop-blur p-3 text-[#111]">
            <div className="flex items-start gap-2.5">
              <img src="/vs_images/vs_logo.png" alt="" className="size-8 rounded-lg bg-black p-1 object-contain shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold truncate">{title || "Notification title"}</p>
                  <span className="text-[11px] text-black/50 shrink-0">now</span>
                </div>
                <p className="text-[13px] leading-snug line-clamp-4 break-words">{body || "Your message shows here."}</p>
              </div>
              {showImage && (
                <img src={imageUrl} alt="" onError={() => setImageOk(false)} className="size-10 rounded-md object-cover shrink-0" />
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#f3f0f7] p-3 text-[#1c1b1f]">
            <div className="flex items-center gap-1.5 text-[11px] text-black/60">
              <img src="/vs_images/vs_logo.png" alt="" className="size-4 object-contain" />
              <span>VillageSquare</span>
              <span>· now</span>
              <Icon icon="mdi:chevron-down" height={14} className="ml-auto" />
            </div>
            <p className="text-[14px] font-medium mt-1.5 truncate">{title || "Notification title"}</p>
            <p className="text-[13px] text-black/70 leading-snug line-clamp-3 break-words">{body || "Your message shows here."}</p>
            {showImage && (
              <img src={imageUrl} alt="" onError={() => setImageOk(false)} className="mt-2 w-full max-h-36 rounded-xl object-cover" />
            )}
          </div>
        )}
      </div>
      {imageUrl && !imageOk && (
        <p className="text-xs text-error">The image couldn’t be loaded from that link.</p>
      )}
    </div>
  );
};

export default PushPreview;
