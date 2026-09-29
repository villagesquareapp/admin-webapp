"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);
const ngn = (n: number) => `₦${fmt(n)}`;

export interface MonetizationData {
  treasury: { flutterwave_ngn: string; flutterwave_usd: string; cowry: string; cowry_ngn: string };
  kpis: {
    subscribers_total: number; greencheck: number; premium: number;
    pending_withdrawals: number; coin_packages: number; coins_active: number;
    gifts_total: number; gifts_active: number; billing_plans: number;
    vflix_gifts: number; vflix_coin_value: number; vflix_paid_out: number;
  };
  revenue: IBillingOverview | null;
  coins: ICoins[];
  gifts: IGifting[];
}

const usd = (n: number) => `$${new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(n || 0)}`;
const CATEGORY_COLOR: Record<string, string> = {
  subscription: "#00A1FF",
  coin_recharge: "#FFB900",
  gift: "#FF6692",
  other: "#8965E5",
};

const NAV = [
  { href: "/dashboards/coins", label: "Coins", icon: "solar:dollar-minimalistic-linear" },
  { href: "/dashboards/gifts", label: "Gifts", icon: "solar:gift-linear" },
  { href: "/dashboards/wallets", label: "Treasury", icon: "solar:wallet-money-linear" },
];

const Treasury = ({ label, value, sub, icon, tone }: { label: string; value: string; sub?: string; icon: string; tone: string }) => (
  <CardBox>
    <div className="flex items-center justify-between">
      <span className={`size-9 rounded-lg grid place-items-center ${tone}`}><Icon icon={icon} height={18} /></span>
      <span className="text-[11px] text-darklink uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-xl font-extrabold tabular-nums mt-2 leading-none">{value}</p>
    {sub && <p className="text-xs text-darklink mt-1">{sub}</p>}
  </CardBox>
);

const StatusPill = ({ on }: { on: boolean }) => (
  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${on ? "bg-lightsuccess text-success" : "bg-lightgray dark:bg-dark text-darklink"}`}>
    {on ? "Active" : "Disabled"}
  </span>
);

const MonetizationOverview = ({ data }: { data: MonetizationData }) => {
  const { treasury, kpis, revenue, coins, gifts } = data;
  const maxCat = Math.max(1, ...(revenue?.revenue.by_category || []).map((c) => c.net));

  const kpiCards = [
    { label: "Active subscribers", value: kpis.subscribers_total, icon: "solar:users-group-rounded-linear", tone: "bg-lightprimary text-primary" },
    { label: "Greencheck", value: kpis.greencheck, icon: "solar:verified-check-linear", tone: "bg-lightinfo text-info" },
    { label: "Premium", value: kpis.premium, icon: "solar:crown-star-linear", tone: "bg-lightwarning text-warning" },
    { label: "Pending payouts", value: kpis.pending_withdrawals, icon: "solar:money-bag-linear", tone: "bg-lightwarning text-warning" },
    { label: "Coin packages", value: kpis.coin_packages, icon: "solar:dollar-minimalistic-linear", tone: "bg-lightsuccess text-success" },
    { label: "Gifts", value: kpis.gifts_total, icon: "solar:gift-linear", tone: "bg-lightsecondary text-secondary" },
    { label: "Billing plans", value: kpis.billing_plans, icon: "solar:card-linear", tone: "bg-lightprimary text-primary" },
    { label: "VFlix gifts", value: kpis.vflix_gifts, icon: "solar:videocamera-record-linear", tone: "bg-lighterror text-error" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-bold">Monetization</h4>
          <p className="text-sm text-darklink">Treasury, subscriptions, coins & gifts</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg border border-ld hover:border-primary hover:text-primary transition">
              <Icon icon={n.icon} height={16} /> {n.label}
            </Link>
          ))}
        </div>
      </div>

      {/* treasury */}
      <div>
        <h5 className="text-sm font-bold text-darklink uppercase tracking-wide mb-2.5">Treasury balances</h5>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Treasury label="Flutterwave" value={treasury.flutterwave_ngn} sub={treasury.flutterwave_usd} icon="solar:card-2-linear" tone="bg-lightprimary text-primary" />
          <Treasury label="Flutterwave USD" value={treasury.flutterwave_usd} icon="solar:dollar-linear" tone="bg-lightsuccess text-success" />
          <Treasury label="Cowry" value={treasury.cowry} sub={treasury.cowry_ngn} icon="solar:wallet-money-linear" tone="bg-lightwarning text-warning" />
          <Treasury label="Cowry (NGN)" value={treasury.cowry_ngn} icon="solar:banknote-2-linear" tone="bg-lightinfo text-info" />
        </div>
      </div>

      {/* revenue (only when billing/overview is live) */}
      {revenue && (
        <div>
          <h5 className="text-sm font-bold text-darklink uppercase tracking-wide mb-2.5">Revenue</h5>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-4">
              <Treasury label="Net revenue" value={usd(revenue.revenue.net)} sub={`${usd(revenue.revenue.this_month_net)} this month`} icon="solar:money-bag-linear" tone="bg-lightsuccess text-success" />
              <Treasury label="Gross" value={usd(revenue.revenue.gross)} sub={`${usd(revenue.revenue.fees)} fees`} icon="solar:card-linear" tone="bg-lightprimary text-primary" />
              <Treasury label="Payments" value={fmt(revenue.payments.total)} sub={`${fmt(revenue.payments.success)} success · ${fmt(revenue.payments.failed)} failed`} icon="solar:bill-list-linear" tone="bg-lightinfo text-info" />
              <Treasury label="Gifts sent" value={fmt(revenue.gifting.total_sent)} sub={`${fmt(revenue.gifting.total_value)} value`} icon="solar:gift-linear" tone="bg-lightsecondary text-secondary" />
            </div>
            <div className="col-span-12 xl:col-span-8">
              <CardBox>
                <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Net revenue by category</h5>
                {revenue.revenue.by_category.length ? (
                  <div className="flex flex-col gap-2.5">
                    {revenue.revenue.by_category.map((c) => (
                      <div key={c.category} className="grid grid-cols-[130px_1fr_70px] items-center gap-3">
                        <span className="text-xs text-darklink capitalize truncate">{c.category.replace(/_/g, " ")}</span>
                        <span className="h-2 rounded-full bg-lightgray dark:bg-dark overflow-hidden">
                          <span className="block h-full rounded-full" style={{ width: `${(c.net / maxCat) * 100}%`, background: CATEGORY_COLOR[c.category] || CATEGORY_COLOR.other }} />
                        </span>
                        <span className="text-xs font-semibold text-right tabular-nums">{usd(c.net)}</span>
                      </div>
                    ))}
                  </div>
                ) : <div className="py-6 text-center text-sm text-darklink">No successful payments recorded yet.</div>}
              </CardBox>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div>
        <h5 className="text-sm font-bold text-darklink uppercase tracking-wide mb-2.5">Subscriptions & catalog</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {kpiCards.map((c) => <KpiCard key={c.label} icon={c.icon} value={c.value} label={c.label} tone={c.tone} />)}
        </div>
      </div>

      {/* catalogs */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-dark dark:text-white">Coin packages <span className="text-darklink font-normal">({kpis.coins_active}/{kpis.coin_packages} active)</span></h5>
              <Link href="/dashboards/coins" className="text-primary text-sm font-semibold">Manage</Link>
            </div>
            {coins.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {coins.slice(0, 6).map((c) => (
                  <div key={c.uuid} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-darklink">{fmt(Number(c.amount))} coins</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold tabular-nums">${c.price}</span>
                      <StatusPill on={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No coin packages.</div>}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-dark dark:text-white">Gifts <span className="text-darklink font-normal">({kpis.gifts_active}/{kpis.gifts_total} active)</span></h5>
              <Link href="/dashboards/gifts" className="text-primary text-sm font-semibold">Manage</Link>
            </div>
            {gifts.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {gifts.slice(0, 6).map((g) => (
                  <div key={g.uuid} className="flex items-center justify-between py-2.5">
                    <p className="text-sm font-medium truncate">{g.name}</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold tabular-nums flex items-center gap-1"><Icon icon="solar:dollar-minimalistic-bold" className="text-warning" height={14} />{fmt(Number(g.value))}</span>
                      <StatusPill on={g.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No gifts.</div>}
          </CardBox>
        </div>
      </div>

      {/* subscribers + vflix revenue */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Subscribers</h5>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total", value: kpis.subscribers_total, tone: "" },
                { label: "Greencheck", value: kpis.greencheck, tone: "text-info" },
                { label: "Premium", value: kpis.premium, tone: "text-warning" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-ld p-3">
                  <p className="text-[11px] text-darklink">{s.label}</p>
                  <p className={`text-lg font-bold tabular-nums ${s.tone}`}>{fmt(s.value)}</p>
                </div>
              ))}
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">VFlix creator economy</h5>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-ld p-3"><p className="text-[11px] text-darklink">Gifts</p><p className="text-lg font-bold tabular-nums">{fmt(kpis.vflix_gifts)}</p></div>
              <div className="rounded-xl border border-ld p-3"><p className="text-[11px] text-darklink">Coin value</p><p className="text-lg font-bold tabular-nums">{fmt(kpis.vflix_coin_value)}</p></div>
              <div className="rounded-xl border border-ld p-3"><p className="text-[11px] text-darklink">Paid out</p><p className="text-lg font-bold tabular-nums">{ngn(kpis.vflix_paid_out)}</p></div>
            </div>
            <Link href="/dashboards/vflix/monetization" className="text-xs font-semibold text-primary mt-3 inline-flex items-center gap-1">VFlix monetization <Icon icon="solar:alt-arrow-right-linear" height={13} /></Link>
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default MonetizationOverview;
