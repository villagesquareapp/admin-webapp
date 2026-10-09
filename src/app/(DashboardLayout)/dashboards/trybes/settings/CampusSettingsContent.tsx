"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button, Modal, TextInput, Textarea } from "flowbite-react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { formatDate } from "@/utils/dateUtils";
import { resetTrybeCode, setTrybeCode } from "@/app/api/trybeCampus";

const MAX_ITEMS = 12;

// The platform Trybe Code: a short list of rules, in order, shown before
// anyone joins any Trybe. Each Trybe's own rules show under it.
const TrybeCodeEditor = ({ code }: { code: ITrybeCode | null }) => {
  const [items, setItems] = useState<ITrybeCodeItem[]>(code?.items ?? []);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const change = (index: number, patch: Partial<ITrybeCodeItem>) =>
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index: number, by: -1 | 1) => {
    const next = [...items];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    setItems(next);
  };
  const valid = items.length > 0 && items.every((i) => i.title.trim() && i.body.trim());
  const dirty = JSON.stringify(items) !== JSON.stringify(code?.items ?? []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await setTrybeCode(items.map((i) => ({ title: i.title.trim(), body: i.body.trim() })));
      if (res?.status) toast.success("Trybe Code saved; the apps show it on the next Trybe page load");
      else toast.error(res?.message || "Couldn't save the Trybe Code");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    try {
      const res = await resetTrybeCode();
      if (res?.status && res.data) {
        setItems((res.data as ITrybeCode).items);
        toast.success("Back to the default Trybe Code");
        setConfirmReset(false);
      } else toast.error(res?.message || "Couldn't reset the Trybe Code");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CardBox>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-base font-semibold">Trybe Code</p>
          <p className="text-sm text-darklink">
            {code?.is_default
              ? "Showing the default Code. Saving makes this list the Code."
              : `Last changed ${code?.updated_at ? formatDate(code.updated_at) : ""}.`}
          </p>
        </div>
        {!code?.is_default && (
          <Button color="light" size="sm" onClick={() => setConfirmReset(true)}>
            Reset to default
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3 items-start rounded-lg border border-border dark:border-darkborder p-3">
            <span className="size-7 rounded-full bg-lightprimary text-primary grid place-items-center text-xs font-semibold shrink-0 mt-1">
              {index + 1}
            </span>
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <TextInput value={item.title} maxLength={60} onChange={(e) => change(index, { title: e.target.value })} placeholder="Title (Respect)" />
              <Textarea rows={2} maxLength={300} value={item.body} onChange={(e) => change(index, { body: e.target.value })} placeholder="What it means (Every voice matters.)" />
            </div>
            <div className="flex flex-col gap-1">
              <Button size="xs" color="light" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                <Icon icon="solar:alt-arrow-up-linear" height={14} />
              </Button>
              <Button size="xs" color="light" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move down">
                <Icon icon="solar:alt-arrow-down-linear" height={14} />
              </Button>
              <Button size="xs" color="light" onClick={() => setItems(items.filter((_, i) => i !== index))} aria-label="Remove">
                <Icon icon="solar:trash-bin-minimalistic-linear" height={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-2 mt-4">
        <Button color="light" size="sm" disabled={items.length >= MAX_ITEMS} onClick={() => setItems([...items, { title: "", body: "" }])}>
          Add a rule
        </Button>
        <Button color="primary" onClick={save} isProcessing={saving} disabled={saving || !valid || !dirty}>
          Save Trybe Code
        </Button>
      </div>

      <Modal show={confirmReset} onClose={() => !saving && setConfirmReset(false)} size="md">
        <Modal.Header>Reset the Trybe Code</Modal.Header>
        <Modal.Body>
          <p className="text-sm">The apps go back to the default Code. Your current list is not kept.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setConfirmReset(false)} disabled={saving}>
            Cancel
          </Button>
          <Button color="failure" onClick={reset} isProcessing={saving} disabled={saving}>
            Reset
          </Button>
        </Modal.Footer>
      </Modal>
    </CardBox>
  );
};

const SetupLink = ({ href, icon, title, body }: { href: string; icon: string; title: string; body: string }) => (
  <Link href={href} className="flex gap-3 rounded-lg border border-border dark:border-darkborder p-3 hover:border-primary">
    <span className="size-9 rounded-md grid place-items-center bg-lightprimary text-primary shrink-0">
      <Icon icon={icon} height={18} />
    </span>
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-darklink">{body}</p>
    </div>
  </Link>
);

const CampusSettingsContent = ({ code, campus }: { code: ITrybeCode | null; campus: ITrybeType | null }) => {
  const type = campus ? `?type=${campus.uuid}` : "";
  return (
    <div className="grid grid-cols-12 gap-30">
      <div className="col-span-12 lg:col-span-7">
        <TrybeCodeEditor code={code} />
      </div>
      <div className="col-span-12 lg:col-span-5">
        <CardBox>
          <p className="text-base font-semibold mb-3">The rest of Campus</p>
          <div className="flex flex-col gap-2">
            <SetupLink href="/dashboards/trybes/institutions" icon="solar:buildings-2-line-duotone" title="Institutions" body="The schools Campus Trybes belong to, one Trybe each." />
            <SetupLink href="/dashboards/trybes/departments" icon="solar:notebook-line-duotone" title="Departments" body="The department list, and answers that match none of it." />
            <SetupLink href="/dashboards/trybes/levels" icon="solar:ranking-line-duotone" title="Levels" body="What each kind of institution offers in the join form." />
            <SetupLink
              href="/dashboards/trybes/types"
              icon="solar:library-line-duotone"
              title="Join form, photos and poll name"
              body={
                campus
                  ? `Campus asks for ${campus.required_documents.length ? campus.required_documents.join(", ").replace(/_/g, " ") : "no photos"}; polls are called "${campus.poll_label || "Poll"}".`
                  : "Set on the Campus type."
              }
            />
            <SetupLink href={`/dashboards/posts/categories${type}`} icon="solar:home-smile-angle-line-duotone" title="Home tabs (post categories)" body="AskTheTrybe, Confessions and the other Campus tabs." />
            <SetupLink href={`/dashboards/echoes/categories${type}`} icon="solar:microphone-3-line-duotone" title="Echo categories" body="Categories inside Campus Trybes." />
            <SetupLink href={`/dashboards/livestreams/categories${type}`} icon="solar:videocamera-record-line-duotone" title="Livestream categories" body="Categories inside Campus Trybes." />
            <SetupLink href={`/dashboards/markets/categories${type}`} icon="solar:shop-2-line-duotone" title="MarketSquare categories" body="Categories inside Campus Trybes." />
          </div>
        </CardBox>
      </div>
    </div>
  );
};

export default CampusSettingsContent;
