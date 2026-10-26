"use client";

import { useState } from "react";
import { Label, Select, TextInput, ToggleSwitch, Spinner, HelperText } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { toast } from "sonner";
import { createInstitution, updateInstitution } from "@/app/api/trybeCampus";
import { INSTITUTION_KINDS, NIGERIAN_STATES, OWNERSHIP, REGULATORS, splitList } from "../campusUi";

const text = (value?: string | number | null) => (value === null || value === undefined ? "" : String(value));

// Create or edit an institution. On edit, an emptied field is cleared.
const InstitutionForm = ({
  institution,
  onSaved,
}: {
  institution?: IInstitutionDetail;
  onSaved?: (saved: IInstitutionDetail) => void;
}) => {
  const [v, setV] = useState({
    name: text(institution?.name),
    short_name: text(institution?.short_name),
    kind: institution?.kind ?? "university",
    ownership: text(institution?.ownership),
    country: institution?.country ?? "Nigeria",
    state: text(institution?.state),
    city: text(institution?.city),
    lga: text(institution?.lga),
    address: text(institution?.address),
    website: text(institution?.website),
    year_founded: text(institution?.year_founded),
    email_domains: (institution?.email_domains ?? []).join(", "),
    matric_example: text(institution?.matric_example),
    matric_pattern: text(institution?.matric_pattern),
    regulator: text(institution?.regulator),
    is_active: institution?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const set = (field: keyof typeof v) => (value: string | boolean) => setV({ ...v, [field]: value });
  const inNigeria = v.country.trim().toLowerCase() === "nigeria";

  const save = async () => {
    const empty = institution ? null : undefined;
    const optional = (value: string) => value.trim() || empty;
    const body: Record<string, unknown> = {
      name: v.name.trim(),
      kind: v.kind,
      short_name: optional(v.short_name),
      ownership: optional(v.ownership),
      country: v.country.trim() || "Nigeria",
      state: optional(v.state),
      city: optional(v.city),
      lga: optional(v.lga),
      address: optional(v.address),
      website: optional(v.website),
      year_founded: v.year_founded.trim() ? Number(v.year_founded) : empty,
      email_domains: splitList(v.email_domains.toLowerCase()),
      matric_example: optional(v.matric_example),
      matric_pattern: optional(v.matric_pattern),
      regulator: optional(v.regulator),
      is_active: v.is_active,
    };
    setSaving(true);
    try {
      const res = institution ? await updateInstitution(institution.uuid, body) : await createInstitution(body);
      if (res?.status && res.data) {
        toast.success(institution ? "Institution updated" : "Institution added");
        onSaved?.(res.data);
      } else toast.error(res?.message || "Couldn't save the institution");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="inst-name">Name</Label>
          <TextInput id="inst-name" value={v.name} maxLength={200} onChange={(e) => set("name")(e.target.value)} placeholder="University of Lagos" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="inst-short">Short name</Label>
          <TextInput id="inst-short" value={v.short_name} maxLength={30} onChange={(e) => set("short_name")(e.target.value)} placeholder="UNILAG" className="mt-1" />
          <HelperText>Students can search for it</HelperText>
        </div>
        <div>
          <Label htmlFor="inst-kind">Kind</Label>
          <Select id="inst-kind" value={v.kind} onChange={(e) => set("kind")(e.target.value)} className="mt-1">
            {INSTITUTION_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </Select>
          <HelperText>Decides the levels its Trybe offers</HelperText>
        </div>
        <div>
          <Label htmlFor="inst-owner">Ownership</Label>
          <Select id="inst-owner" value={v.ownership} onChange={(e) => set("ownership")(e.target.value)} className="mt-1">
            <option value="">Not known</option>
            {OWNERSHIP.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="inst-regulator">Listed by</Label>
          <Select id="inst-regulator" value={v.regulator} onChange={(e) => set("regulator")(e.target.value)} className="mt-1">
            <option value="">—</option>
            {REGULATORS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="inst-country">Country</Label>
          <TextInput id="inst-country" value={v.country} maxLength={100} onChange={(e) => set("country")(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="inst-state">State</Label>
          {inNigeria ? (
            <Select id="inst-state" value={v.state} onChange={(e) => set("state")(e.target.value)} className="mt-1">
              <option value="">Not known</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          ) : (
            <TextInput id="inst-state" value={v.state} maxLength={40} onChange={(e) => set("state")(e.target.value)} className="mt-1" />
          )}
        </div>
        <div>
          <Label htmlFor="inst-city">Town or city</Label>
          <TextInput id="inst-city" value={v.city} maxLength={100} onChange={(e) => set("city")(e.target.value)} placeholder="Akoka" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="inst-lga">LGA</Label>
          <TextInput id="inst-lga" value={v.lga} maxLength={100} onChange={(e) => set("lga")(e.target.value)} className="mt-1" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="inst-address">Address</Label>
          <TextInput id="inst-address" value={v.address} maxLength={300} onChange={(e) => set("address")(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="inst-website">Website</Label>
          <TextInput id="inst-website" value={v.website} maxLength={300} onChange={(e) => set("website")(e.target.value)} placeholder="https://unilag.edu.ng" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="inst-year">Year founded</Label>
          <TextInput id="inst-year" type="number" value={v.year_founded} onChange={(e) => set("year_founded")(e.target.value)} className="mt-1" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="inst-domains">School email domains (comma separated)</Label>
          <TextInput id="inst-domains" value={v.email_domains} onChange={(e) => set("email_domains")(e.target.value)} placeholder="unilag.edu.ng, live.unilag.edu.ng" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="inst-matric-example">Matric number example</Label>
          <TextInput id="inst-matric-example" value={v.matric_example} maxLength={40} onChange={(e) => set("matric_example")(e.target.value)} placeholder="190401023" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="inst-matric-pattern">Matric number pattern</Label>
          <TextInput
            id="inst-matric-pattern"
            value={v.matric_pattern}
            maxLength={200}
            onChange={(e) => set("matric_pattern")(e.target.value)}
            placeholder="^\d{9}$"
            className="mt-1"
          />
          <HelperText>A regular expression. Numbers that don&apos;t fit are only flagged to reviewers.</HelperText>
        </div>
      </div>
      {institution && (
        <ToggleSwitch
          checked={v.is_active}
          label="Active (shown in pickers; a disabled institution keeps its Trybe)"
          onChange={(value) => set("is_active")(value)}
        />
      )}
      <div className="flex justify-end">
        <Button color="primary" onClick={save} disabled={saving || v.name.trim().length < 2}>
          {saving && <Spinner size="sm" light />}
          {institution ? "Save changes" : "Add institution"}
        </Button>
      </div>
    </div>
  );
};

export default InstitutionForm;
