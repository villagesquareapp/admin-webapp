"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Label, TextInput } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { formatDate } from "@/utils/dateUtils";
import { updatePayoutSettings } from "@/app/api/wallet";

const LEVEL_LABELS: Record<PayoutVerificationLevel, string> = {
  none: "Not verified",
  checkmark: "Checkmark",
  premium: "Premium",
};

// Lagos midnight of the chosen day.
const toIso = (day: string) => (day ? `${day}T00:00:00+01:00` : null);
const toDay = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date(iso))
    : "";

const numberOr = (value: string, fallback: number) =>
  value.trim() === "" || Number.isNaN(Number(value)) ? fallback : Number(value);

const cadence = (days: string) => {
  const n = Number(days);
  if (!Number.isInteger(n) || n < 1) return "";
  if (n === 1) return "daily";
  if (n === 7) return "weekly";
  if (n % 7 === 0) return `every ${n / 7} weeks`;
  if (n === 30) return "monthly";
  return `every ${n} days`;
};

// Who is paid out every cycle and how much. Edited by finance; the app picks
// a change up within a minute.
const PayoutRules = ({ settings }: { settings: IPayoutSettings | null }) => {
  const [form, setForm] = useState(() => ({
    min_followers: String(settings?.min_followers ?? ""),
    first_cycle_day: toDay(settings?.first_cycle_starts_at ?? null),
    min_payout_usd: String(settings?.min_payout_usd ?? ""),
    fx_spread_percent: String(settings?.fx_spread_percent ?? ""),
    fixed_fee_ngn: String(settings?.fixed_fee_ngn ?? ""),
    review_first_payout: settings?.review_first_payout ?? true,
    review_above_usd: String(settings?.review_above_usd ?? ""),
    levels: (settings?.levels ?? []).map((l) => ({
      level: l.level,
      can_be_paid: l.can_be_paid,
      cycle_days: String(l.cycle_days),
      no_limit: l.cycle_limit_usd === null,
      limit: l.cycle_limit_usd === null ? "" : String(l.cycle_limit_usd),
    })),
  }));
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState<"confirm" | "busy" | null>(null);
  if (!settings) return null;

  // Its own step: switching on starts sending money.
  const setLive = async (on: boolean) => {
    setSwitching("busy");
    try {
      const res = await updatePayoutSettings({ auto_payouts_enabled: on });
      if (res?.status) toast.success(on ? "Automatic payouts are on" : "Automatic payouts are off");
      else toast.error(res?.message || "Couldn't change automatic payouts");
    } catch {
      toast.error("Couldn't change automatic payouts");
    } finally {
      setSwitching(null);
    }
  };

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const setLevel = (i: number, patch: Partial<(typeof form.levels)[number]>) =>
    set({ levels: form.levels.map((l, j) => (j === i ? { ...l, ...patch } : l)) });

  const save = async () => {
    const badLimit = form.levels.find((l) => !l.no_limit && !(Number(l.limit) > 0));
    if (badLimit) {
      toast.error(`Set a limit above $0 for ${LEVEL_LABELS[badLimit.level]}, or tick "No limit"`);
      return;
    }
    const badCycle = form.levels.find((l) => !cadence(l.cycle_days) || Number(l.cycle_days) > 90);
    if (badCycle) {
      toast.error(`Pay ${LEVEL_LABELS[badCycle.level]} every 1 to 90 days`);
      return;
    }
    setSaving(true);
    try {
      const res = await updatePayoutSettings({
        min_followers: numberOr(form.min_followers, settings.min_followers),
        first_cycle_starts_at: toIso(form.first_cycle_day),
        min_payout_usd: numberOr(form.min_payout_usd, settings.min_payout_usd),
        fx_spread_percent: numberOr(form.fx_spread_percent, settings.fx_spread_percent),
        fixed_fee_ngn: numberOr(form.fixed_fee_ngn, settings.fixed_fee_ngn),
        review_first_payout: form.review_first_payout,
        review_above_usd: numberOr(form.review_above_usd, settings.review_above_usd),
        levels: form.levels.map((l) => ({
          level: l.level,
          can_be_paid: l.can_be_paid,
          cycle_days: Number(l.cycle_days),
          cycle_limit_usd: l.no_limit ? null : Number(l.limit),
        })),
      });
      if (res?.status) toast.success("Payout rules saved");
      else toast.error(res?.message || "Couldn't save the payout rules");
    } catch {
      toast.error("Couldn't save the payout rules");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    hint: string,
    props: Record<string, unknown> = {},
  ) => (
    <div className="flex flex-col gap-1 min-w-0">
      <Label htmlFor={id}>{label}</Label>
      <TextInput
        id={id}
        type="number"
        sizing="sm"
        value={form[id] as string}
        onChange={(e) => set({ [id]: e.target.value } as Partial<typeof form>)}
        {...props}
      />
      <span className="text-[11px] text-darklink">{hint}</span>
    </div>
  );

  return (
    <CardBox>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="text-sm font-semibold text-dark dark:text-white">Payout rules</h5>
          <p className="text-xs text-darklink mt-1">
            Earnings are paid automatically every cycle to people who meet these rules. Anyone
            else keeps their earnings until they do.
          </p>
        </div>
        <Button size="sm" color="primary" className="h-8" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save rules"}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ld p-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            Automatic payouts:{" "}
            <span className={settings.auto_payouts_enabled ? "text-success" : "text-darklink"}>
              {settings.auto_payouts_enabled ? "on" : "off"}
            </span>
          </p>
          <p className="text-xs text-darklink">
            {settings.auto_payouts_enabled
              ? "Payouts are sent when each level's cycle ends."
              : "Nothing is sent until this is on. Earnings stay in users' wallets until then."}
          </p>
        </div>
        {switching === "confirm" ? (
          <div className="flex gap-2">
            <Button size="sm" color="light" className="h-8" onClick={() => setSwitching(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              color={settings.auto_payouts_enabled ? "failure" : "success"}
              className="h-8"
              onClick={() => setLive(!settings.auto_payouts_enabled)}
            >
              {settings.auto_payouts_enabled ? "Yes, switch off" : "Yes, start paying out"}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            color="light"
            className="h-8"
            disabled={switching === "busy" || (!settings.auto_payouts_enabled && !settings.first_cycle_starts_at)}
            title={!settings.first_cycle_starts_at ? "Save a first cycle date first" : undefined}
            onClick={() => setSwitching("confirm")}
          >
            {settings.auto_payouts_enabled ? "Switch off" : "Switch on"}
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {field("min_followers", "Followers needed", "Fewer than this: not paid yet", { min: 0, step: 1 })}
        <div className="flex flex-col gap-1 min-w-0">
          <Label htmlFor="first_cycle_day">First cycle starts</Label>
          <TextInput
            id="first_cycle_day"
            type="date"
            sizing="sm"
            value={form.first_cycle_day}
            onChange={(e) => set({ first_cycle_day: e.target.value })}
          />
          <span className="text-[11px] text-darklink">Lagos time; every level&apos;s cycles count from this day</span>
        </div>
        {field("min_payout_usd", "Smallest payout (USD)", "Less than this waits for the next cycle", { min: 0, step: 0.01 })}
        {field("fx_spread_percent", "FX spread (%)", "Taken from what's sent", { min: 0, max: 100, step: 0.01 })}
        {field("fixed_fee_ngn", "Flat fee (₦)", "Taken from what's sent", { min: 0, step: 0.01 })}
        {field("review_above_usd", "Review payouts above (USD)", "Larger payouts wait for a person", { min: 1, step: 0.01 })}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.review_first_payout}
          onChange={(e) => set({ review_first_payout: e.target.checked })}
        />
        Review the first payout to a newly added account before it&apos;s sent
      </label>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[620px]">
          <thead>
            <tr className="text-left text-xs text-darklink">
              <th className="py-2 pr-4 font-medium">Verification</th>
              <th className="py-2 pr-4 font-medium">Can be paid</th>
              <th className="py-2 pr-4 font-medium">Paid every (days)</th>
              <th className="py-2 font-medium">Limit per cycle (USD)</th>
            </tr>
          </thead>
          <tbody>
            {form.levels.map((l, i) => (
              <tr key={l.level} className="border-t border-ld">
                <td className="py-2 pr-4 font-medium">{LEVEL_LABELS[l.level]}</td>
                <td className="py-2 pr-4">
                  <input
                    type="checkbox"
                    aria-label={`${LEVEL_LABELS[l.level]} can be paid`}
                    checked={l.can_be_paid}
                    onChange={(e) => setLevel(i, { can_be_paid: e.target.checked })}
                  />
                </td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <TextInput
                      type="number"
                      sizing="sm"
                      className="w-20"
                      min={1}
                      max={90}
                      step={1}
                      value={l.cycle_days}
                      onChange={(e) => setLevel(i, { cycle_days: e.target.value })}
                      aria-label={`${LEVEL_LABELS[l.level]} paid every so many days`}
                    />
                    <span className="text-xs text-darklink whitespace-nowrap">
                      {cadence(l.cycle_days)}
                    </span>
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-3">
                    <TextInput
                      type="number"
                      sizing="sm"
                      className="w-32"
                      min={0.01}
                      step={0.01}
                      disabled={l.no_limit}
                      value={l.no_limit ? "" : l.limit}
                      onChange={(e) => setLevel(i, { limit: e.target.value })}
                      aria-label={`${LEVEL_LABELS[l.level]} limit per cycle`}
                    />
                    <label className="flex items-center gap-1.5 text-xs text-darklink whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={l.no_limit}
                        onChange={(e) => setLevel(i, { no_limit: e.target.checked })}
                      />
                      No limit
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-darklink">
        Above the limit waits for the next cycle; nothing expires. Last changed{" "}
        {formatDate(settings.updated_at)}.
      </p>
    </CardBox>
  );
};

export default PayoutRules;
