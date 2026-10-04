"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Label, Select, TextInput, Textarea } from "flowbite-react";
import { toast } from "sonner";
import { createTrybe, updateTrybe } from "@/app/api/trybes";

const list = (text: string, sep: RegExp) =>
  text
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);

// Create or edit a Trybe's profile. Every field maps to what the app shows on
// the Trybe page, the Explore card and the Trybe Code sheet.
const TrybeForm = ({ types, trybe }: { types: ITrybeType[]; trybe?: ITrybeDetail }) => {
  const router = useRouter();
  const [typeId, setTypeId] = useState(trybe?.type_id ?? types.find((t) => t.slug === "campus")?.uuid ?? types[0]?.uuid ?? "");
  const [name, setName] = useState(trybe?.name ?? "");
  const [subtitle, setSubtitle] = useState(trybe?.subtitle ?? "");
  const [tagline, setTagline] = useState(trybe?.tagline ?? "");
  const [about, setAbout] = useState(trybe?.about ?? "");
  const [topics, setTopics] = useState((trybe?.topics ?? []).join(", "));
  const [rules, setRules] = useState((trybe?.rules ?? []).join("\n"));
  const [levels, setLevels] = useState((trybe?.levels ?? ["100 lvl", "200 lvl", "300 lvl", "400 lvl", "500 lvl"]).join(", "));
  const [saving, setSaving] = useState(false);

  const type = types.find((t) => t.uuid === typeId);
  const campus = type?.join_form === "campus";

  const save = async () => {
    const body: Record<string, unknown> = {
      type_id: typeId,
      name: name.trim(),
      subtitle: subtitle.trim() || undefined,
      tagline: tagline.trim() || undefined,
      about: about.trim() || undefined,
      topics: list(topics, /,/),
      rules: list(rules, /\n/),
    };
    if (campus) body.levels = list(levels, /,/);
    setSaving(true);
    try {
      const res = trybe ? await updateTrybe(trybe.uuid, body) : await createTrybe(body);
      if (res?.status && res.data) {
        toast.success(trybe ? "Trybe updated" : "Trybe created");
        if (!trybe) router.push(`/dashboards/trybes/${res.data.uuid}`);
      } else {
        toast.error(res?.message || "Couldn't save the Trybe");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type" value="Type" />
          <Select id="type" value={typeId} onChange={(e) => setTypeId(e.target.value)} className="mt-1">
            {types.map((t) => (
              <option key={t.uuid} value={t.uuid}>
                {t.name}
                {t.is_enabled ? "" : " (disabled)"}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="name" value="Name" />
          <TextInput id="name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Unilag Trybe" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="subtitle" value={campus ? "School" : "Subtitle"} />
          <TextInput
            id="subtitle"
            value={subtitle}
            maxLength={120}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder={campus ? "University of Lagos" : ""}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="tagline" value="Tagline" />
          <TextInput
            id="tagline"
            value={tagline}
            maxLength={160}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Network and build your business"
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="about" value="About" />
        <Textarea id="about" rows={4} maxLength={2000} value={about} onChange={(e) => setAbout(e.target.value)} className="mt-1" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="topics" value="Topics covered (comma separated)" />
          <TextInput id="topics" value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Campus events, Academics, Activities" className="mt-1" />
        </div>
        {campus && (
          <div>
            <Label htmlFor="levels" value="Levels students can pick (comma separated)" />
            <TextInput id="levels" value={levels} onChange={(e) => setLevels(e.target.value)} className="mt-1" />
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="rules" value="Admin rules (one per line, shown under the Trybe Code)" />
        <Textarea
          id="rules"
          rows={4}
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder={"Business promotions, links, or events must get admin approval.\nIf you see something wrong, report it to admins instead of fighting back."}
          className="mt-1"
        />
      </div>
      <div className="flex justify-end">
        <Button color="primary" onClick={save} isProcessing={saving} disabled={saving || name.trim().length < 2 || !typeId}>
          {trybe ? "Save changes" : "Create Trybe"}
        </Button>
      </div>
    </div>
  );
};

export default TrybeForm;
