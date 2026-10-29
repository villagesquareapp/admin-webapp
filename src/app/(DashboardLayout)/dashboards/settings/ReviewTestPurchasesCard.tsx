"use client";

import { useMemo, useState } from "react";
import { Label, Radio } from "flowbite-react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { addNewSettings, updateSettings } from "@/app/api/setting";
import { usePermissions } from "@/utils/permissions";

type Setting = Pick<ISettings, "uuid" | "name" | "value_type" | "value">;

// The main API credits a free store test purchase only for these accounts,
// and only while the platform's switch is on.
const ACCOUNTS = "test_purchase_accounts";
const SWITCHES = [
  {
    name: "ios_sandbox_purchases_enabled",
    label: "App Store (iOS)",
    hint: "Sandbox purchases: TestFlight, Xcode and App Review builds.",
  },
  {
    name: "android_test_purchases_enabled",
    label: "Google Play (Android)",
    hint: "Licence-tester purchases.",
  },
];
const DAY = 24 * 60 * 60 * 1000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const inputClass =
  "w-full px-3 py-2 border border-ld rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:bg-darkgray dark:text-white disabled:opacity-60";

const isoDay = (offsetDays = 0) => new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);

// Mirrors the main API: true, or a date / date-time it runs until (a date on
// its own lasts to the end of that day, UTC).
const readSwitch = (value: unknown) => {
  if (value === true || value === "true") return { on: true, until: null as string | null };
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const end = DATE_ONLY.test(value) ? Date.parse(value) + DAY : Date.parse(value);
    return { on: end > Date.now(), until: value };
  }
  return { on: false, until: null };
};

const showDate = (value: string) =>
  DATE_ONLY.test(value)
    ? `end of ${new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })} (UTC)`
    : new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const parseAccounts = (value: unknown): string[] =>
  (Array.isArray(value) ? value : String(value ?? "").split(/[\s,;]+/))
    .map((a) => String(a).trim())
    .filter(Boolean);

export default function ReviewTestPurchasesCard({
  settings,
  onSaved,
}: {
  settings: Setting[];
  onSaved: (setting: Setting) => void;
}) {
  const { can } = usePermissions();
  const allowed = can("settings.payments");
  const byName = useMemo(() => new Map(settings.map((s) => [s.name, s])), [settings]);

  const savedAccounts = parseAccounts(byName.get(ACCOUNTS)?.value);
  const [accounts, setAccounts] = useState(savedAccounts.join("\n"));
  const [baseline, setBaseline] = useState<Record<string, { on: boolean; until: string }>>(() =>
    Object.fromEntries(
      SWITCHES.map(({ name }) => {
        const state = readSwitch(byName.get(name)?.value);
        // "On" with no end date has no until, so saving the form adds one.
        return [name, { on: state.on, until: state.on && state.until ? state.until.slice(0, 10) : "" }];
      })
    )
  );
  const [modes, setModes] = useState(() =>
    Object.fromEntries(SWITCHES.map(({ name }) => [name, { ...baseline[name], until: baseline[name].until || isoDay(14) }]))
  );
  const [saving, setSaving] = useState(false);

  const listed = parseAccounts(accounts);
  const anyOn = SWITCHES.some(({ name }) => modes[name].on);

  const write = async (name: string, value: string | boolean | string[]) => {
    const existing = byName.get(name);
    const response = existing
      ? await updateSettings(existing.uuid, { value })
      : await addNewSettings({
          name,
          value,
          value_type: Array.isArray(value) ? "json" : typeof value === "boolean" ? "boolean" : "string",
        } as Omit<ISettings, "uuid" | "created_at" | "updated_at" | "deleted_at">);
    if (!response?.status) throw new Error(response?.message || `Couldn't save ${name}`);
    const saved = (response.data as Setting | undefined) ?? undefined;
    onSaved(saved?.uuid ? saved : { ...(existing as Setting), value });
  };

  const save = async () => {
    const missingDate = SWITCHES.find(
      ({ name }) => modes[name].on && !modes[name].until && byName.get(name)?.value_type !== "boolean"
    );
    if (missingDate) {
      toast.error(`Pick an end date for ${missingDate.label}`);
      return;
    }
    setSaving(true);
    try {
      const accountsSetting = byName.get(ACCOUNTS);
      if (listed.join(",") !== savedAccounts.join(",") && (accountsSetting || listed.length)) {
        await write(ACCOUNTS, accountsSetting?.value_type === "json" ? listed : listed.join(", "));
      }
      for (const { name } of SWITCHES) {
        const existing = byName.get(name);
        const { on, until } = modes[name];
        const was = baseline[name];
        const onOff = existing?.value_type === "boolean";
        if (on === was.on && (!on || onOff || until === was.until)) continue;
        if (!existing && !on) continue;
        // A switch created as on/off can't hold an end date.
        await write(name, onOff ? on : on ? until : "false");
      }
      setBaseline(modes);
      toast.success("Test purchase settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  const status = (name: string) => {
    const state = readSwitch(byName.get(name)?.value);
    if (state.on && state.until) return { text: `On until ${showDate(state.until)}`, tone: "bg-lightsuccess text-success" };
    if (state.on) return { text: "On, no end date", tone: "bg-lightwarning text-warning" };
    if (state.until) return { text: `Ended ${showDate(state.until)}`, tone: "bg-lightgray dark:bg-dark text-darklink" };
    return { text: "Off", tone: "bg-lightgray dark:bg-dark text-darklink" };
  };

  return (
    <CardBox>
      <div className="p-2 flex flex-col gap-5">
        <div>
          <h5 className="text-base font-semibold">App Review test purchases</h5>
          <p className="text-sm text-darklink mt-1 max-w-2xl">
            Store test purchases cost nothing, so they only add real coins for the accounts listed here, and only
            while the switch is on. Turn it on just before you submit a build for review, with an end date.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {SWITCHES.map(({ name, label, hint }) => {
            const existing = byName.get(name);
            const onOff = existing?.value_type === "boolean";
            const mode = modes[name];
            const pill = status(name);
            return (
              <div key={name} className="rounded-lg border border-ld p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-darklink">{hint}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${pill.tone}`}>{pill.text}</span>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Radio
                    name={name}
                    checked={!mode.on}
                    disabled={!allowed}
                    onChange={() => setModes((m) => ({ ...m, [name]: { ...m[name], on: false } }))}
                  />
                  Off
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Radio
                    name={name}
                    checked={mode.on}
                    disabled={!allowed}
                    onChange={() => setModes((m) => ({ ...m, [name]: { ...m[name], on: true } }))}
                  />
                  {onOff ? "On" : "On until the end of"}
                </label>
                {onOff ? (
                  <p className="text-xs text-darklink">
                    This switch was created as on/off, so it can&apos;t end by itself. Turn it off when review is done.
                  </p>
                ) : (
                  mode.on && (
                    <input
                      type="date"
                      className={inputClass}
                      min={isoDay(0)}
                      value={mode.until}
                      disabled={!allowed}
                      onChange={(e) => setModes((m) => ({ ...m, [name]: { ...m[name], until: e.target.value } }))}
                    />
                  )
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="test-purchase-accounts">Accounts that can buy with test purchases</Label>
          <textarea
            id="test-purchase-accounts"
            rows={3}
            className={inputClass}
            placeholder={"The App Review demo account's email\nyour testers' emails, usernames or user ids"}
            value={accounts}
            disabled={!allowed}
            onChange={(e) => setAccounts(e.target.value)}
          />
          <p className="text-xs text-darklink">One per line, or separated by commas.</p>
          {anyOn && listed.length === 0 && (
            <p className="text-xs text-warning">Nobody is listed, so no test purchase will add coins.</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-darklink">
            {allowed ? "Real purchases aren't affected." : "Only super admins can change these."}
          </p>
          <Button color="primary" onClick={save} disabled={!allowed || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </CardBox>
  );
}
