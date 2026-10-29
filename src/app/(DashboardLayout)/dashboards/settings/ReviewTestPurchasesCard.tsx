"use client";

import { useEffect, useMemo, useState } from "react";
import { Label, Radio, Spinner, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { addNewSettings, updateSettings } from "@/app/api/setting";
import { getSearchUser, getUserDetails } from "@/app/api/user";
import { usePermissions } from "@/utils/permissions";

type Person = { uuid: string; name: string; username: string; email?: string; profile_picture?: string | null };
// user: undefined while it's being looked up, null when no account matches.
type ListedAccount = { key: string; user?: Person | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Older entries can be an email or username as well as a user id.
const resolveAccount = async (key: string): Promise<Person | null> => {
  try {
    if (UUID.test(key)) {
      const p = (await getUserDetails(key))?.data?.user_details?.profile;
      return p ? { uuid: p.id, name: p.name, username: p.username, email: p.email, profile_picture: p.profile_picture } : null;
    }
    const wanted = key.toLowerCase();
    const found = ((await getSearchUser(key))?.data ?? []).find(
      (u) => u.email?.toLowerCase() === wanted || u.username?.toLowerCase() === wanted
    );
    return found ?? null;
  } catch {
    return null;
  }
};

const isListed = (people: ListedAccount[], u: Person) =>
  people.some(({ key, user }) => {
    const k = key.toLowerCase();
    return user?.uuid === u.uuid || k === u.uuid || k === u.email?.toLowerCase() || k === u.username?.toLowerCase();
  });

const Avatar = ({ src, size }: { src?: string | null; size: string }) =>
  src ? (
    <img src={src} alt="" className={`${size} rounded-full object-cover shrink-0`} />
  ) : (
    <span className={`${size} rounded-full bg-lightgray dark:bg-white/5 grid place-items-center text-darklink shrink-0`}>
      <Icon icon="solar:user-bold" height={14} />
    </span>
  );

const AccountPicker = ({
  people,
  onChange,
  disabled,
}: {
  people: ListedAccount[];
  onChange: (next: ListedAccount[]) => void;
  disabled: boolean;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let live = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await getSearchUser(q);
        if (live) setResults(res?.data ?? []);
      } catch {
        if (live) setResults([]);
      } finally {
        if (live) setSearching(false);
      }
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query]);

  const toggle = (u: Person) =>
    onChange(
      isListed(people, u)
        ? people.filter(({ key, user }) => !isListed([{ key, user }], u))
        : [...people, { key: u.uuid, user: u }]
    );

  return (
    <div className="rounded-lg border border-ld p-3 flex flex-col gap-3">
      {people.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {people.map(({ key, user }) => (
            <span
              key={key}
              title={user === null ? "No account matches this. It stays on the list until you remove it." : user?.email || key}
              className={`flex items-center gap-1.5 rounded-full ps-1 pe-2 py-0.5 text-xs font-medium max-w-full ${
                user === null ? "bg-lightwarning text-warning" : "bg-lightprimary text-primary"
              }`}
            >
              {user === undefined ? (
                <Spinner size="xs" className="mx-0.5" />
              ) : user === null ? (
                <Icon icon="solar:question-circle-bold" height={20} />
              ) : (
                <Avatar src={user.profile_picture} size="size-5" />
              )}
              <span className="truncate">
                {user ? (
                  <>
                    {user.name} <span className="opacity-70">@{user.username}</span>
                  </>
                ) : (
                  key
                )}
                {user === null && <span className="opacity-70"> · not found</span>}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(people.filter((p) => p.key !== key))}
                  aria-label={`Remove ${user?.name ?? key}`}
                  className="hover:text-error shrink-0"
                >
                  <Icon icon="solar:close-circle-bold" height={14} />
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-darklink">Nobody yet. Add the App Review demo account and your testers.</p>
      )}
      {!disabled && (
        <>
          <TextInput
            id="test-purchase-accounts"
            icon={() => <Icon icon="solar:magnifer-linear" height={16} className="text-darklink" />}
            value={query}
            placeholder="Search by name, username or email"
            onChange={(e) => setQuery(e.target.value)}
          />
          {query.trim() && (
            <div className="max-h-56 overflow-y-auto -mx-1">
              {searching ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : results.length ? (
                results.map((u) => {
                  const on = isListed(people, u);
                  return (
                    <button
                      key={u.uuid}
                      type="button"
                      onClick={() => toggle(u)}
                      className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left ${
                        on ? "bg-lightprimary/60 dark:bg-lightprimary/10" : "hover:bg-lightgray dark:hover:bg-white/5"
                      }`}
                    >
                      <Avatar src={u.profile_picture} size="size-8" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium truncate">{u.name}</span>
                        <span className="block text-xs text-darklink truncate">
                          @{u.username}
                          {u.email ? ` · ${u.email}` : ""}
                        </span>
                      </span>
                      <Icon
                        icon={on ? "solar:check-circle-bold" : "solar:add-circle-linear"}
                        height={18}
                        className={on ? "text-primary" : "text-darklink"}
                      />
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-xs text-darklink py-3">No users found</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

type Setting = Pick<ISettings, "uuid" | "name" | "value_type" | "value">;

// The main API credits a free store test purchase only for these accounts,
// and only while the platform's switch is on.
const ACCOUNTS = "test_purchase_accounts";
const SWITCHES = [
  {
    name: "ios_sandbox_purchases_enabled",
    label: "App Store (iOS)",
    hint: "Sandbox purchases: TestFlight, Xcode and App Review builds.",
  },
  {
    name: "android_test_purchases_enabled",
    label: "Google Play (Android)",
    hint: "Licence-tester purchases.",
  },
];
const DAY = 24 * 60 * 60 * 1000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const inputClass =
  "w-full px-3 py-2 border border-ld rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:bg-darkgray dark:text-white disabled:opacity-60";

const isoDay = (offsetDays = 0) => new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);

// Mirrors the main API: true, or a date / date-time it runs until (a date on
// its own lasts to the end of that day, UTC).
const readSwitch = (value: unknown) => {
  if (value === true || value === "true") return { on: true, until: null as string | null };
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const end = DATE_ONLY.test(value) ? Date.parse(value) + DAY : Date.parse(value);
    return { on: end > Date.now(), until: value };
  }
  return { on: false, until: null };
};

const showDate = (value: string) =>
  DATE_ONLY.test(value)
    ? `end of ${new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })} (UTC)`
    : `${new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} (UTC)`;

const parseAccounts = (value: unknown): string[] =>
  (Array.isArray(value) ? value : String(value ?? "").split(/[\s,;]+/))
    .map((a) => String(a).trim())
    .filter(Boolean);

export default function ReviewTestPurchasesCard({
  settings,
  onSaved,
}: {
  settings: Setting[];
  onSaved: (setting: Setting) => void;
}) {
  const { can } = usePermissions();
  const allowed = can("settings.payments");
  const byName = useMemo(() => new Map(settings.map((s) => [s.name, s])), [settings]);

  const savedAccounts = parseAccounts(byName.get(ACCOUNTS)?.value);
  const [people, setPeople] = useState<ListedAccount[]>(() => savedAccounts.map((key) => ({ key })));

  useEffect(() => {
    let live = true;
    savedAccounts.forEach(async (key) => {
      const user = await resolveAccount(key);
      if (live) setPeople((list) => list.map((p) => (p.key === key && p.user === undefined ? { ...p, user } : p)));
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [baseline, setBaseline] = useState<Record<string, { on: boolean; until: string }>>(() =>
    Object.fromEntries(
      SWITCHES.map(({ name }) => {
        const state = readSwitch(byName.get(name)?.value);
        // "On" with no end date has no until, so saving the form adds one.
        return [name, { on: state.on, until: state.on && state.until ? state.until.slice(0, 10) : "" }];
      })
    )
  );
  const [modes, setModes] = useState(() =>
    Object.fromEntries(SWITCHES.map(({ name }) => [name, { ...baseline[name], until: baseline[name].until || isoDay(14) }]))
  );
  const [saving, setSaving] = useState(false);

  const listed = people.map((p) => p.key);
  const anyOn = SWITCHES.some(({ name }) => modes[name].on);

  const write = async (name: string, value: string | boolean | string[]) => {
    const existing = byName.get(name);
    const response = existing
      ? await updateSettings(existing.uuid, { value })
      : await addNewSettings({
          name,
          value,
          value_type: Array.isArray(value) ? "json" : typeof value === "boolean" ? "boolean" : "string",
        } as Omit<ISettings, "uuid" | "created_at" | "updated_at" | "deleted_at">);
    if (!response?.status) throw new Error(response?.message || `Couldn't save ${name}`);
    const saved = (response.data as Setting | undefined) ?? undefined;
    onSaved(saved?.uuid ? saved : { ...(existing as Setting), value });
  };

  const save = async () => {
    const missingDate = SWITCHES.find(
      ({ name }) => modes[name].on && !modes[name].until && byName.get(name)?.value_type !== "boolean"
    );
    if (missingDate) {
      toast.error(`Pick an end date for ${missingDate.label}`);
      return;
    }
    setSaving(true);
    try {
      const accountsSetting = byName.get(ACCOUNTS);
      if (listed.join(",") !== savedAccounts.join(",") && (accountsSetting || listed.length)) {
        await write(ACCOUNTS, accountsSetting?.value_type === "json" ? listed : listed.join(", "));
      }
      for (const { name } of SWITCHES) {
        const existing = byName.get(name);
        const { on, until } = modes[name];
        const was = baseline[name];
        const onOff = existing?.value_type === "boolean";
        if (on === was.on && (!on || onOff || until === was.until)) continue;
        if (!existing && !on) continue;
        // A switch created as on/off can't hold an end date.
        await write(name, onOff ? on : on ? until : "false");
      }
      setBaseline(modes);
      toast.success("Test purchase settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  const status = (name: string) => {
    const state = readSwitch(byName.get(name)?.value);
    if (state.on && state.until) return { text: `On until ${showDate(state.until)}`, tone: "bg-lightsuccess text-success" };
    if (state.on) return { text: "On, no end date", tone: "bg-lightwarning text-warning" };
    if (state.until) return { text: `Ended ${showDate(state.until)}`, tone: "bg-lightgray dark:bg-dark text-darklink" };
    return { text: "Off", tone: "bg-lightgray dark:bg-dark text-darklink" };
  };

  return (
    <CardBox>
      <div className="p-2 flex flex-col gap-5">
        <div>
          <h5 className="text-base font-semibold">App Review test purchases</h5>
          <p className="text-sm text-darklink mt-1 max-w-2xl">
            Store test purchases cost nothing, so they only add real coins for the accounts listed here, and only
            while the switch is on. Turn it on just before you submit a build for review, with an end date.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {SWITCHES.map(({ name, label, hint }) => {
            const existing = byName.get(name);
            const onOff = existing?.value_type === "boolean";
            const mode = modes[name];
            const pill = status(name);
            return (
              <div key={name} className="rounded-lg border border-ld p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-darklink">{hint}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${pill.tone}`}>{pill.text}</span>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Radio
                    name={name}
                    checked={!mode.on}
                    disabled={!allowed}
                    onChange={() => setModes((m) => ({ ...m, [name]: { ...m[name], on: false } }))}
                  />
                  Off
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Radio
                    name={name}
                    checked={mode.on}
                    disabled={!allowed}
                    onChange={() => setModes((m) => ({ ...m, [name]: { ...m[name], on: true } }))}
                  />
                  {onOff ? "On" : "On until the end of"}
                </label>
                {onOff ? (
                  <p className="text-xs text-darklink">
                    This switch was created as on/off, so it can&apos;t end by itself. Turn it off when review is done.
                  </p>
                ) : (
                  mode.on && (
                    <input
                      type="date"
                      className={inputClass}
                      min={isoDay(0)}
                      value={mode.until}
                      disabled={!allowed}
                      onChange={(e) => setModes((m) => ({ ...m, [name]: { ...m[name], until: e.target.value } }))}
                    />
                  )
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="test-purchase-accounts">Accounts that can buy with test purchases</Label>
          <AccountPicker people={people} onChange={setPeople} disabled={!allowed} />
          {allowed && <p className="text-xs text-darklink">Changes apply when you save.</p>}
          {anyOn && listed.length === 0 && (
            <p className="text-xs text-warning">Nobody is listed, so no test purchase will add coins.</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-darklink">
            {allowed ? "Real purchases aren't affected." : "Only super admins can change these."}
          </p>
          <Button color="primary" onClick={save} disabled={!allowed || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </CardBox>
  );
}
