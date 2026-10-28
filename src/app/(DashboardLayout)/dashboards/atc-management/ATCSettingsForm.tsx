"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, Select, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { updateATCSettings } from "@/app/api/atc";

const ICON_OPTIONS = ["document", "video", "bell", "play", "calendar", "check"];
const ICON_MAP: Record<string, string> = {
  document: "solar:notes-bold-duotone",
  video: "solar:videocamera-record-bold-duotone",
  bell: "solar:bell-bing-bold-duotone",
  play: "solar:videocamera-bold-duotone",
  calendar: "solar:calendar-bold-duotone",
  check: "solar:check-circle-bold",
};

type Item = IATCSettingsItem;
type DayKey =
  | "application_start_day"
  | "application_end_day"
  | "selection_start_day"
  | "selection_end_day"
  | "voting_start_day"
  | "voting_end_day";
type Days = Record<DayKey, string>;

const num = (v: number | null | undefined) => (v == null ? "" : String(v));

const inWindow = (day: number, start: number | null, end: number | null) => {
  if (start == null || end == null) return false;
  return start <= end ? day >= start && day <= end : day >= start || day <= end;
};

const WINDOWS: { label: string; start: DayKey; end: DayKey; text: string; bar: string }[] = [
  { label: "Application", start: "application_start_day", end: "application_end_day", text: "text-primary", bar: "bg-primary" },
  { label: "Selection", start: "selection_start_day", end: "selection_end_day", text: "text-secondary", bar: "bg-secondary" },
  { label: "Voting", start: "voting_start_day", end: "voting_end_day", text: "text-warning", bar: "bg-warning" },
];

// Defined outside the form: a component declared inside it is a new type on
// every render, so its inputs remounted and lost focus after each keystroke.
const WindowInputs = ({
  label,
  text,
  start,
  end,
  onChange,
}: {
  label: string;
  text: string;
  start: string;
  end: string;
  onChange: (which: "start" | "end", value: string) => void;
}) => (
  <div className="rounded-xl border border-ld p-3">
    <p className={`text-xs font-semibold uppercase tracking-wide ${text} mb-2`}>{label}</p>
    <div className="flex items-center gap-2">
      <TextInput className="w-full" sizing="sm" inputMode="numeric" placeholder="start" value={start} onChange={(e) => onChange("start", e.target.value)} />
      <span className="text-darklink text-sm">→</span>
      <TextInput className="w-full" sizing="sm" inputMode="numeric" placeholder="end" value={end} onChange={(e) => onChange("end", e.target.value)} />
    </div>
    <p className="text-[11px] text-darklink mt-1.5">days of the month (1–31)</p>
  </div>
);

const MonthBar = ({ days, today }: { days: Days; today: number }) => {
  const now = new Date();
  const length = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const all = Array.from({ length }, (_, i) => i + 1);
  return (
    <div className="mt-4 overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid gap-px mb-1.5" style={{ gridTemplateColumns: `88px repeat(${length}, minmax(0, 1fr))` }}>
          <span />
          {all.map((d) => (
            <span key={d} className={`text-[10px] text-center tabular-nums ${d === today ? "font-bold text-dark dark:text-white" : "text-darklink"}`}>
              {d === 1 || d === today || d % 5 === 0 ? d : ""}
            </span>
          ))}
        </div>
        {WINDOWS.map((w) => {
          const s = days[w.start] ? Number(days[w.start]) : null;
          const e = days[w.end] ? Number(days[w.end]) : null;
          return (
            <div key={w.label} className="grid gap-px items-center mb-1" style={{ gridTemplateColumns: `88px repeat(${length}, minmax(0, 1fr))` }}>
              <span className={`text-[11px] font-semibold ${w.text}`}>{w.label}</span>
              {all.map((d) => (
                <span
                  key={d}
                  className={`h-2.5 ${inWindow(d, s, e) ? w.bar : "bg-lightgray dark:bg-white/5"} ${d === today ? "ring-1 ring-dark dark:ring-white" : ""} first:rounded-s`}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ItemList = ({ title, items, setItems }: { title: string; items: Item[]; setItems: (v: Item[]) => void }) => (
  <CardBox>
    <div className="flex items-center justify-between mb-3">
      <div>
        <h5 className="text-sm font-semibold text-dark dark:text-white">{title}</h5>
        <p className="text-[11px] text-darklink">Shown in the app’s “How it works”.</p>
      </div>
      <Button size="xs" color="light" onClick={() => setItems([...items, { icon: "check", text: "" }])}>
        <Icon icon="solar:add-circle-linear" height={15} className="mr-1" /> Add
      </Button>
    </div>
    {items.length ? (
      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="size-8 rounded-md grid place-items-center bg-lightprimary text-primary shrink-0"><Icon icon={ICON_MAP[it.icon] || ICON_MAP.check} height={16} /></span>
            <Select sizing="sm" className="w-28 shrink-0" value={it.icon} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))}>
              {ICON_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </Select>
            <TextInput sizing="sm" className="flex-1" value={it.text} placeholder="Text" onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-darklink hover:text-error shrink-0" aria-label="Remove"><Icon icon="solar:trash-bin-trash-linear" height={17} /></button>
          </div>
        ))}
      </div>
    ) : <p className="text-sm text-darklink py-3 text-center">None yet. Add items.</p>}
  </CardBox>
);

const ATCSettingsForm = ({ settings }: { settings: IATCSettings | null }) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Days>({
    application_start_day: num(settings?.application_start_day),
    application_end_day: num(settings?.application_end_day),
    selection_start_day: num(settings?.selection_start_day),
    selection_end_day: num(settings?.selection_end_day),
    voting_start_day: num(settings?.voting_start_day),
    voting_end_day: num(settings?.voting_end_day),
  });
  const [keyInfo, setKeyInfo] = useState<Item[]>(settings?.key_information || []);
  const [requirements, setRequirements] = useState<Item[]>(settings?.requirements || []);

  const today = new Date().getDate();
  const appStart = form.application_start_day ? Number(form.application_start_day) : null;
  const appEnd = form.application_end_day ? Number(form.application_end_day) : null;
  const appOpen = inWindow(today, appStart, appEnd);

  const setDay = (k: DayKey, v: string) => {
    const n = v.replace(/[^0-9]/g, "");
    if (n === "" || (Number(n) >= 1 && Number(n) <= 31)) setForm((f) => ({ ...f, [k]: n }));
  };

  const save = async () => {
    setSaving(true);
    const payload: any = { key_information: keyInfo, requirements };
    (Object.keys(form) as DayKey[]).forEach((k) => {
      if (form[k] !== "") payload[k] = Number(form[k]);
    });
    const res = await updateATCSettings(payload);
    if (res?.status) { toast.success("Settings saved"); router.refresh(); }
    else toast.error(res?.message || "Save failed");
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <CardBox>
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h5 className="text-base font-semibold">Monthly timeline</h5>
            <p className="text-sm text-darklink">When each stage runs, by day of the month. The app shows these dates to everyone.</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${appOpen ? "bg-lightsuccess text-success" : "bg-lighterror text-error"}`}>
            Applications {appOpen ? "open" : "closed"} today (day {today})
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {WINDOWS.map((w) => (
            <WindowInputs
              key={w.label}
              label={w.label}
              text={w.text}
              start={form[w.start]}
              end={form[w.end]}
              onChange={(which, v) => setDay(which === "start" ? w.start : w.end, v)}
            />
          ))}
        </div>
        <MonthBar days={form} today={today} />
        <p className="text-xs text-darklink mt-3">
          Applications are accepted only on days inside the Application window, and only while the month has a live episode. When staff approve a suggestion mid-month, the Application window opens for the whole month.
        </p>
      </CardBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ItemList title="Key information" items={keyInfo} setItems={setKeyInfo} />
        <ItemList title="Requirements" items={requirements} setItems={setRequirements} />
      </div>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button color="primary" className="h-11 shadow-lg" onClick={save} disabled={saving}>
          {saving ? <Spinner size="sm" light /> : <Icon icon="solar:diskette-bold" height={18} className="me-1.5" />}
          Save settings
        </Button>
      </div>
    </div>
  );
};

export default ATCSettingsForm;
