"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Label, TextInput, Select } from "flowbite-react";
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
const num = (v: number | null | undefined) => (v == null ? "" : String(v));

const inWindow = (day: number, start: number | null, end: number | null) => {
  if (start == null || end == null) return false;
  return start <= end ? day >= start && day <= end : day >= start || day <= end;
};

const ATCSettingsForm = ({ settings }: { settings: IATCSettings | null }) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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

  const setDay = (k: keyof typeof form, v: string) => {
    const n = v.replace(/[^0-9]/g, "");
    if (n === "" || (Number(n) >= 1 && Number(n) <= 31)) setForm({ ...form, [k]: n });
  };

  const save = async () => {
    setSaving(true);
    const payload: any = { key_information: keyInfo, requirements };
    (Object.keys(form) as (keyof typeof form)[]).forEach((k) => {
      if (form[k] !== "") payload[k] = Number(form[k]);
    });
    const res = await updateATCSettings(payload);
    if (res?.status) { toast.success("Settings saved"); router.refresh(); }
    else toast.error(res?.message || "Save failed");
    setSaving(false);
  };

  const Window = ({ label, sk, ek, tone }: { label: string; sk: keyof typeof form; ek: keyof typeof form; tone: string }) => (
    <div className="rounded-xl border border-ld p-3">
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone} mb-2`}>{label}</p>
      <div className="flex items-center gap-2">
        <TextInput className="w-full" sizing="sm" placeholder="start" value={form[sk]} onChange={(e) => setDay(sk, e.target.value)} />
        <span className="text-darklink text-sm">→</span>
        <TextInput className="w-full" sizing="sm" placeholder="end" value={form[ek]} onChange={(e) => setDay(ek, e.target.value)} />
      </div>
      <p className="text-[11px] text-darklink mt-1.5">days of the month (1–31)</p>
    </div>
  );

  const ItemList = ({ title, items, setItems }: { title: string; items: Item[]; setItems: (v: Item[]) => void }) => (
    <CardBox>
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-semibold text-dark dark:text-white">{title}</h5>
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
              <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-darklink hover:text-error shrink-0"><Icon icon="solar:trash-bin-trash-linear" height={17} /></button>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-darklink py-3 text-center">None yet — add items.</p>}
    </CardBox>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-bold">ATC Settings</h4>
          <p className="text-sm text-darklink">Timeline windows & challenge content</p>
        </div>
        <Button color="primary" size="sm" className="h-10" onClick={save} isProcessing={saving} disabled={saving}>Save settings</Button>
      </div>

      <CardBox>
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold text-dark dark:text-white">Timeline windows</h5>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${appOpen ? "bg-lightsuccess text-success" : "bg-lighterror text-error"}`}>
            Applications {appOpen ? "open" : "closed"} today
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Window label="Application" sk="application_start_day" ek="application_end_day" tone="text-primary" />
          <Window label="Selection" sk="selection_start_day" ek="selection_end_day" tone="text-secondary" />
          <Window label="Voting" sk="voting_start_day" ek="voting_end_day" tone="text-warning" />
        </div>
        <p className="text-xs text-darklink mt-3">
          Applications are open only when today’s date falls within the Application window. To accept entries now, set the window to include day {today}.
        </p>
      </CardBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ItemList title="Key information" items={keyInfo} setItems={setKeyInfo} />
        <ItemList title="Requirements" items={requirements} setItems={setRequirements} />
      </div>
    </div>
  );
};

export default ATCSettingsForm;
