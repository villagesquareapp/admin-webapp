"use client";

import { Icon } from "@iconify/react";
import { format, parseISO } from "date-fns";
import { PersonCell } from "../meetings/meetingsUi";

export const CATEGORY_LABEL: Record<string, string> = {
  gift_sent: "Gift sent",
  gift_received: "Gift received",
  daily_login_reward: "Daily login reward",
  ads_watch_reward: "Ad reward",
  coin_recharge: "Coin purchase",
  withdrawal: "Payout",
  atc_vote: "ATC vote",
  referral_welcome_bonus: "Referral: welcome",
  referral_profile_completion: "Referral: profile",
  referral_engagement_milestone: "Referral: engagement",
  subscription_payment: "Subscription",
  opening_balance: "Opening balance",
  coin_debit: "Coin debit",
  cowry_debit: "Cowry debit",
  refund: "Refund",
  transfer: "Transfer",
};

export const TYPE_LABEL: Record<string, string> = {
  purchase: "Purchase",
  gift: "Gift",
  withdrawal: "Payout",
  reward: "Reward",
  reversal: "Reversal",
  migration: "Migration",
};

export const ACCOUNT_LABEL: Record<string, string> = {
  vs_coin: "Coins",
  cowry: "Cowries",
  revenue: "Platform revenue",
  vs_coin_recharge_pool: "Coin recharge pool",
  rewards_pool: "Rewards pool",
  withdrawal_holding: "Payout holding",
};

export const CURRENCY_UNIT: Record<string, string> = { vs_coin: "coins", cowry: "cowries" };

const STATUS_TONE: Record<string, string> = {
  active: "bg-lightsuccess text-success",
  success: "bg-lightsuccess text-success",
  frozen: "bg-lightwarning text-warning",
  pending: "bg-lightwarning text-warning",
  initialized: "bg-lightprimary text-primary",
  failed: "bg-lighterror text-error",
  closed: "bg-lightgray dark:bg-dark text-darklink",
};

export const StatusChip = ({ status }: { status?: string | null }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_TONE[status ?? ""] || "bg-lightgray dark:bg-dark text-darklink"}`}>
    {status || "—"}
  </span>
);

export const amount = (value?: string | number | null, currency?: string) => {
  const n = Number(value ?? 0);
  const text = new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(n);
  return currency ? `${text} ${CURRENCY_UNIT[currency] ?? currency}` : text;
};

export const when = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "MMM d, yyyy · h:mm a");
  } catch {
    return iso;
  }
};

export const OwnerCell = ({ owner, accountType }: { owner?: ILedgerOwner | null; accountType?: string }) =>
  owner?.system ? (
    <div className="flex items-center gap-3 min-w-0">
      <span className="size-8 rounded-full grid place-items-center bg-lightsecondary text-secondary shrink-0">
        <Icon icon="solar:safe-square-bold-duotone" height={17} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate max-w-[200px]">{owner.name}</p>
        <p className="text-xs text-darklink">System pool</p>
      </div>
    </div>
  ) : (
    <PersonCell
      person={owner ?? null}
      sub={owner?.username ? `@${owner.username}${accountType ? ` · ${ACCOUNT_LABEL[accountType] ?? accountType}` : ""}` : undefined}
    />
  );

// Who paid whom: the debited accounts, then the credited ones.
export const parties = (t: ILedgerTransaction) => {
  const name = (e: ILedgerEntry) =>
    e.account?.owner?.system
      ? e.account.owner.name
      : e.account?.owner?.username
        ? `@${e.account.owner.username}`
        : e.account?.owner?.name || "Unknown";
  const from = [...new Set(t.entries.filter((e) => e.entry_type === "debit").map(name))];
  const to = [...new Set(t.entries.filter((e) => e.entry_type === "credit").map(name))];
  return { from: from.join(", ") || "—", to: to.join(", ") || "—" };
};

// The amount moved, per currency (credits, so a two-sided entry counts once).
export const moved = (t: ILedgerTransaction) => {
  const totals = new Map<string, number>();
  for (const e of t.entries) {
    if (e.entry_type !== "credit") continue;
    totals.set(e.currency_type, (totals.get(e.currency_type) ?? 0) + Number(e.amount));
  }
  return [...totals.entries()].map(([c, n]) => amount(n, c)).join(" + ") || "—";
};
