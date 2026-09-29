"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Button, Dropdown } from "flowbite-react";
import { Icon } from "@iconify/react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { getCoinOverview } from "@/app/api/coin";
import AddCoin from "./AddCoin";
import EditCoin from "./EditCoin";
import ChangeCoinStatus from "./ChangeCoinStatus";

const COIN_IMG = "https://cdn-assets.villagesquare.io/assets/coins/villagesquare-coin.png";
const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);
const full = (n: number) => new Intl.NumberFormat("en").format(n || 0);

const toCoin = (c: ICoinStat): ICoins => ({
  uuid: c.uuid, name: c.name ?? "", amount: c.amount, price: c.price,
  in_app_purchase_id: c.in_app_purchase_id, tag: c.tag, description: c.description,
  status: c.status, created_at: c.created_at, updated_at: c.updated_at || c.created_at, deleted_at: null,
});

const CoinCard = ({ overview, token }: { overview: ICoinOverview; token: string }) => {
  const [data, setData] = useState<ICoinOverview>(overview);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCoin, setEditingCoin] = useState<ICoins | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusCoin, setStatusCoin] = useState<ICoins | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const refresh = async () => {
    const res = await getCoinOverview();
    if (res?.data) setData(res.data);
  };

  const { totals, packages } = data;
  const hasPurchaseData = totals.total_purchases > 0;

  const { bestValueId, mostCoinsId } = useMemo(() => {
    let best: ICoinStat | null = null, most: ICoinStat | null = null;
    for (const p of packages) {
      if (!best || p.coins_per_usd > best.coins_per_usd) best = p;
      if (!most || Number(p.amount) > Number(most.amount)) most = p;
    }
    return { bestValueId: best?.uuid, mostCoinsId: most?.uuid };
  }, [packages]);

  const kpis = [
    { label: "Packages", value: totals.total_packages, icon: "solar:dollar-minimalistic-linear", tone: "bg-lightprimary text-primary", prefix: "" },
    { label: "Active", value: totals.active_packages, icon: "solar:check-circle-linear", tone: "bg-lightsuccess text-success", prefix: "" },
    { label: "Purchases", value: totals.total_purchases, icon: "solar:cart-check-linear", tone: "bg-lightsecondary text-secondary", prefix: "" },
    { label: "Revenue", value: totals.total_revenue, icon: "solar:money-bag-linear", tone: "bg-lightwarning text-warning", prefix: "$" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-bold">VS Coins</h4>
          <p className="text-sm text-darklink">
            Recharge packages{totals.min_price > 0 ? ` · $${totals.min_price}–$${totals.max_price}` : ""}
          </p>
        </div>
        <Button color="primary" size="sm" className="h-10" onClick={() => setIsOpen(true)}>
          <FaPlus size={13} className="mr-2" /> Add package
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((c) => (
          <KpiCard key={c.label} icon={c.icon} value={c.value} label={c.label} tone={c.tone} prefix={c.prefix} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {packages.map((c) => {
          const amount = Number(c.amount);
          return (
            <CardBox key={c.uuid} className={`relative ${!c.status ? "opacity-60" : ""}`}>
              <div className="absolute top-2.5 right-2.5 z-10" onClick={(e) => e.stopPropagation()}>
                <Dropdown label="" inline dismissOnClick renderTrigger={() => (
                  <button className="size-7 grid place-items-center rounded-full hover:bg-lightgray dark:hover:bg-dark"><HiOutlineDotsVertical size={15} /></button>
                )}>
                  <Dropdown.Item disabled={!c.status} onClick={() => { setEditingCoin(toCoin(c)); setEditModalOpen(true); }}>Edit</Dropdown.Item>
                  <Dropdown.Item onClick={() => { setStatusCoin(toCoin(c)); setStatusModalOpen(true); }}>{c.status ? "Disable" : "Enable"}</Dropdown.Item>
                </Dropdown>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative size-12 shrink-0">
                  <Image src={COIN_IMG} alt="coins" fill className="object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-extrabold tabular-nums leading-none">{full(amount)}</p>
                  <p className="text-xs text-darklink">{c.name || "coins"}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xl font-extrabold text-primary tabular-nums leading-none">${c.price}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-1">
                {c.uuid === bestValueId && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-lightsuccess text-success">Best value</span>}
                {c.uuid === mostCoinsId && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-lightwarning text-warning">Most coins</span>}
                {c.tag && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-lightsecondary text-secondary">{c.tag}</span>}
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${c.status ? "bg-lightprimary text-primary" : "bg-lightgray dark:bg-dark text-darklink"}`}>{c.status ? "Active" : "Disabled"}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-ld text-center">
                <div>
                  <p className="text-[11px] text-darklink">Coins / $</p>
                  <p className="text-sm font-bold tabular-nums">{fmt(c.coins_per_usd)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-darklink">{hasPurchaseData ? "Purchases" : "Coins"}</p>
                  <p className="text-sm font-bold tabular-nums">{hasPurchaseData ? full(c.purchases) : fmt(amount)}</p>
                </div>
              </div>

              {hasPurchaseData && c.revenue > 0 && (
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-darklink">Revenue</span>
                  <span className="font-semibold tabular-nums">${full(c.revenue)}</span>
                </div>
              )}

              {c.in_app_purchase_id && (
                <p className="text-[10px] font-mono text-darklink truncate mt-2" title={c.in_app_purchase_id}>{c.in_app_purchase_id}</p>
              )}
            </CardBox>
          );
        })}
      </div>

      {isOpen && <AddCoin isOpen={isOpen} onClose={() => setIsOpen(false)} token={token} onCoinAdded={refresh} />}
      {editModalOpen && editingCoin && (
        <EditCoin isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setEditingCoin(null); }} coin={editingCoin} onCoinUpdated={refresh} />
      )}
      {statusModalOpen && (
        <ChangeCoinStatus isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} coin={statusCoin} refreshCoins={refresh} />
      )}
    </div>
  );
};

export default CoinCard;
