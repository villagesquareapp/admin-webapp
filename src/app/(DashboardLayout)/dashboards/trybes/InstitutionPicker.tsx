"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TextInput } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { HiOutlineSearch } from "react-icons/hi";
import { useDebouncedCallback } from "use-debounce";
import { getInstitutions } from "@/app/api/trybeCampus";
import { InstitutionLogo, kindLabel } from "./campusUi";

const describe = (i: { kind: string; state: string | null }) => [kindLabel(i.kind), i.state].filter(Boolean).join(" · ");

// Picks the institution a Campus Trybe belongs to. Institutions that already
// have another Trybe can't be picked (one Trybe each).
const InstitutionPicker = ({
  value,
  trybeId,
  onChange,
}: {
  value: ITrybeInstitutionRef | null;
  trybeId?: string;
  onChange: (institution: ITrybeInstitutionRef | null) => void;
}) => {
  const [picking, setPicking] = useState(!value);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<IInstitution[]>([]);
  const [loading, setLoading] = useState(false);

  const find = useDebouncedCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getInstitutions(1, 8, { search: term.trim(), active: "true" });
      setOptions(res?.data?.data || []);
    } finally {
      setLoading(false);
    }
  }, 300);
  useEffect(() => {
    if (picking) find(search);
  }, [picking, search, find]);

  if (value && !picking) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border dark:border-darkborder p-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <InstitutionLogo src={value.logo} size={36} />
          <div className="min-w-0">
            <Link href={`/dashboards/trybes/institutions/${value.uuid}`} className="text-sm font-medium hover:text-primary truncate block">
              {value.name}
              {value.short_name && <span className="text-darklink"> ({value.short_name})</span>}
            </Link>
            <p className="text-xs text-darklink">{describe(value)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="xs" color="light" onClick={() => setPicking(true)}>
            Change
          </Button>
          {trybeId && (
            <Button size="xs" color="light" onClick={() => onChange(null)}>
              Unlink
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <TextInput
        icon={HiOutlineSearch}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or short name (UNILAG, YABATECH)..."
        autoFocus={!!value}
      />
      {search.trim().length >= 2 && (
        <div className="flex flex-col rounded-lg border border-border dark:border-darkborder divide-y divide-border dark:divide-darkborder max-h-72 overflow-y-auto">
          {!loading && options.length === 0 && (
            <p className="text-sm text-darklink p-3">
              No active institution found.{" "}
              <Link href="/dashboards/trybes/institutions" className="text-primary font-semibold">
                Add it under Institutions
              </Link>
              .
            </p>
          )}
          {options.map((i) => {
            const taken = !!i.trybe && i.trybe.uuid !== trybeId;
            return (
              <button
                key={i.uuid}
                type="button"
                disabled={taken}
                onClick={() => {
                  onChange({
                    uuid: i.uuid,
                    name: i.name,
                    short_name: i.short_name,
                    kind: i.kind,
                    state: i.state,
                    logo: i.logo,
                    is_active: i.is_active,
                  });
                  setPicking(false);
                  setSearch("");
                }}
                className="flex items-center gap-3 p-2.5 text-left hover:bg-lightprimary disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <InstitutionLogo src={i.logo} size={32} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {i.name}
                    {i.short_name && <span className="text-darklink"> ({i.short_name})</span>}
                  </p>
                  <p className="text-xs text-darklink">
                    {describe(i)}
                    {taken && ` · already has ${i.trybe?.name}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {value && (
        <Button size="xs" color="light" className="w-fit" onClick={() => setPicking(false)}>
          Keep {value.short_name ?? value.name}
        </Button>
      )}
    </div>
  );
};

export default InstitutionPicker;
