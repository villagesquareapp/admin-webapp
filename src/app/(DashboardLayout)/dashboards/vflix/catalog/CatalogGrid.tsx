"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { toggleAssetActive } from "@/app/api/vflix-catalog";
import { formatCount } from "../vflixStatus";

type Kind = "filter" | "sticker" | "font" | "colour";
const PLURAL: Record<Kind, "filters" | "stickers" | "fonts" | "colours"> = {
  filter: "filters",
  sticker: "stickers",
  font: "fonts",
  colour: "colours",
};

const CatalogGrid = ({
  kind,
  title,
  items,
  uploadLabel = "Upload",
}: {
  kind: Kind;
  title: string;
  items: any[];
  uploadLabel?: string;
}) => {
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = items.filter((it) => it.name.toLowerCase().includes(q.toLowerCase()));

  const toggle = (it: any) =>
    startTransition(async () => {
      const res = await toggleAssetActive(PLURAL[kind], it.id, !it.is_active);
      if (res?.status) toast.success(it.is_active ? "Deactivated" : "Activated");
      else toast.error(res?.message || "Failed");
    });

  const visual = (it: any) => {
    if (kind === "colour")
      return (
        <div className="w-full aspect-square rounded-md" style={{ background: it.hex }} aria-hidden />
      );
    if (kind === "font")
      return (
        <div className="w-full aspect-square rounded-md bg-lightgray dark:bg-dark grid place-items-center overflow-hidden">
          <span className="text-4xl leading-none px-2 text-center" style={{ fontFamily: it.family }}>
            {it.name.slice(0, 2)}
          </span>
        </div>
      );
    // filter / sticker
    return (
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-muted dark:bg-dark">
        <Image src={it.thumbnail || it.image} alt={it.name} fill className="object-cover" />
      </div>
    );
  };

  return (
    <CardBox>
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <h5 className="text-[15px] font-bold tracking-tight">{title}</h5>
            <span className="text-xs text-darklink">{items.length} total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icon icon="solar:magnifer-linear" height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darklink" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}`}
                className="text-sm bg-lightgray dark:bg-dark border border-ld rounded-md pl-9 pr-3 py-2 w-44 focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={() => toast.info(`${uploadLabel} — coming with backend`)}
              className="flex items-center gap-2 text-sm font-semibold bg-primary text-white px-3.5 py-2 rounded-md shrink-0"
            >
              <Icon icon="solar:add-circle-linear" height={17} /> {uploadLabel}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map((it) => (
            <div key={it.id} className="rounded-tw border border-ld p-2.5 flex flex-col gap-2">
              {visual(it)}
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate">{it.name}</p>
                  <p className="text-[11px] text-darklink truncate">
                    {kind === "colour" ? (it.hex as string) : `${formatCount(it.uses_count)} uses`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggle(it)}
                disabled={pending}
                className={`text-[11px] font-semibold px-2 py-1 rounded-full disabled:opacity-50 ${
                  it.is_active ? "bg-lightsuccess text-success" : "bg-lightgray dark:bg-dark text-darklink"
                }`}
              >
                {it.is_active ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-darklink text-sm">No {title.toLowerCase()} match “{q}”.</div>
        )}
      </div>
    </CardBox>
  );
};

export default CatalogGrid;
