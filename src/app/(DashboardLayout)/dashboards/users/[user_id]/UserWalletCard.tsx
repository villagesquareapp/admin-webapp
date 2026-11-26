"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import CardBox from "@/app/components/shared/CardBox";
import { getUserWallet } from "@/app/api/wallet";
import { usePermissions } from "@/utils/permissions";
import CreditWalletModal from "./CreditWalletModal";

const usd = (n?: number | null) =>
  `$${(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const coins = (n?: number | null) => (n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3 py-1 text-sm">
    <span className="text-darklink">{label}</span>
    <span className="font-medium tabular-nums">{value}</span>
  </div>
);

// Ledger balances and history for Finance; hidden for roles without it.
const UserWalletCard = ({ userId, username }: { userId: string; username: string }) => {
  const { can } = usePermissions();
  const [wallet, setWallet] = useState<IUserWallet | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [crediting, setCrediting] = useState(false);
  const canView = can("finance.view");

  const load = useCallback(() => {
    getUserWallet(userId)
      .then((res) => setWallet(res?.data ?? null))
      .catch(() => setWallet(null))
      .finally(() => setLoaded(true));
  }, [userId]);

  useEffect(() => {
    if (canView) load();
  }, [canView, load]);

  if (!canView || (loaded && !wallet)) return null;
  const t = wallet?.totals;
  const frozen = [wallet?.coins?.status, wallet?.earnings?.status].some((s) => s && s !== "active");

  return (
    <CardBox>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h5 className="card-title">Wallet</h5>
        {can("finance.manage") && wallet && (
          <button
            onClick={() => setCrediting(true)}
            className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-md inline-flex items-center gap-1"
          >
            <Icon icon="solar:add-circle-linear" height={14} />
            Add to wallet
          </button>
        )}
      </div>
      {!wallet ? (
        <div className="h-28 rounded-xl animate-pulse bg-lightgray dark:bg-dark" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-lightwarning/40 dark:bg-lightwarning/10 p-3">
              <p className="text-[11px] text-darklink">Coins</p>
              <p className="text-lg font-bold tabular-nums">{wallet.coins ? coins(wallet.coins.balance) : "—"}</p>
              {wallet.coins && wallet.coins.status !== "active" && (
                <p className="text-[11px] text-error font-semibold capitalize">{wallet.coins.status}</p>
              )}
            </div>
            <div className="rounded-xl bg-lightprimary/40 dark:bg-lightprimary/10 p-3">
              <p className="text-[11px] text-darklink">Earnings</p>
              <p className="text-lg font-bold tabular-nums">{wallet.earnings ? usd(wallet.earnings.usd) : "—"}</p>
              <p className="text-[11px] text-darklink">
                {wallet.earnings ? `${coins(wallet.earnings.cowries)} Cowries` : "No earnings wallet"}
                {wallet.earnings && wallet.earnings.status !== "active" && (
                  <span className="text-error font-semibold capitalize"> · {wallet.earnings.status}</span>
                )}
              </p>
            </div>
          </div>
          {frozen && (
            <p className="text-[11px] text-error mt-2">A frozen wallet can&rsquo;t be credited or paid out until it&rsquo;s unfrozen in the Ledger.</p>
          )}

          {t && (
            <div className="mt-3 border-t border-dashed border-border dark:border-darkborder pt-2">
              <Row label="Coins bought" value={coins(t.coins_bought)} />
              <Row label="Coins spent on gifts" value={coins(t.coins_on_gifts)} />
              <Row label="Coins spent on votes" value={coins(t.coins_on_votes)} />
              <Row label="Earned from gifts" value={usd(t.earned_from_gifts_usd)} />
              <Row label="Rewards" value={usd(t.rewards_usd)} />
              <Row label="Paid out" value={usd(t.paid_out_usd)} />
              {t.in_payout_usd > 0 && <Row label="Payout on its way" value={usd(t.in_payout_usd)} />}
            </div>
          )}

          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-darklink mb-1.5">Added by staff</p>
            {wallet.staff_credits.length ? (
              <div className="flex flex-col gap-2">
                {wallet.staff_credits.map((c) => (
                  <div key={c.transaction_id} className="rounded-lg bg-muted/40 dark:bg-dark p-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold tabular-nums">
                        {c.unit === "coins" ? `${coins(c.coins)} Coins` : usd(c.usd)}
                        <span className="text-[11px] font-normal text-darklink ms-1">{c.unit === "coins" ? "Coins" : "Earnings"}</span>
                      </p>
                      <span className="text-[11px] text-darklink shrink-0">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5">{c.description}</p>
                    {(c.staff_note || c.staff) && (
                      <p className="text-[11px] text-darklink mt-0.5">
                        {c.staff ? c.staff.name : "Staff"}
                        {c.staff_note ? ` · ${c.staff_note}` : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-darklink">Nothing added by staff yet.</p>
            )}
          </div>

          {(wallet.coins || wallet.earnings) && (
            <div className="flex items-center gap-3 mt-3 text-xs font-semibold">
              <span className="text-darklink font-normal">History in the Ledger:</span>
              {wallet.coins && (
                <Link href={`/dashboards/ledger?account_id=${wallet.coins.account_id}`} className="text-primary">
                  Coins
                </Link>
              )}
              {wallet.earnings && (
                <Link href={`/dashboards/ledger?account_id=${wallet.earnings.account_id}`} className="text-primary">
                  Earnings
                </Link>
              )}
            </div>
          )}
        </>
      )}
      <CreditWalletModal
        open={crediting}
        userId={userId}
        username={username}
        cowryRateUsd={wallet?.cowry_rate_usd ?? 0.001}
        onClose={() => setCrediting(false)}
        onDone={load}
      />
    </CardBox>
  );
};

export default UserWalletCard;
