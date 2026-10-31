"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Radio, Label } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { formatDate } from "@/utils/dateUtils";
import { usePermissions } from "@/utils/permissions";

type ValueType = "string" | "boolean" | "json";
type SettingValue = boolean | string | { [key: string]: any };

export interface SettingRow {
  uuid: string;
  name: string;
  value_type: ValueType;
  value: SettingValue;
  created_at: string;
  updated_at: string;
}

export type NewSetting = Pick<SettingRow, "name" | "value_type" | "value">;

// Mirrors the Admin API: only staff with settings.payments may change these.
const PAYMENT_SETTINGS = new Set([
  "payment_provider",
  "ios_sandbox_purchases_enabled",
  "android_test_purchases_enabled",
  "admob_ssv_required",
  "admob_enabled",
]);
const PAYMENT_WORDS = /payment|purchase|withdraw|payout|admob|wallet|cowry|coin/i;
const isPaymentSetting = (name: string) => PAYMENT_SETTINGS.has(name) || PAYMENT_WORDS.test(name);

const TYPE_LABEL: Record<ValueType, string> = { string: "String", boolean: "Boolean", json: "JSON" };
const TYPE_TONE: Record<ValueType, string> = {
  string: "bg-lightprimary text-primary",
  boolean: "bg-lightsecondary text-secondary",
  json: "bg-lightwarning text-warning",
};
const inputClass =
  "w-full px-3 py-2 border border-ld rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:bg-darkgray dark:text-white disabled:opacity-60";

const Spinner = () => <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;

export default function SettingsTable({
  settings,
  showAddForm,
  onAdd,
  onCancelAdd,
  onSaveNew,
  onUpdateSetting,
  onDeleteSetting,
  isAddingNew = false,
  loadingStates = {},
}: {
  settings: SettingRow[];
  showAddForm: boolean;
  onAdd: () => void;
  onCancelAdd: () => void;
  onSaveNew: (setting: NewSetting) => Promise<boolean>;
  onUpdateSetting: (uuid: string, value: SettingValue) => Promise<boolean>;
  onDeleteSetting: (uuid: string) => Promise<boolean>;
  isAddingNew?: boolean;
  loadingStates?: Record<string, { isUpdating?: boolean; isDeleting?: boolean }>;
}) {
  const { can } = usePermissions();
  const canEditPayments = can("settings.payments");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ValueType | "all">("all");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<SettingRow | null>(null);
  const [deleting, setDeleting] = useState<SettingRow | null>(null);

  const counts = useMemo(() => {
    const c: Record<ValueType | "all", number> = { all: settings.length, string: 0, boolean: 0, json: 0 };
    settings.forEach((s) => (c[s.value_type] = (c[s.value_type] ?? 0) + 1));
    return c;
  }, [settings]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return settings
      .filter((s) => typeFilter === "all" || s.value_type === typeFilter)
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [settings, query, typeFilter]);

  const locked = (s: SettingRow) => isPaymentSetting(s.name) && !canEditPayments;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Icon icon="solar:magnifer-linear" height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darklink" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search settings…"
            aria-label="Search settings"
            className={`${inputClass} ps-9`}
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by type">
          {(["all", "string", "boolean", "json"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              aria-pressed={typeFilter === t}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                typeFilter === t ? "bg-primary text-white border-primary" : "border-ld text-darklink hover:bg-lightgray dark:hover:bg-white/5"
              }`}
            >
              {t === "all" ? "All" : TYPE_LABEL[t]} <span className="opacity-70">{counts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-ld">
        <table className="min-w-full text-sm">
          <thead className="bg-lightgray dark:bg-white/5">
            <tr className="text-left text-xs uppercase tracking-wide text-darklink">
              <th className="font-semibold px-4 py-3">Setting</th>
              <th className="font-semibold px-4 py-3">Type</th>
              <th className="font-semibold px-4 py-3">Value</th>
              <th className="font-semibold px-4 py-3 hidden md:table-cell">Last updated</th>
              <th className="font-semibold px-4 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-darkborder">
            {rows.map((s) => {
              const state = loadingStates[s.uuid] ?? {};
              const isLocked = locked(s);
              return (
                <tr key={s.uuid} className="align-top hover:bg-lightgray/60 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[13px] font-medium whitespace-nowrap">{s.name}</span>
                      {isPaymentSetting(s.name) && (
                        <span title="Payment setting: only super admins can change it" className="text-warning shrink-0">
                          <Icon icon="solar:lock-keyhole-minimalistic-linear" height={14} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_TONE[s.value_type]}`}>
                      {TYPE_LABEL[s.value_type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 min-w-[220px] max-w-[440px]">
                    <ValueCell
                      setting={s}
                      revealed={!!revealed[s.uuid]}
                      onToggle={() => setRevealed((r) => ({ ...r, [s.uuid]: !r[s.uuid] }))}
                    />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                    <p>{formatDate(s.updated_at)}</p>
                    <p className="text-xs text-darklink mt-0.5">Created {formatDate(s.created_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(s)}
                        disabled={isLocked || state.isUpdating}
                        title={isLocked ? "Only super admins can change payment settings" : "Edit value"}
                        aria-label={`Edit ${s.name}`}
                        className="p-2 rounded-md text-darklink hover:text-primary hover:bg-lightprimary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-darklink"
                      >
                        {state.isUpdating ? <Spinner /> : <Icon icon="solar:pen-2-linear" height={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(s)}
                        disabled={isLocked || state.isDeleting}
                        title={isLocked ? "Only super admins can change payment settings" : "Delete"}
                        aria-label={`Delete ${s.name}`}
                        className="p-2 rounded-md text-darklink hover:text-error hover:bg-lighterror disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-darklink"
                      >
                        {state.isDeleting ? <Spinner /> : <Icon icon="solar:trash-bin-minimalistic-linear" height={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  {settings.length === 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      <span className="w-14 h-14 rounded-full bg-lightprimary text-primary flex items-center justify-center">
                        <Icon icon="solar:settings-linear" height={26} />
                      </span>
                      <div>
                        <p className="font-semibold">No settings yet</p>
                        <p className="text-sm text-darklink mt-1">Configuration keys and feature flags you add will show up here.</p>
                      </div>
                      <Button color="primary" onClick={onAdd}>
                        <Icon icon="solar:add-circle-linear" height={18} /> Add New
                      </Button>
                    </div>
                  ) : (
                    <p className="text-darklink">No settings match “{query}”.</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SettingEditor
        open={showAddForm}
        existingNames={settings.map((s) => s.name)}
        saving={isAddingNew}
        onClose={onCancelAdd}
        onSave={(s) => onSaveNew(s)}
      />
      <SettingEditor
        open={!!editing}
        setting={editing}
        saving={!!(editing && loadingStates[editing.uuid]?.isUpdating)}
        onClose={() => setEditing(null)}
        onSave={async (s) => {
          if (!editing) return false;
          const ok = await onUpdateSetting(editing.uuid, s.value);
          if (ok) setEditing(null);
          return ok;
        }}
      />
      <DeleteDialog
        setting={deleting}
        deleting={!!(deleting && loadingStates[deleting.uuid]?.isDeleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          if (await onDeleteSetting(deleting.uuid)) setDeleting(null);
        }}
      />
    </div>
  );
}

function ValueCell({ setting, revealed, onToggle }: { setting: SettingRow; revealed: boolean; onToggle: () => void }) {
  const { value_type, value } = setting;

  if (value_type === "boolean") {
    const on = value === true || value === "true";
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${on ? "bg-lightsuccess text-success" : "bg-lightgray dark:bg-dark text-darklink"}`}>
        {String(on)}
      </span>
    );
  }

  const isJson = value_type === "json" && value !== null && typeof value === "object";
  const summary = isJson
    ? Array.isArray(value)
      ? `${value.length} ${value.length === 1 ? "item" : "items"}`
      : Object.keys(value).join(", ") || "empty"
    : null;

  return (
    <div className="inline-flex items-start gap-1.5 max-w-full">
      <div className="min-w-0">
        {!revealed ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-darklink tracking-widest">••••••••</span>
            {summary && <span className="text-xs text-darklink truncate" title={summary}>{isJson && !Array.isArray(value) ? `{ ${summary} }` : `[ ${summary} ]`}</span>}
          </div>
        ) : isJson ? (
          <pre className="font-mono text-xs bg-lightgray dark:bg-white/5 rounded-md p-2.5 max-h-60 overflow-auto whitespace-pre-wrap break-all">
            {JSON.stringify(value, null, 2)}
          </pre>
        ) : (
          <span className="font-mono text-[13px] whitespace-pre-wrap break-all">{String(value) || <em className="text-darklink not-italic">empty</em>}</span>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={revealed ? "Hide value" : "Show value"}
        title={revealed ? "Hide value" : "Show value"}
        className="p-1 rounded-md text-darklink hover:bg-lightgray dark:hover:bg-white/10 shrink-0"
      >
        <Icon icon={revealed ? "solar:eye-closed-linear" : "solar:eye-linear"} height={16} />
      </button>
    </div>
  );
}

// Add (no setting) or edit a setting's value. Names and types are fixed once
// created: the Admin API only updates the value.
function SettingEditor({
  open,
  setting,
  existingNames = [],
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  setting?: SettingRow | null;
  existingNames?: string[];
  saving: boolean;
  onClose: () => void;
  onSave: (setting: NewSetting) => Promise<boolean>;
}) {
  const isEdit = !!setting;
  const [name, setName] = useState("");
  const [type, setType] = useState<ValueType>("string");
  const [text, setText] = useState("");
  const [bool, setBool] = useState(false);
  const [json, setJson] = useState("{\n  \n}");

  useEffect(() => {
    if (!open) return;
    setName(setting?.name ?? "");
    setType(setting?.value_type ?? "string");
    setText(setting?.value_type === "string" ? String(setting.value ?? "") : "");
    setBool(setting?.value_type === "boolean" ? setting.value === true || setting.value === "true" : false);
    setJson(setting?.value_type === "json" ? JSON.stringify(setting.value, null, 2) : "{\n  \n}");
  }, [open, setting]);

  const jsonResult = useMemo(() => {
    if (type !== "json") return { ok: true as const, value: null };
    try {
      const parsed = JSON.parse(json);
      if (parsed === null || typeof parsed !== "object") return { ok: false as const, error: "Use an object { … } or a list [ … ]." };
      return { ok: true as const, value: parsed };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }, [type, json]);

  const trimmed = name.trim();
  const nameError = !isEdit && trimmed && existingNames.includes(trimmed) ? "A setting with this name already exists." : null;
  const valid = (isEdit || (trimmed && !nameError)) && (type !== "json" || jsonResult.ok);

  const submit = async () => {
    if (!valid || saving) return;
    const value: SettingValue = type === "string" ? text : type === "boolean" ? bool : jsonResult.value;
    await onSave({ name: trimmed, value_type: type, value });
  };

  return (
    <Modal show={open} onClose={saving ? () => undefined : onClose} size="lg">
      <ModalHeader>{isEdit ? "Edit setting" : "Add setting"}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setting-name">Name</Label>
            {isEdit ? (
              <p className="font-mono text-sm px-3 py-2 rounded-md bg-lightgray dark:bg-white/5 break-all">{setting!.name}</p>
            ) : (
              <>
                <input
                  id="setting-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ios_app_review_version"
                  className={`${inputClass} font-mono`}
                  autoFocus
                />
                {nameError ? (
                  <p className="text-xs text-error">{nameError}</p>
                ) : (
                  <p className="text-xs text-darklink">The key the apps and API read. It can&apos;t be changed later.</p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            {isEdit ? (
              <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_TONE[type]}`}>{TYPE_LABEL[type]}</span>
            ) : (
              <div className="flex gap-1.5" role="radiogroup" aria-label="Type">
                {(["string", "boolean", "json"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={type === t}
                    onClick={() => setType(t)}
                    className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                      type === t ? "bg-primary text-white border-primary" : "border-ld text-darklink hover:bg-lightgray dark:hover:bg-white/5"
                    }`}
                  >
                    {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setting-value">Value</Label>
            {type === "string" && (
              <textarea
                id="setting-value"
                rows={Math.min(8, Math.max(2, text.split("\n").length))}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`${inputClass} font-mono`}
                placeholder="Value"
              />
            )}
            {type === "boolean" && (
              <div className="flex gap-6">
                {[true, false].map((b) => (
                  <label key={String(b)} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Radio name="setting-bool" checked={bool === b} onChange={() => setBool(b)} />
                    {String(b)}
                  </label>
                ))}
              </div>
            )}
            {type === "json" && (
              <>
                <textarea
                  id="setting-value"
                  rows={Math.min(16, Math.max(5, json.split("\n").length))}
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  spellCheck={false}
                  className={`${inputClass} font-mono text-xs leading-relaxed`}
                />
                <div className="flex items-center justify-between gap-3">
                  {jsonResult.ok ? (
                    <p className="text-xs text-success">Valid JSON</p>
                  ) : (
                    <p className="text-xs text-error break-all">{jsonResult.error}</p>
                  )}
                  <button
                    type="button"
                    disabled={!jsonResult.ok}
                    onClick={() => jsonResult.ok && setJson(JSON.stringify(jsonResult.value, null, 2))}
                    className="text-xs text-primary hover:underline disabled:opacity-40 disabled:no-underline"
                  >
                    Format
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="justify-end">
        <Button color="light" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button color="primary" onClick={submit} disabled={!valid || saving}>
          {saving ? (
            <>
              <Spinner /> Saving…
            </>
          ) : isEdit ? (
            "Save changes"
          ) : (
            "Add setting"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function DeleteDialog({
  setting,
  deleting,
  onClose,
  onConfirm,
}: {
  setting: SettingRow | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal show={!!setting} onClose={deleting ? () => undefined : onClose} size="md" popup>
      <ModalHeader />
      <ModalBody>
        <div className="text-center flex flex-col items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-lighterror text-error flex items-center justify-center">
            <Icon icon="solar:trash-bin-minimalistic-linear" height={22} />
          </span>
          <h3 className="text-lg font-semibold">Delete setting?</h3>
          <p className="text-sm text-darklink">
            <span className="font-mono font-medium text-ld break-all">{setting?.name}</span> will be removed. Anything that reads it gets no
            value until it&apos;s added again. This can&apos;t be undone.
          </p>
          <div className="flex gap-2 mt-2">
            <Button color="light" onClick={onClose} disabled={deleting}>
              Cancel
            </Button>
            <Button color="error" onClick={onConfirm} disabled={deleting}>
              {deleting ? (
                <>
                  <Spinner /> Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
