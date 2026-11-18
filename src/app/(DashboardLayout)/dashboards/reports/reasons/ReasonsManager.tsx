"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Modal, ModalBody, ModalFooter, ModalHeader, Select, Spinner, ToggleSwitch } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { deleteReportReason, reorderReportReasons, updateReportReason } from "@/app/api/report";
import ReasonForm from "./ReasonForm";
import { SURFACES, appOrder, surfaceLabel } from "./reasonsUi";

const ReasonsManager = ({ reasons }: { reasons: IReportReason[] }) => {
  const router = useRouter();
  const [list, setList] = useState("");
  const [preview, setPreview] = useState("post");
  const [editing, setEditing] = useState<IReportReason | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<IReportReason | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const inList = (value: string) =>
    reasons
      .filter((r) => (r.service_type ?? "") === value)
      .sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at));
  const rows = inList(list);
  const counts = useMemo(
    () => Object.fromEntries(SURFACES.map((s) => [s.value, reasons.filter((r) => (r.service_type ?? "") === s.value).length])),
    [reasons],
  );
  const shown = appOrder(reasons, preview);

  const run = async (key: string, fn: () => Promise<{ status: boolean; message?: string } | null>, done: string) => {
    setBusy(key);
    try {
      const res = await fn();
      if (res?.status) {
        toast.success(done);
        router.refresh();
      } else {
        toast.error(res?.message || "Something went wrong");
      }
      return res;
    } finally {
      setBusy(null);
    }
  };

  const move = (index: number, by: -1 | 1) => {
    const ids = rows.map((r) => r.uuid);
    const to = index + by;
    if (to < 0 || to >= ids.length) return;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    run(`move-${rows[index].uuid}`, () => reorderReportReasons(ids), "Order saved");
  };

  const toggle = (r: IReportReason, on: boolean) =>
    run(`toggle-${r.uuid}`, () => updateReportReason(r.uuid, { is_active: on }), on ? "Shown in the app" : "Hidden in the app");

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(`delete-${deleting.uuid}`);
    try {
      const res = await deleteReportReason(deleting.uuid);
      if (res?.status) {
        toast.success("Reason deleted");
        setDeleting(null);
        router.refresh();
      } else {
        setDeleteError(res?.message || "Couldn't delete the reason");
      }
    } finally {
      setBusy(null);
    }
  };

  const turnOffInstead = async () => {
    if (!deleting) return;
    const res = await run(`toggle-${deleting.uuid}`, () => updateReportReason(deleting.uuid, { is_active: false }), "Hidden in the app");
    if (res?.status) setDeleting(null);
  };

  return (
    <div className="grid grid-cols-12 gap-30">
      <div className="col-span-12 lg:col-span-8">
        <CardBox>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              {SURFACES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setList(s.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                    list === s.value
                      ? "bg-primary text-white border-primary"
                      : "border-ld text-darklink hover:bg-lightgray dark:hover:bg-white/5"
                  }`}
                >
                  {s.label}
                  <span className="ms-1.5 opacity-75">{counts[s.value] ?? 0}</span>
                </button>
              ))}
            </div>
            <Button
              color="primary"
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Icon icon="solar:add-circle-linear" height={16} className="me-1" />
              Add reason
            </Button>
          </div>

          <p className="text-sm text-darklink mb-3">
            {list
              ? `Shown only when someone reports on ${surfaceLabel(list)}, mixed in with the All surfaces reasons by order.`
              : "Shown everywhere people can report something."}
          </p>

          {rows.length === 0 ? (
            <div className="py-12 text-center text-darklink">
              <Icon icon="solar:list-cross-linear" height={36} className="mx-auto mb-2" />
              <p className="text-sm">No reasons in this list yet.</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border dark:divide-darkborder">
              {rows.map((r, i) => (
                <li key={r.uuid} className="flex items-start gap-3 py-3">
                  <div className="flex flex-col shrink-0">
                    <button
                      aria-label="Move up"
                      disabled={i === 0 || !!busy}
                      onClick={() => move(i, -1)}
                      className="p-1 rounded text-darklink hover:bg-lightgray dark:hover:bg-white/5 disabled:opacity-30"
                    >
                      <Icon icon="solar:alt-arrow-up-linear" height={16} />
                    </button>
                    <button
                      aria-label="Move down"
                      disabled={i === rows.length - 1 || !!busy}
                      onClick={() => move(i, 1)}
                      className="p-1 rounded text-darklink hover:bg-lightgray dark:hover:bg-white/5 disabled:opacity-30"
                    >
                      <Icon icon="solar:alt-arrow-down-linear" height={16} />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm font-semibold ${r.is_active ? "" : "text-darklink line-through"}`}>{r.title}</p>
                      {!r.is_active && <Badge color="gray">Off</Badge>}
                      {r.open_reports_count > 0 && <Badge color="warning">{r.open_reports_count} open</Badge>}
                    </div>
                    {r.description && <p className="text-xs text-darklink mt-0.5">{r.description}</p>}
                    <p className="text-[11px] text-darklink mt-1">
                      Used by {r.reports_count.toLocaleString()} report{r.reports_count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="shrink-0">
                      <ToggleSwitch
                        checked={r.is_active}
                        disabled={!!busy}
                        onChange={(on) => toggle(r, on)}
                        aria-label={r.is_active ? "Hide in the app" : "Show in the app"}
                      />
                    </div>
                    <button
                      aria-label="Edit"
                      onClick={() => {
                        setEditing(r);
                        setFormOpen(true);
                      }}
                      className="p-1.5 rounded-md text-darklink hover:bg-lightgray dark:hover:bg-white/5"
                    >
                      <Icon icon="solar:pen-linear" height={17} />
                    </button>
                    <button
                      aria-label="Delete"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleting(r);
                      }}
                      className="p-1.5 rounded-md text-error hover:bg-lighterror"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" height={17} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBox>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <CardBox>
          <h5 className="font-semibold">What the app shows</h5>
          <p className="text-xs text-darklink mb-3">The report sheet for one surface, in order. Reasons that are off are left out.</p>
          <Select value={preview} onChange={(e) => setPreview(e.target.value)} className="mb-3">
            {SURFACES.filter((s) => s.value).map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <ol className="flex flex-col gap-2">
            {shown.map((r, i) => (
              <li key={r.uuid} className="flex gap-2 text-sm">
                <span className="text-darklink tabular-nums w-7 shrink-0 text-end">{i + 1}.</span>
                <span className="min-w-0">
                  {r.title}
                  {r.service_type && <span className="ms-1.5 text-[11px] text-primary">{surfaceLabel(r.service_type)} only</span>}
                </span>
              </li>
            ))}
            <li className="flex gap-2 text-sm text-darklink">
              <span className="tabular-nums w-7 shrink-0 text-end">{shown.length + 1}.</span>
              <span>Something Else (they describe it)</span>
            </li>
          </ol>
        </CardBox>
      </div>

      <ReasonForm
        open={formOpen}
        reason={editing}
        defaultSurface={list}
        onClose={() => setFormOpen(false)}
        onSaved={() => router.refresh()}
      />

      <Modal show={!!deleting} onClose={() => setDeleting(null)} size="md">
        <ModalHeader>Delete this reason?</ModalHeader>
        <ModalBody>
          <p className="text-sm">
            <span className="font-semibold">{deleting?.title}</span> will no longer be offered in the app.
          </p>
          {deleteError && (
            <div className="mt-3 rounded-lg bg-lightwarning text-warning text-sm p-3">{deleteError}</div>
          )}
        </ModalBody>
        <ModalFooter className="justify-end">
          <Button color="light" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          {deleteError ? (
            <Button color="warning" onClick={turnOffInstead} disabled={!!busy}>
              Turn it off instead
            </Button>
          ) : (
            <Button color="failure" onClick={confirmDelete} disabled={!!busy}>
              {busy?.startsWith("delete") && <Spinner size="sm" light className="me-2" />}
              Delete
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ReasonsManager;
