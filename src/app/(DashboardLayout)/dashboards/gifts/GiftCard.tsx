"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Button, Dropdown } from "flowbite-react";
import { Icon } from "@iconify/react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { getGiftingOverview } from "@/app/api/gift";
import AdminAddGift from "./AdminAddGift";
import EditGiftModal from "./EditGiftModal";
import ChangeGiftStatus from "./ChangeGiftStatus";

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);
const isUrl = (s?: string) => !!s && s.startsWith("http");

// Reliable thumbnail: render the icon image only when it's a real URL, and fall
// back to a clean inline gift glyph if it isn't one or the image fails to load.
const GiftThumb = ({ icon, name }: { icon?: string; name?: string }) => {
  const [broken, setBroken] = useState(false);
  if (!isUrl(icon) || broken) {
    return (
      <span className="absolute inset-0 grid place-items-center bg-lightsecondary text-secondary">
        <Icon icon="solar:gift-bold" height={26} />
      </span>
    );
  }
  return <Image src={icon as string} alt={name || ""} fill className="object-cover" onError={() => setBroken(true)} unoptimized />;
};

// Value tiers (in coins) — like the big platforms' gift rarities.
const TIERS = [
  { min: 10000, label: "Mythic", ring: "ring-pink-500", chip: "bg-pink-500/15 text-pink-500", glow: "from-pink-500/20" },
  { min: 2000, label: "Legendary", ring: "ring-amber-500", chip: "bg-amber-500/15 text-amber-500", glow: "from-amber-500/20" },
  { min: 500, label: "Epic", ring: "ring-secondary", chip: "bg-lightsecondary text-secondary", glow: "from-secondary/20" },
  { min: 100, label: "Rare", ring: "ring-primary", chip: "bg-lightprimary text-primary", glow: "from-primary/20" },
  { min: 0, label: "Common", ring: "ring-gray-300 dark:ring-white/15", chip: "bg-lightgray dark:bg-dark text-darklink", glow: "from-transparent" },
];
const tierOf = (value: number) => TIERS.find((t) => value >= t.min) || TIERS[TIERS.length - 1];

const toGift = (g: IGiftStat): IGifting => ({
  uuid: g.uuid, name: g.name, icon: g.icon, value: Number(g.value),
  status: g.status, created_at: g.created_at, updated_at: g.updated_at || g.created_at, deleted_at: null,
});

const GiftCard = ({ overview, token }: { overview: IGiftOverview; token: string }) => {
  const [data, setData] = useState<IGiftOverview>(overview);
  const [isOpen, setIsOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<IGifting | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusGift, setStatusGift] = useState<IGifting | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "disabled">("all");

  const refresh = async () => {
    const res = await getGiftingOverview();
    if (res?.data) setData(res.data);
  };

  const { totals, gifts, top_gifts } = data;
  const maxSent = Math.max(1, ...gifts.map((g) => g.sent_count));

  const shown = useMemo(
    () => gifts.filter((g) => (filter === "all" ? true : filter === "active" ? g.status : !g.status)),
    [gifts, filter],
  );

  const kpis = [
    { label: "Total gifts", value: totals.total_gifts, icon: "solar:gift-linear", tone: "bg-lightprimary text-primary" },
    { label: "Active", value: totals.active_gifts, icon: "solar:check-circle-linear", tone: "bg-lightsuccess text-success" },
    { label: "Gifts sent", value: totals.total_sent, icon: "solar:hand-heart-linear", tone: "bg-lightsecondary text-secondary" },
    { label: "Value sent (coins)", value: totals.total_value_sent, icon: "solar:dollar-minimalistic-linear", tone: "bg-lightwarning text-warning" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-bold">Gifts</h4>
          <p className="text-sm text-darklink">Catalog & send analytics</p>
        </div>
        <Button color="primary" size="sm" className="h-10" onClick={() => setIsOpen(true)}>
          <FaPlus size={13} className="mr-2" /> Add gift
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((c) => <KpiCard key={c.label} icon={c.icon} value={c.value} label={c.label} tone={c.tone} />)}
      </div>

      {/* top gifts */}
      {top_gifts.length > 0 && top_gifts.some((g) => g.sent_count > 0) && (
        <CardBox>
          <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Most gifted</h5>
          <div className="flex flex-col gap-2.5">
            {top_gifts.filter((g) => g.sent_count > 0).map((g) => (
              <div key={g.uuid} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <div className="flex items-center gap-2.5 min-w-0 w-44">
                  <div className="relative size-8 rounded-lg overflow-hidden bg-lightgray dark:bg-dark shrink-0">
                    <GiftThumb icon={g.icon} name={g.name} />
                  </div>
                  <span className="text-sm font-medium truncate">{g.name}</span>
                </div>
                <span className="h-2 rounded-full bg-lightgray dark:bg-dark overflow-hidden">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${(g.sent_count / maxSent) * 100}%` }} />
                </span>
                <span className="text-xs font-semibold tabular-nums text-right w-24">{fmt(g.sent_count)} · {g.share}%</span>
              </div>
            ))}
          </div>
        </CardBox>
      )}

      {/* filter */}
      <div className="flex items-center gap-2">
        {(["all", "active", "disabled"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition ${filter === f ? "bg-primary text-white" : "bg-lightgray dark:bg-dark text-darklink"}`}>
            {f}
          </button>
        ))}
        <span className="text-xs text-darklink ml-1">{shown.length} shown</span>
      </div>

      {/* gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {shown.map((g) => {
          const tier = tierOf(Number(g.value));
          return (
            <CardBox key={g.uuid} className={`!p-0 overflow-hidden relative group ${!g.status ? "opacity-60" : ""}`}>
              <div className={`absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition`} onClick={(e) => e.stopPropagation()}>
                <Dropdown label="" inline dismissOnClick renderTrigger={() => (
                  <button className="size-7 grid place-items-center rounded-full bg-white/90 dark:bg-dark/90 shadow"><HiOutlineDotsVertical size={15} /></button>
                )}>
                  <Dropdown.Item disabled={!g.status} onClick={() => { setEditingGift(toGift(g)); setEditModalOpen(true); }}>Edit</Dropdown.Item>
                  <Dropdown.Item onClick={() => { setStatusGift(toGift(g)); setStatusModalOpen(true); }}>{g.status ? "Disable" : "Enable"}</Dropdown.Item>
                </Dropdown>
              </div>
              <div className={`pt-5 pb-3 px-3 flex flex-col items-center text-center bg-gradient-to-b ${tier.glow} to-transparent`}>
                <div className={`relative size-20 rounded-2xl overflow-hidden bg-lightgray dark:bg-dark ring-2 ${tier.ring} ring-offset-2 ring-offset-white dark:ring-offset-darkgray`}>
                  <GiftThumb icon={g.icon} name={g.name} />
                </div>
                <p className="text-sm font-semibold mt-3 truncate max-w-full">{g.name}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1 ${tier.chip}`}>{tier.label}</span>
              </div>
              <div className="px-3 pb-3 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-1 text-sm font-bold">
                  <Icon icon="solar:dollar-minimalistic-bold" className="text-warning" height={15} />
                  <span className="tabular-nums">{fmt(Number(g.value))}</span>
                  <span className="text-xs text-darklink font-normal">coins</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-ld">
                  <span className="text-darklink flex items-center gap-1"><Icon icon="solar:hand-heart-linear" height={13} /> {fmt(g.sent_count)} sent</span>
                  <span className={`font-semibold px-1.5 rounded ${g.status ? "text-success" : "text-darklink"}`}>{g.status ? "Active" : "Off"}</span>
                </div>
              </div>
            </CardBox>
          );
        })}
      </div>

      {isOpen && <AdminAddGift isOpen={isOpen} onClose={() => setIsOpen(false)} token={token} onGiftAdded={refresh} />}
      {editModalOpen && editingGift && (
        <EditGiftModal isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setEditingGift(null); }} gift={editingGift} onGiftUpdated={refresh} />
      )}
      {statusModalOpen && (
        <ChangeGiftStatus isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} gift={statusGift} refreshGifts={refresh} />
      )}
    </div>
  );
};

export default GiftCard;
