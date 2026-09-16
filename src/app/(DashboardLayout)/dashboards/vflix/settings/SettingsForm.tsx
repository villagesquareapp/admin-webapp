"use client";

import { useState, useTransition } from "react";
import { Button, Label, TextInput, ToggleSwitch } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { saveVflixSettings } from "@/app/api/vflix-insights";
import { PanelTitle } from "../VflixUi";

const Toggle = ({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-ld last:border-0">
    <div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-darklink mt-0.5 max-w-md">{desc}</div>
    </div>
    <ToggleSwitch checked={checked} onChange={onChange} />
  </div>
);

const SettingsForm = ({ settings }: { settings: IVflixSettings | null }) => {
  const [s, setS] = useState<IVflixSettings>(
    settings ?? {
      uploads_enabled: true,
      comments_default_on: true,
      auto_moderation: true,
      max_duration_sec: 90,
      auto_flag_reports: 5,
      weight_engagement: 60,
      weight_freshness: 25,
      weight_affinity: 15,
    }
  );
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof IVflixSettings>(k: K, v: IVflixSettings[K]) => setS((p) => ({ ...p, [k]: v }));
  const weightTotal = s.weight_engagement + s.weight_freshness + s.weight_affinity;

  const save = () =>
    startTransition(async () => {
      const res = await saveVflixSettings(s);
      if (res?.status) toast.success("Settings saved");
      else toast.error(res?.message || "Failed to save");
    });

  const Weight = ({ label, k }: { label: string; k: keyof IVflixSettings }) => (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-bold tabular-nums">{s[k] as number}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={s[k] as number}
        onChange={(e) => set(k, Number(e.target.value) as any)}
        className="w-full accent-primary"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-12 gap-30">
      <div className="col-span-12 lg:col-span-6">
        <CardBox className="h-full">
          <div>
            <PanelTitle title="Uploads & comments" />
            <Toggle
              label="Allow VFlix uploads"
              desc="Master switch for new short-form uploads across the app."
              checked={s.uploads_enabled}
              onChange={(v) => set("uploads_enabled", v)}
            />
            <Toggle
              label="Comments on by default"
              desc="New videos start with comments enabled unless the creator turns them off."
              checked={s.comments_default_on}
              onChange={(v) => set("comments_default_on", v)}
            />
            <div className="py-3 border-b border-ld last:border-0">
              <div className="mb-1.5 block">
                <Label htmlFor="max-duration" value="Max video duration (seconds)" />
              </div>
              <TextInput
                id="max-duration"
                type="number"
                value={s.max_duration_sec}
                onChange={(e) => set("max_duration_sec", Number(e.target.value))}
                className="max-w-[160px]"
              />
            </div>
          </div>
        </CardBox>
      </div>

      <div className="col-span-12 lg:col-span-6">
        <CardBox className="h-full">
          <div>
            <PanelTitle title="Moderation" />
            <Toggle
              label="Auto-moderation"
              desc="Run new uploads through automated NSFW / policy detection before they go live."
              checked={s.auto_moderation}
              onChange={(v) => set("auto_moderation", v)}
            />
            <div className="py-3">
              <div className="mb-1.5 block">
                <Label htmlFor="auto-flag" value="Auto-flag after N reports" />
              </div>
              <TextInput
                id="auto-flag"
                type="number"
                value={s.auto_flag_reports}
                onChange={(e) => set("auto_flag_reports", Number(e.target.value))}
                className="max-w-[160px]"
              />
              <p className="text-xs text-darklink mt-1.5">
                A video is moved to the moderation queue automatically once it reaches this many open reports.
              </p>
            </div>
          </div>
        </CardBox>
      </div>

      <div className="col-span-12">
        <CardBox>
          <div>
            <PanelTitle title="Ranking weights" sub="· how the feed scores VFlix" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-1">
              <Weight label="Engagement" k="weight_engagement" />
              <Weight label="Freshness" k="weight_freshness" />
              <Weight label="Affinity" k="weight_affinity" />
            </div>
            <div className={`text-xs mt-4 font-semibold ${weightTotal === 100 ? "text-success" : "text-warning"}`}>
              {weightTotal === 100 ? "✓ Weights total 100%" : `⚠ Weights total ${weightTotal}% (should be 100%)`}
            </div>
          </div>
        </CardBox>
      </div>

      <div className="col-span-12 flex justify-end">
        <Button color="primary" onClick={save} disabled={pending} isProcessing={pending}>
          <Icon icon="solar:diskette-bold" height={18} className="mr-2" /> Save settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsForm;
