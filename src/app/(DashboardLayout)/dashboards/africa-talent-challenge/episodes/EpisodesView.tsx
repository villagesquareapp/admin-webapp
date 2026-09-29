"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Button, Dropdown, Label, TextInput, Textarea, Select } from "flowbite-react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { createATCEpisode, updateATCEpisode, deleteATCEpisode } from "@/app/api/atc";

const EP_STATUS_TONE: Record<string, string> = {
  draft: "bg-lightgray dark:bg-dark text-darklink",
  active: "bg-lightsuccess text-success",
  completed: "bg-lightinfo text-info",
  cancelled: "bg-lighterror text-error",
};
const STATUSES: ATCEpisodeStatus[] = ["draft", "active", "completed", "cancelled"];
const dayInput = (d?: string) => (d ? d.slice(0, 10) : "");

const EpisodesView = ({
  episodes, totalPages, currentPage, pageSize,
}: { episodes: IATCEpisode[]; totalPages: number; currentPage: number; pageSize: number }) => {
  const router = useRouter();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; ep?: IATCEpisode } | null>(null);
  const [form, setForm] = useState({ name: "", description: "", start_date: "", end_date: "", status: "draft" as ATCEpisodeStatus });
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setForm({ name: "", description: "", start_date: "", end_date: "", status: "draft" }); setModal({ mode: "create" }); };
  const openEdit = (ep: IATCEpisode) => {
    setForm({ name: ep.name, description: ep.description || "", start_date: dayInput(ep.start_date), end_date: dayInput(ep.end_date), status: ep.status });
    setModal({ mode: "edit", ep });
  };

  const save = async () => {
    if (!form.name || !form.start_date || !form.end_date) return toast.error("Name and dates are required");
    setSaving(true);
    const res = modal?.mode === "edit" && modal.ep
      ? await updateATCEpisode(modal.ep.uuid, form)
      : await createATCEpisode(form);
    if (res?.status) { toast.success(modal?.mode === "edit" ? "Episode updated" : "Episode created"); setModal(null); router.refresh(); }
    else toast.error(res?.message || "Save failed");
    setSaving(false);
  };

  const remove = async (ep: IATCEpisode) => {
    const res = await deleteATCEpisode(ep.uuid);
    if (res?.status) { toast.success("Episode deleted"); router.refresh(); }
    else toast.error(res?.message || "Delete failed");
  };

  const col = createColumnHelper<IATCEpisode>();
  const columns = [
    col.accessor("name", {
      header: () => <span>Episode</span>,
      cell: (i) => (
        <div className="min-w-0">
          <p className="text-sm font-medium truncate max-w-[220px]">{i.getValue()}</p>
          {i.row.original.winner_id && <span className="text-[11px] text-warning flex items-center gap-1">🏆 winner set</span>}
        </div>
      ),
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${EP_STATUS_TONE[i.getValue()] || ""}`}>{i.getValue()}</span>,
    }),
    col.display({
      id: "dates", header: () => <span>Window</span>,
      cell: (info) => {
        const e = info.row.original;
        return <span className="text-sm text-darklink">{formatDate(e.start_date)} → {formatDate(e.end_date)}</span>;
      },
    }),
    col.display({
      id: "actions", header: () => <span></span>,
      cell: (info) => {
        const e = info.row.original;
        return (
          <div className="flex justify-end" onClick={(ev) => ev.stopPropagation()}>
            <Dropdown label="" inline dismissOnClick renderTrigger={() => (
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><HiOutlineDotsVertical /></button>
            )}>
              <Dropdown.Item onClick={() => openEdit(e)}>Edit</Dropdown.Item>
              <Dropdown.Item onClick={() => remove(e)}>Delete</Dropdown.Item>
            </Dropdown>
          </div>
        );
      },
    }),
  ];

  return (
    <>
      <ReusableTable
        tableData={Array.isArray(episodes) ? episodes : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        dense
        compactTitle
        tableTitle="Episodes"
        backTo="/dashboards/africa-talent-challenge"
        extraButtons={<Button color="primary" size="sm" className="h-10" onClick={openCreate}><FaPlus size={12} className="mr-1.5" /> New episode</Button>}
      />

      <Dialog open={!!modal} onClose={() => setModal(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg p-6 bg-white dark:bg-darkgray rounded-xl shadow-lg">
            <h5 className="text-base font-semibold mb-4">{modal?.mode === "edit" ? "Edit episode" : "New episode"}</h5>
            <div className="flex flex-col gap-3">
              <div>
                <Label htmlFor="ep-name" value="Name" />
                <TextInput id="ep-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Season 1 — Episode 3" />
              </div>
              <div>
                <Label htmlFor="ep-desc" value="Description" />
                <Textarea id="ep-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ep-start" value="Start date" />
                  <TextInput id="ep-start" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="ep-end" value="End date" />
                  <TextInput id="ep-end" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="ep-status" value="Status" />
                <Select id="ep-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ATCEpisodeStatus })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button color="gray" onClick={() => setModal(null)}>Cancel</Button>
              <Button color="primary" onClick={save} isProcessing={saving} disabled={saving}>{modal?.mode === "edit" ? "Save" : "Create"}</Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default EpisodesView;
