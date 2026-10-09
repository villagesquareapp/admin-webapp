"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge, Button, Label, Modal, Tabs, TextInput, Textarea, ToggleSwitch } from "flowbite-react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import {
  addDepartmentAlias,
  addDepartments,
  createDepartment,
  getDepartments,
  updateDepartment,
} from "@/app/api/trybeCampus";
import PostSearch from "../../posts/PostSearch";
import { FilterBar, INSTITUTION_KINDS, KindChips, KindPicker, splitList } from "../campusUi";

const TABS = ["list", "unmatched"] as const;

type Draft = {
  uuid?: string;
  name: string;
  field: string;
  aliases: string;
  applies_to: InstitutionKind[];
  is_active: boolean;
};

const linkedNote = (n?: number) => (n ? ` · linked ${n} ${n === 1 ? "request" : "requests"}` : "");

const DepartmentModal = ({
  draft,
  fields,
  onClose,
}: {
  draft: Draft | null;
  fields: string[];
  onClose: () => void;
}) => {
  const [v, setV] = useState<Draft | null>(draft);
  const [busy, setBusy] = useState(false);
  useEffect(() => setV(draft), [draft]);

  const save = async () => {
    if (!v) return;
    const body = {
      name: v.name.trim(),
      field: v.field.trim() || (v.uuid ? null : undefined),
      aliases: splitList(v.aliases, /[,\n]/),
      applies_to: v.applies_to,
      ...(v.uuid ? { is_active: v.is_active } : {}),
    };
    setBusy(true);
    try {
      const res = v.uuid ? await updateDepartment(v.uuid, body) : await createDepartment(body);
      if (res?.status) {
        toast.success(`${v.uuid ? "Department updated" : "Department added"}${linkedNote(res.data?.linked_requests)}`);
        onClose();
      } else toast.error(res?.message || "Couldn't save the department");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={!!v} onClose={() => !busy && onClose()} size="lg">
      <Modal.Header>{v?.uuid ? "Edit department" : "Add a department"}</Modal.Header>
      <Modal.Body>
        {v && (
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="dept-name" value="Name" />
              <TextInput id="dept-name" value={v.name} maxLength={150} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="Computer Science" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="dept-field" value="Field" />
              <TextInput id="dept-field" list="dept-fields" value={v.field} maxLength={60} onChange={(e) => setV({ ...v, field: e.target.value })} placeholder="Computing" className="mt-1" />
              <datalist id="dept-fields">
                {fields.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="dept-aliases" value="Other spellings students type (comma or one per line)" />
              <Textarea id="dept-aliases" rows={3} value={v.aliases} onChange={(e) => setV({ ...v, aliases: e.target.value })} placeholder="CSC, Comp Sci" className="mt-1" />
              <p className="text-xs text-darklink mt-1">Each spelling can belong to one department only.</p>
            </div>
            <div>
              <Label value="Taught at (for pickers; never used to turn an answer down)" />
              <div className="mt-2">
                <KindPicker value={v.applies_to} onChange={(applies_to) => setV({ ...v, applies_to })} />
              </div>
            </div>
            {v.uuid && (
              <ToggleSwitch
                checked={v.is_active}
                label="Active (a disabled department links no new answers)"
                onChange={(is_active) => setV({ ...v, is_active })}
              />
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button color="primary" onClick={save} isProcessing={busy} disabled={busy || !v || v.name.trim().length < 2}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const PasteModal = ({ show, fields, onClose }: { show: boolean; fields: string[]; onClose: () => void }) => {
  const [names, setNames] = useState("");
  const [field, setField] = useState("");
  const [kinds, setKinds] = useState<InstitutionKind[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setSkipped([]);
    onClose();
  };

  const save = async () => {
    setBusy(true);
    try {
      const res = await addDepartments({
        names: splitList(names, /\n/),
        field: field.trim() || undefined,
        applies_to: kinds,
      });
      if (res?.status && res.data) {
        toast.success(`Added ${res.data.created.length}${linkedNote(res.data.linked_requests)}`);
        setSkipped(res.data.skipped);
        setNames("");
        if (!res.data.skipped.length) close();
      } else toast.error(res?.message || "Couldn't add the departments");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={show} onClose={() => !busy && close()} size="lg">
      <Modal.Header>Paste a list of departments</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="paste-names" value="One department per line" />
            <Textarea id="paste-names" rows={8} value={names} onChange={(e) => setNames(e.target.value)} className="mt-1" />
            <p className="text-xs text-darklink mt-1">Names already on the list (or one of its spellings) are skipped.</p>
          </div>
          <div>
            <Label htmlFor="paste-field" value="Field for all of them (optional)" />
            <TextInput id="paste-field" list="paste-fields" value={field} maxLength={60} onChange={(e) => setField(e.target.value)} className="mt-1" />
            <datalist id="paste-fields">
              {fields.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>
          <div>
            <Label value="Taught at (optional)" />
            <div className="mt-2">
              <KindPicker value={kinds} onChange={setKinds} />
            </div>
          </div>
          {skipped.length > 0 && (
            <div className="rounded-lg bg-lightwarning text-warning text-sm p-3">
              Already on the list, skipped: {skipped.join(", ")}
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={close} disabled={busy}>
          Close
        </Button>
        <Button color="primary" onClick={save} isProcessing={busy} disabled={busy || !names.trim()}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Keeps a typed answer as another spelling of a department on the list.
const AliasModal = ({ answer, onClose }: { answer: IUnmatchedDepartment | null; onClose: () => void }) => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<IDepartment[]>([]);
  const [busy, setBusy] = useState(false);
  const find = useDebouncedCallback(async (term: string) => {
    const res = await getDepartments(1, 8, { search: term || undefined, active: "true" });
    setOptions(res?.data?.data || []);
  }, 300);
  useEffect(() => {
    if (answer) find(search);
  }, [answer, search, find]);
  useEffect(() => setSearch(""), [answer]);

  const add = async (department: IDepartment) => {
    if (!answer) return;
    setBusy(true);
    try {
      const res = await addDepartmentAlias(department.uuid, answer.answer);
      if (res?.status) {
        toast.success(`"${answer.answer}" is now a spelling of ${department.name}${linkedNote(res.data?.linked_requests)}`);
        onClose();
      } else toast.error(res?.message || "Couldn't add the spelling");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={!!answer} onClose={() => !busy && onClose()} size="lg">
      <Modal.Header>Which department is &ldquo;{answer?.answer}&rdquo;?</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-3">
          <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..." autoFocus />
          <div className="flex flex-col divide-y divide-border dark:divide-darkborder max-h-80 overflow-y-auto">
            {options.length === 0 && <p className="text-sm text-darklink py-4 text-center">No departments found.</p>}
            {options.map((d) => (
              <div key={d.uuid} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-darklink truncate">{[d.field, ...d.aliases].filter(Boolean).join(" · ")}</p>
                </div>
                <Button size="xs" color="primary" onClick={() => add(d)} disabled={busy}>
                  Choose
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const DepartmentsContent = ({
  tab,
  departments,
  unmatched,
  unmatchedTotal,
  fields,
  total,
  totalPages,
  page,
  limit,
}: {
  tab: (typeof TABS)[number];
  departments: IDepartment[];
  unmatched: IUnmatchedDepartment[];
  unmatchedTotal: number;
  fields: string[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pasting, setPasting] = useState(false);
  const [aliasFor, setAliasFor] = useState<IUnmatchedDepartment | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const filtered = searchParams.get("institution_id") || searchParams.get("trybe_id");

  const changeTab = (index: number) => {
    const params = new URLSearchParams();
    if (index > 0) params.set("tab", TABS[index]);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const toggle = async (d: IDepartment) => {
    const res = await updateDepartment(d.uuid, { is_active: !d.is_active });
    if (res?.status) toast.success(`${d.name} ${d.is_active ? "disabled" : "enabled"}`);
    else toast.error(res?.message || "Couldn't update the department");
  };

  const addSuggested = async (row: IUnmatchedDepartment, suggestion: { uuid: string; name: string }) => {
    setBusy(row.key);
    try {
      const res = await addDepartmentAlias(suggestion.uuid, row.answer);
      if (res?.status) toast.success(`"${row.answer}" is now a spelling of ${suggestion.name}${linkedNote(res.data?.linked_requests)}`);
      else toast.error(res?.message || "Couldn't add the spelling");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const col = createColumnHelper<IDepartment>();
  const listColumns = [
    col.accessor("name", {
      header: () => <span>Department</span>,
      cell: (info) => (
        <div className="min-w-0">
          <p className="text-sm font-medium">{info.getValue()}</p>
          <p className="text-xs text-darklink">{info.row.original.field || "—"}</p>
        </div>
      ),
    }),
    col.accessor("aliases", {
      header: () => <span>Other spellings</span>,
      cell: (info) => {
        const aliases = info.getValue();
        return aliases.length ? (
          <div className="flex flex-wrap gap-1 max-w-[260px]">
            {aliases.slice(0, 4).map((a) => (
              <span key={a} className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs">
                {a}
              </span>
            ))}
            {aliases.length > 4 && <span className="text-xs text-darklink">+{aliases.length - 4}</span>}
          </div>
        ) : (
          <span className="text-xs text-darklink">—</span>
        );
      },
    }),
    col.accessor("applies_to", {
      header: () => <span>Taught at</span>,
      cell: (info) => <div className="max-w-[260px]"><KindChips kinds={info.getValue()} /></div>,
    }),
    col.accessor("request_count", {
      header: () => <span>Requests</span>,
      cell: (i) => <span className="text-sm tabular-nums">{Number(i.getValue() || 0).toLocaleString()}</span>,
    }),
    col.accessor("is_active", {
      header: () => <span>Active</span>,
      cell: (info) => <ToggleSwitch checked={info.getValue()} onChange={() => toggle(info.row.original)} />,
    }),
    col.display({
      id: "edit",
      header: () => <span />,
      cell: (info) => {
        const d = info.row.original;
        return (
          <Button
            size="xs"
            color="light"
            onClick={() =>
              setDraft({
                uuid: d.uuid,
                name: d.name,
                field: d.field ?? "",
                aliases: d.aliases.join(", "),
                applies_to: d.applies_to,
                is_active: d.is_active,
              })
            }
          >
            Edit
          </Button>
        );
      },
    }),
  ];

  const ucol = createColumnHelper<IUnmatchedDepartment>();
  const unmatchedColumns = [
    ucol.accessor("answer", {
      header: () => <span>What students typed</span>,
      cell: (info) => <p className="text-sm font-medium">{info.getValue()}</p>,
    }),
    ucol.accessor("requests", {
      header: () => <span>Requests</span>,
      cell: (info) => (
        <span className="text-sm tabular-nums">
          {info.getValue()}
          {info.row.original.trybes > 1 && <span className="text-xs text-darklink"> in {info.row.original.trybes} Trybes</span>}
        </span>
      ),
    }),
    ucol.accessor("last_seen_at", {
      header: () => <span>Last typed</span>,
      cell: (i) => <span className="text-sm text-darklink">{formatDate(i.getValue())}</span>,
    }),
    ucol.display({
      id: "actions",
      header: () => <span>Fix it</span>,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex flex-wrap gap-2">
            {row.suggestions.map((s) => (
              <Button key={s.uuid} size="xs" color="primary" onClick={() => addSuggested(row, s)} disabled={busy === row.key}>
                Spelling of {s.name}
              </Button>
            ))}
            <Button size="xs" color="light" onClick={() => setAliasFor(row)} disabled={busy === row.key}>
              {row.suggestions.length ? "Another department…" : "Spelling of…"}
            </Button>
            <Button
              size="xs"
              color="light"
              onClick={() => setDraft({ name: row.answer, field: "", aliases: "", applies_to: [], is_active: true })}
              disabled={busy === row.key}
            >
              Add to the list
            </Button>
          </div>
        );
      },
    }),
  ];

  return (
    <>
      <Tabs aria-label="Departments" variant="underline" onActiveTabChange={changeTab}>
        <Tabs.Item active={tab === "list"} title="All departments" icon={() => <Icon icon="solar:list-check-line-duotone" height={18} className="me-2" />}>
          {tab === "list" && (
            <div className="flex flex-col gap-4">
              <FilterBar
                filters={[
                  { key: "field", options: [{ value: "", label: "Any field" }, ...fields.map((f) => ({ value: f, label: f }))] },
                  { key: "kind", options: [{ value: "", label: "Taught anywhere" }, ...INSTITUTION_KINDS.map((k) => ({ value: k.value, label: `Taught at: ${k.label}` }))] },
                  {
                    key: "active",
                    options: [
                      { value: "", label: "Active or disabled" },
                      { value: "true", label: "Active" },
                      { value: "false", label: "Disabled" },
                    ],
                  },
                ]}
              />
              <ReusableTable
                tableData={departments}
                columns={listColumns}
                totalPages={totalPages}
                currentPage={page}
                pageSize={limit}
                dense
                compactTitle
                tableTitle={`${total.toLocaleString()} departments`}
                extraButtons={
                  <div className="flex gap-2">
                    <PostSearch placeholder="Name or spelling..." />
                    <Button color="light" onClick={() => setPasting(true)}>
                      Paste a list
                    </Button>
                    <Button
                      color="primary"
                      onClick={() => setDraft({ name: "", field: "", aliases: "", applies_to: [], is_active: true })}
                    >
                      Add department
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </Tabs.Item>
        <Tabs.Item
          active={tab === "unmatched"}
          title={
            <span className="flex items-center gap-2">
              Unmatched answers
              {unmatchedTotal > 0 && <Badge color="warning">{unmatchedTotal}</Badge>}
            </span>
          }
          icon={() => <Icon icon="solar:question-square-line-duotone" height={18} className="me-2" />}
        >
          {tab === "unmatched" && (
            <div className="flex flex-col gap-4">
              {filtered && (
                <div className="flex items-center justify-between rounded-lg bg-lightinfo text-info text-sm px-3 py-2">
                  <span>Showing answers from one {searchParams.get("institution_id") ? "institution" : "Trybe"} only.</span>
                  <button className="font-semibold" onClick={() => router.replace("?tab=unmatched", { scroll: false })}>
                    Show all
                  </button>
                </div>
              )}
              <ReusableTable
                tableData={unmatched}
                columns={unmatchedColumns}
                totalPages={totalPages}
                currentPage={page}
                pageSize={limit}
                dense
                compactTitle
                tableTitle={`${total.toLocaleString()} typed ${total === 1 ? "answer matches" : "answers match"} no department`}
                extraButtons={<PostSearch placeholder="Search typed answers..." />}
              />
            </div>
          )}
        </Tabs.Item>
      </Tabs>

      <DepartmentModal draft={draft} fields={fields} onClose={() => setDraft(null)} />
      <PasteModal show={pasting} fields={fields} onClose={() => setPasting(false)} />
      <AliasModal answer={aliasFor} onClose={() => setAliasFor(null)} />
    </>
  );
};

export default DepartmentsContent;
