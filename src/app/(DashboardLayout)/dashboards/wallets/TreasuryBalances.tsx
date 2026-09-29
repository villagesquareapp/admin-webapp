"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { getCowryBalance, getFlutterwaveBalance } from "@/app/api/wallet";
import TopUpCowryComp from "./TopUpCowryComp";
import FundFlutterwaveComp from "./FundFlutterwaveComp";

const BalanceCard = ({
  label, icon, tone, primary, secondary, loading, unavailable, onRefresh,
}: {
  label: string; icon: string; tone: string;
  primary?: string; secondary?: (string | undefined)[];
  loading: boolean; unavailable?: boolean; onRefresh: () => void;
}) => (
  <CardBox>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className={`size-9 rounded-lg grid place-items-center ${tone}`}><Icon icon={icon} height={18} /></span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <button onClick={onRefresh} aria-label="Refresh" className="text-darklink hover:text-primary transition">
        <Icon icon="solar:refresh-linear" height={16} className={loading ? "animate-spin" : ""} />
      </button>
    </div>
    {unavailable ? (
      <>
        <p className="text-lg font-bold text-darklink mt-3 leading-none">Unavailable</p>
        <p className="text-xs text-darklink mt-2">Provider balance could not be fetched.</p>
      </>
    ) : (
      <>
        <p className="text-2xl font-extrabold tabular-nums mt-3 leading-none">{primary || "—"}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
          {(secondary || []).filter(Boolean).map((s) => (
            <span key={s} className="text-xs text-darklink tabular-nums">{s}</span>
          ))}
        </div>
      </>
    )}
  </CardBox>
);

const TreasuryBalances = ({
  cowry: c0, flutterwave: f0, token,
}: {
  cowry: ICowryBalance | null;
  flutterwave: IFlutterwaveBalance | null;
  token: string;
}) => {
  const [cowry, setCowry] = useState(c0);
  const [flutterwave, setFlutterwave] = useState(f0);
  const [loading, setLoading] = useState<{ [k: string]: boolean }>({});
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);

  const set = (k: string, v: boolean) => setLoading((s) => ({ ...s, [k]: v }));

  const refreshCowry = async () => { set("cowry", true); const r = await getCowryBalance(); if (r?.data) setCowry(r.data); set("cowry", false); };
  const refreshFlutter = async () => { set("flutter", true); const r = await getFlutterwaveBalance(); setFlutterwave(r?.data ?? null); set("flutter", false); };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-bold">Treasury</h4>
          <p className="text-sm text-darklink">Provider & platform balances</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button color="primary" size="sm" className="h-10" onClick={() => setTopUpOpen(true)}>
            <Icon icon="solar:wallet-money-linear" height={16} className="mr-1.5" /> Top up Cowry
          </Button>
          <Button color="light" size="sm" className="h-10" onClick={() => setFundOpen(true)}>
            <Icon icon="solar:card-linear" height={16} className="mr-1.5" /> Fund Flutterwave
          </Button>
          <Link href="/dashboards/random-users">
            <Button color="light" size="sm" className="h-10">
              <Icon icon="solar:transfer-horizontal-linear" height={16} className="mr-1.5" /> Transfer Cowry
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BalanceCard
          label="VS Cowry" icon="solar:wallet-money-linear" tone="bg-lightwarning text-warning"
          primary={cowry?.cowry_value?.balance}
          secondary={[cowry?.usd_value?.balance, cowry?.ngn_value?.balance]}
          loading={!!loading.cowry} onRefresh={refreshCowry}
        />
        <BalanceCard
          label="Flutterwave" icon="solar:card-transfer-linear" tone="bg-lightsuccess text-success"
          primary={flutterwave?.ngn_value?.balance}
          secondary={[flutterwave?.usd_value?.balance]}
          unavailable={!flutterwave}
          loading={!!loading.flutter} onRefresh={refreshFlutter}
        />
      </div>

      {topUpOpen && <TopUpCowryComp isOpen={topUpOpen} onClose={() => setTopUpOpen(false)} token={token} onSuccess={refreshCowry} />}
      {fundOpen && <FundFlutterwaveComp isOpen={fundOpen} onClose={() => setFundOpen(false)} token={token} onSuccess={refreshFlutter} />}
    </div>
  );
};

export default TreasuryBalances;
