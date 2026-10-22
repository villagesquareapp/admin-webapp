"use client";

import { Icon } from "@iconify/react";
import { Checkbox, Select } from "flowbite-react";
import { useRouter, useSearchParams } from "next/navigation";

export const INSTITUTION_KINDS: { value: InstitutionKind; label: string }[] = [
  { value: "university", label: "University" },
  { value: "polytechnic", label: "Polytechnic" },
  { value: "college_of_education", label: "College of education" },
  { value: "college_of_health", label: "College of health" },
  { value: "college_of_nursing", label: "College of nursing" },
  { value: "monotechnic", label: "Monotechnic" },
  { value: "other", label: "Other" },
];

export const kindLabel = (kind?: string | null) => INSTITUTION_KINDS.find((k) => k.value === kind)?.label ?? kind ?? "—";

export const OWNERSHIP = [
  { value: "federal", label: "Federal" },
  { value: "state", label: "State" },
  { value: "private", label: "Private" },
];

export const REGULATORS = ["NUC", "NBTE", "NCCE", "NMCN"];

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

// Level groups, in the order levels usually run.
export const LEVEL_GROUPS = [
  "foundation",
  "undergraduate",
  "national_diploma",
  "nce",
  "nursing",
  "diploma",
  "postgraduate",
  "other",
];

export const KindChips = ({ kinds }: { kinds: string[] }) =>
  kinds.length ? (
    <div className="flex flex-wrap gap-1">
      {kinds.map((k) => (
        <span key={k} className="rounded-full bg-lightprimary text-primary px-2 py-0.5 text-[11px] font-medium whitespace-nowrap">
          {kindLabel(k)}
        </span>
      ))}
    </div>
  ) : (
    <span className="text-xs text-darklink">—</span>
  );

export const InstitutionLogo = ({ src, size = 40 }: { src?: string | null; size?: number }) =>
  src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" style={{ width: size, height: size }} className="rounded-lg object-contain bg-white shrink-0" />
  ) : (
    <span style={{ width: size, height: size }} className="rounded-lg grid place-items-center bg-lightinfo text-info shrink-0">
      <Icon icon="solar:buildings-2-bold" height={size / 2} />
    </span>
  );

// Checkboxes for the kinds of institution something applies to.
export const KindPicker = ({ value, onChange }: { value: string[]; onChange: (kinds: InstitutionKind[]) => void }) => (
  <div className="grid grid-cols-2 gap-2">
    {INSTITUTION_KINDS.map((k) => (
      <label key={k.value} className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={value.includes(k.value)}
          onChange={(e) =>
            onChange(
              (e.target.checked ? [...value, k.value] : value.filter((v) => v !== k.value)) as InstitutionKind[]
            )
          }
        />
        {k.label}
      </label>
    ))}
  </div>
);

// Comma-separated text to a clean list.
export const splitList = (text: string, sep: RegExp = /,/) =>
  text
    .split(sep)
    .map((s) => s.trim().replace(/\s+/g, " "))
    .filter(Boolean);

// A wrapping row of filters kept in the URL (page goes back to 1).
export const FilterBar = ({
  filters,
}: {
  filters: { key: string; options: { value: string; label: string }[] }[];
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const change = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <Select
          key={f.key}
          sizing="sm"
          value={searchParams.get(f.key) || ""}
          onChange={(e) => change(f.key, e.target.value)}
          className="min-w-[170px]"
        >
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      ))}
    </div>
  );
};
