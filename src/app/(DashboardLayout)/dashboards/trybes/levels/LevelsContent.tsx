"use client";

import { useEffect, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Button, Label, Modal, Select, TextInput, ToggleSwitch } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { createLevel, reorderLevels, updateLevel } from "@/app/api/trybeCampus";
import { label } from "../trybeUi";
import { FilterBar, INSTITUTION_KINDS, KindChips, KindPicker, LEVEL_GROUPS } from "../campusUi";

type Draft = { uuid?: string; name: string; group: string; applies_to: InstitutionKind[]; is_active: boolean };

const LevelModal = ({ draft, onClose }: { draft: Draft | null; onClose: () => void }) => {
  const [v, setV] = useState<Draft | null>(draft);
  const [busy, setBusy] = useState(false);
  useEffect(() => setV(draft), [draft]);

  const save = async () => {
    if (!v) return;
    const body = {
      name: v.name.trim(),
      group: v.group,
      applies_to: v.applies_to,
      ...(v.uuid ? { is_active: v.is_active } : {}),
    };
    setBusy(true);
    try {
      const res = v.uuid ? await updateLevel(v.uuid, body) : await createLevel(body);
      if (res?.status) {
        toast.success(v.uuid ? "Level updated" : "Level added at the end");
        onClose();
      } else toast.error(res?.message || "Couldn't save the level");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={!!v} onClose={() => !busy && onClose()} size="lg">
      <Modal.Header>{v?.uuid ? "Edit level" : "Add a level"}</Modal.Header>
      <Modal.Body>
        {v && (
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="level-name" value="Name students pick" />
              <TextInput id="level-name" value={v.name} maxLength={30} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="100 lvl" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="level-group" value="Group" />
              <Select id="level-group" value={v.group} onChange={(e) => setV({ ...v, group: e.target.value })} className="mt-1">
                {Array.from(new Set([...LEVEL_GROUPS, v.group])).map((g) => (
                  <option key={g} value={g}>
                    {label(g)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label value="Offered at" />
              <div className="mt-2">
                <KindPicker value={v.applies_to} onChange={(applies_to) => setV({ ...v, applies_to })} />
              </div>
            </div>
            {v.uuid && (
              <ToggleSwitch checked={v.is_active} label="Active (offered in join forms)" onChange={(is_active) => setV({ ...v, is_active })} />
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button color="primary" onClick={save} isProcessing={busy} disabled={busy || !v || !v.name.trim()}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const LevelsContent = ({ levels, kind }: { levels: ILevel[]; kind?: string }) => {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [moving, setMoving] = useState(false);
  const col = createColumnHelper<ILevel>();

  // Reordering needs the whole list, so it's only offered unfiltered.
  const move = async (index: number, by: -1 | 1) => {
    const order = levels.map((l) => l.uuid);
    const target = index + by;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    setMoving(true);
    try {
      const res = await reorderLevels(order);
      if (!res?.status) toast.error(res?.message || "Couldn't reorder");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setMoving(false);
    }
  };

  const toggle = async (l: ILevel) => {
    const res = await updateLevel(l.uuid, { is_active: !l.is_active });
    if (res?.status) toast.success(`${l.name} ${l.is_active ? "turned off" : "turned on"}`);
    else toast.error(res?.message || "Couldn't update the level");
  };

  const columns = [
    ...(kind
      ? []
      : [
          col.display({
            id: "order",
            header: () => <span>Order</span>,
            cell: (info) => (
              <div className="flex gap-1">
                <Button size="xs" color="light" aria-label="Move up" disabled={moving || info.row.index === 0} onClick={() => move(info.row.index, -1)}>
                  <Icon icon="solar:alt-arrow-up-linear" height={14} />
                </Button>
                <Button size="xs" color="light" aria-label="Move down" disabled={moving || info.row.index === levels.length - 1} onClick={() => move(info.row.index, 1)}>
                  <Icon icon="solar:alt-arrow-down-linear" height={14} />
                </Button>
              </div>
            ),
          }),
        ]),
    col.accessor("name", {
      header: () => <span>Level</span>,
      cell: (info) => (
        <div>
          <p className="text-sm font-medium">{info.getValue()}</p>
          <p className="text-xs text-darklink">{label(info.row.original.group)}</p>
        </div>
      ),
    }),
    col.accessor("applies_to", {
      header: () => <span>Offered at</span>,
      cell: (info) => <div className="max-w-[320px]"><KindChips kinds={info.getValue()} /></div>,
    }),
    col.accessor("trybe_count", {
      header: () => <span>Trybes offering it</span>,
      cell: (i) => <span className="text-sm tabular-nums">{i.getValue() ?? 0}</span>,
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
        const l = info.row.original;
        return (
          <Button size="xs" color="light" onClick={() => setDraft({ uuid: l.uuid, name: l.name, group: l.group, applies_to: l.applies_to, is_active: l.is_active })}>
            Edit
          </Button>
        );
      },
    }),
  ];

  return (
    <>
      <FilterBar
        filters={[
          {
            key: "kind",
            options: [
              { value: "", label: "All levels (reorder here)" },
              ...INSTITUTION_KINDS.map((k) => ({ value: k.value, label: `Offered at: ${k.label}` })),
            ],
          },
        ]}
      />
      <ReusableTable
        tableData={levels}
        columns={columns}
        pageSize={100}
        dense
        compactTitle
        tableTitle={`${levels.length} levels`}
        extraButtons={
          <Button color="primary" onClick={() => setDraft({ name: "", group: "undergraduate", applies_to: [], is_active: true })}>
            Add level
          </Button>
        }
      />
      <LevelModal draft={draft} onClose={() => setDraft(null)} />
    </>
  );
};

export default LevelsContent;
