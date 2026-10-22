"use client";

import { useState } from "react";
import Link from "next/link";
import { createColumnHelper } from "@/utils/table";
import { Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Select, Textarea, TextInput, ToggleSwitch, Spinner, HelperText } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { createTrybeType, updateTrybeType } from "@/app/api/trybes";

const DOCUMENTS = [
  { value: "id_front", label: "ID front" },
  { value: "id_back", label: "ID back" },
  { value: "selfie", label: "Selfie" },
] as const;

type Draft = Pick<ITrybeType, "name" | "description" | "is_enabled" | "join_form" | "required_documents"> & {
  uuid?: string;
  poll_label: string;
};

const EMPTY: Draft = {
  name: "",
  description: "",
  is_enabled: false,
  join_form: "campus",
  required_documents: [],
  poll_label: "",
};

const TrybeTypesContent = ({ types }: { types: ITrybeType[] }) => {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const col = createColumnHelper<ITrybeType>();

  const save = async (value: Draft) => {
    setBusy(true);
    const body = {
      name: value.name.trim(),
      description: value.description?.trim() || undefined,
      is_enabled: value.is_enabled,
      join_form: value.join_form,
      required_documents: value.join_form === "campus" ? value.required_documents : [],
      poll_label: value.poll_label.trim(),
    };
    try {
      const res = value.uuid ? await updateTrybeType(value.uuid, body) : await createTrybeType(body);
      if (res?.status) {
        toast.success(value.uuid ? "Type updated" : "Type created");
        setDraft(null);
      } else toast.error(res?.message || "Couldn't save the type");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (t: ITrybeType) => {
    const res = await updateTrybeType(t.uuid, { is_enabled: !t.is_enabled });
    if (res?.status) toast.success(`${t.name} ${t.is_enabled ? "disabled" : "enabled"}`);
    else toast.error(res?.message || "Couldn't update the type");
  };

  const columns = [
    col.accessor("name", {
      header: () => <span>Type</span>,
      cell: (info) => (
        <div className="min-w-0">
          <p className="text-sm font-medium">{info.getValue()}</p>
          <p className="text-xs text-darklink truncate max-w-[280px]">{info.row.original.description}</p>
        </div>
      ),
    }),
    col.accessor("join_form", {
      header: () => <span>Joining</span>,
      cell: (info) => {
        const t = info.row.original;
        return (
          <span className="text-sm">
            {t.join_form === "campus"
              ? `Campus form${t.required_documents.length ? ` + ${t.required_documents.map((d) => DOCUMENTS.find((x) => x.value === d)?.label).join(", ")}` : ""}`
              : "Not open for requests"}
          </span>
        );
      },
    }),
    col.accessor("trybe_count", {
      header: () => <span>Trybes</span>,
      cell: (i) => <span className="text-sm tabular-nums">{i.getValue() ?? 0}</span>,
    }),
    col.accessor("is_enabled", {
      header: () => <span>Enabled</span>,
      cell: (info) => <ToggleSwitch checked={info.getValue()} onChange={() => toggle(info.row.original)} />,
    }),
    col.display({
      id: "edit",
      header: () => <span />,
      cell: (info) => {
        const t = info.row.original;
        return (
          <div className="flex gap-2">
            <Button size="xs" color="light" as={Link} href={`/dashboards/posts/categories?type=${t.uuid}`}>
              Post categories
            </Button>
            <Button
              size="xs"
              color="light"
              onClick={() => setDraft({ ...t, description: t.description ?? "", poll_label: t.poll_label ?? "" })}
            >
              Edit
            </Button>
          </div>
        );
      },
    }),
  ];

  return (
    <>
      <ReusableTable
        tableData={types}
        columns={columns}
        dense
        compactTitle
        tableTitle="Types"
        extraButtons={
          <Button color="primary" onClick={() => setDraft(EMPTY)}>
            New type
          </Button>
        }
      />

      <Modal show={!!draft} onClose={() => !busy && setDraft(null)} size="lg">
        <ModalHeader>{draft?.uuid ? "Edit type" : "New type"}</ModalHeader>
        <ModalBody>
          {draft && (
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="type-name">Name</Label>
                <TextInput id="type-name" value={draft.name} maxLength={60} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="type-description">Description</Label>
                <Textarea id="type-description" rows={2} maxLength={500} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="type-join">How people join</Label>
                <Select id="type-join" value={draft.join_form} onChange={(e) => setDraft({ ...draft, join_form: e.target.value as Draft["join_form"] })} className="mt-1">
                  <option value="campus">Request with the Campus form (name, matric no, department, level)</option>
                  <option value="none">Not open for requests (staff add people)</option>
                </Select>
              </div>
              {draft.join_form === "campus" && (
                <div className="flex flex-col gap-2">
                  <Label>Photos required with the request</Label>
                  {DOCUMENTS.map((d) => (
                    <label key={d.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={draft.required_documents.includes(d.value)}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            required_documents: e.target.checked
                              ? [...draft.required_documents, d.value]
                              : draft.required_documents.filter((x) => x !== d.value),
                          })
                        }
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              )}
              <div>
                <Label htmlFor="type-poll-label">What polls are called</Label>
                <TextInput
                  id="type-poll-label"
                  value={draft.poll_label}
                  maxLength={40}
                  placeholder="Poll"
                  onChange={(e) => setDraft({ ...draft, poll_label: e.target.value })}
                  className="mt-1"
                />
                <HelperText>Shown on the Highlights tab and in poll notifications, e.g. &quot;Campus Pulse&quot;. Empty means &quot;Poll&quot;.</HelperText>
              </div>
              <ToggleSwitch checked={draft.is_enabled} label="Enabled in the app" onChange={(v) => setDraft({ ...draft, is_enabled: v })} />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setDraft(null)} disabled={busy}>
            Cancel
          </Button>
          <Button color="primary" onClick={() => draft && save(draft)} disabled={busy || !draft || draft.name.trim().length < 2}>
            {busy && <Spinner size="sm" light />}
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TrybeTypesContent;
