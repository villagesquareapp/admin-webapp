"use client";

import { useEffect, useState } from "react";
import { Label, Modal, ModalBody, ModalFooter, ModalHeader, Select, Spinner, Textarea, TextInput, ToggleSwitch } from "flowbite-react";
import { toast } from "sonner";
import { Button } from "@/app/components/shared/Button";
import { createReportReason, updateReportReason } from "@/app/api/report";
import { SURFACES } from "./reasonsUi";

// Adds a reason, or edits one (`reason` set). Moving a reason to another list
// puts it at the end of that list.
const ReasonForm = ({
  open,
  reason,
  defaultSurface,
  onClose,
  onSaved,
}: {
  open: boolean;
  reason: IReportReason | null;
  defaultSurface: string;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [surface, setSurface] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(reason?.title ?? "");
    setDescription(reason?.description ?? "");
    setSurface(reason ? (reason.service_type ?? "") : defaultSurface);
    setActive(reason?.is_active ?? true);
  }, [open, reason, defaultSurface]);

  const save = async () => {
    const t = title.trim();
    if (t.length < 3) return toast.error("Give it a title of at least 3 characters");
    setSaving(true);
    try {
      const input = {
        title: t,
        description: description.trim(),
        service_type: surface || null,
        is_active: active,
      };
      const res = reason ? await updateReportReason(reason.uuid, input) : await createReportReason(input);
      if (res?.status) {
        toast.success(reason ? "Reason updated" : "Reason added");
        onSaved();
        onClose();
      } else {
        toast.error(res?.message || "Couldn't save the reason");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="lg">
      <ModalHeader>{reason ? "Edit reason" : "Add a reason"}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="reason-title">Title</Label>
            <TextInput
              id="reason-title"
              value={title}
              maxLength={80}
              placeholder="e.g. Fraud and scam"
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-darklink mt-1">What people tap in the app&apos;s report sheet.</p>
          </div>
          <div>
            <Label htmlFor="reason-description">Description</Label>
            <Textarea
              id="reason-description"
              rows={3}
              value={description}
              maxLength={300}
              placeholder="A line that helps people pick the right reason"
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-xs text-darklink mt-1 text-end">{description.length}/300</p>
          </div>
          <div>
            <Label htmlFor="reason-surface">Shown on</Label>
            <Select id="reason-surface" value={surface} onChange={(e) => setSurface(e.target.value)}>
              {SURFACES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.value ? `${s.label} only` : "All surfaces"}
                </option>
              ))}
            </Select>
          </div>
          <ToggleSwitch checked={active} onChange={setActive} label={active ? "On: shown in the app" : "Off: hidden in the app"} />
        </div>
      </ModalBody>
      <ModalFooter className="justify-end">
        <Button color="light" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button color="primary" onClick={save} disabled={saving}>
          {saving && <Spinner size="sm" light className="me-2" />}
          {reason ? "Save" : "Add reason"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReasonForm;
