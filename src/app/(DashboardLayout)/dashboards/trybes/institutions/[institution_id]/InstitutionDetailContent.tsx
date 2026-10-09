"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button, Label, Modal, TextInput, Textarea } from "flowbite-react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { createInstitutionTrybe, uploadInstitutionLogo } from "@/app/api/trybeCampus";
import { getTrybes, updateTrybe } from "@/app/api/trybes";
import { Chip, TrybeAvatar } from "../../trybeUi";
import { InstitutionLogo, OWNERSHIP, kindLabel } from "../../campusUi";
import InstitutionForm from "../InstitutionForm";

const LogoPicker = ({ institution }: { institution: IInstitutionDetail }) => {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const upload = async (file: File | undefined) => {
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    setBusy(true);
    try {
      const res = await uploadInstitutionLogo(institution.uuid, form);
      if (res?.status) toast.success("Logo updated");
      else toast.error(res?.message || "Upload failed");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">Logo</p>
      <InstitutionLogo src={institution.logo} size={96} />
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      <Button size="xs" color="light" className="w-fit" onClick={() => input.current?.click()} isProcessing={busy} disabled={busy}>
        {institution.logo ? "Replace" : "Upload"}
      </Button>
    </div>
  );
};

// Creating its Trybe, or linking a Campus Trybe that has no institution yet.
const TrybeCard = ({ institution }: { institution: IInstitutionDetail }) => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [linking, setLinking] = useState(false);
  const [name, setName] = useState(`${institution.short_name ?? institution.name} Trybe`.slice(0, 80));
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<ITrybeListItem[]>([]);
  const [busy, setBusy] = useState(false);

  const find = useDebouncedCallback(async (term: string) => {
    const res = await getTrybes(1, 10, { linked: "false", search: term || undefined });
    setOptions((res?.data?.data || []).filter((t) => t.type?.join_form === "campus"));
  }, 300);
  useEffect(() => {
    if (linking) find(search);
  }, [linking, search, find]);

  const create = async () => {
    setBusy(true);
    try {
      const res = await createInstitutionTrybe(institution.uuid, {
        name: name.trim() || undefined,
        tagline: tagline.trim() || undefined,
        about: about.trim() || undefined,
      });
      if (res?.status && res.data) {
        toast.success("Trybe created");
        router.push(`/dashboards/trybes/${res.data.uuid}`);
      } else toast.error(res?.message || "Couldn't create the Trybe");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const link = async (trybe: ITrybeListItem) => {
    setBusy(true);
    try {
      const res = await updateTrybe(trybe.uuid, { institution_id: institution.uuid });
      if (res?.status) {
        toast.success(`${trybe.name} now belongs to ${institution.name}`);
        setLinking(false);
      } else toast.error(res?.message || "Couldn't link the Trybe");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <CardBox>
      <p className="text-sm font-semibold mb-3">Its Trybe</p>
      {institution.trybe ? (
        <Link href={`/dashboards/trybes/${institution.trybe.uuid}`} className="flex items-center gap-3 group">
          <TrybeAvatar src={institution.trybe.avatar} name={institution.trybe.name} />
          <div className="min-w-0">
            <p className="text-sm font-medium group-hover:text-primary">{institution.trybe.name}</p>
            <p className="text-xs text-darklink flex items-center gap-2">
              {Number(institution.trybe.member_count).toLocaleString()} members
              {institution.pending_requests ? ` · ${institution.pending_requests} waiting` : ""}
              <Chip value={institution.trybe.status} />
            </p>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-darklink">No Trybe yet. Each institution can have one Campus Trybe.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" color="primary" onClick={() => setCreating(true)} disabled={!institution.is_active}>
              Create its Trybe
            </Button>
            <Button size="sm" color="light" onClick={() => setLinking(true)} disabled={!institution.is_active}>
              Link an existing Trybe
            </Button>
          </div>
          {!institution.is_active && <p className="text-xs text-warning">Enable the institution first.</p>}
        </div>
      )}

      <Modal show={creating} onClose={() => !busy && setCreating(false)} size="lg">
        <Modal.Header>Create the Trybe for {institution.short_name ?? institution.name}</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-darklink">
              A Campus Trybe with &ldquo;{institution.name}&rdquo; as its school
              {institution.logo ? " and the institution's logo as its avatar" : ""}. You can add a cover and admins next.
            </p>
            <div>
              <Label htmlFor="new-trybe-name" value="Name" />
              <TextInput id="new-trybe-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="new-trybe-tagline" value="Tagline" />
              <TextInput id="new-trybe-tagline" value={tagline} maxLength={160} onChange={(e) => setTagline(e.target.value)} placeholder="Network and build your business" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="new-trybe-about" value="About" />
              <Textarea id="new-trybe-about" rows={3} maxLength={2000} value={about} onChange={(e) => setAbout(e.target.value)} className="mt-1" />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setCreating(false)} disabled={busy}>
            Cancel
          </Button>
          <Button color="primary" onClick={create} isProcessing={busy} disabled={busy || name.trim().length < 2}>
            Create Trybe
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={linking} onClose={() => !busy && setLinking(false)} size="lg">
        <Modal.Header>Link a Campus Trybe</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-3">
            <p className="text-sm text-darklink">
              Campus Trybes that don&apos;t belong to an institution yet. Linking one sets its school to &ldquo;
              {institution.name}&rdquo; and its join form to this institution&apos;s levels.
            </p>
            <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Trybes..." autoFocus />
            <div className="flex flex-col divide-y divide-border dark:divide-darkborder max-h-80 overflow-y-auto">
              {options.length === 0 && <p className="text-sm text-darklink py-4 text-center">No unlinked Campus Trybes found.</p>}
              {options.map((t) => (
                <div key={t.uuid} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <TrybeAvatar src={t.avatar} name={t.name} size={32} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.name}</p>
                      <p className="text-xs text-darklink truncate">{t.subtitle || "—"}</p>
                    </div>
                  </div>
                  <Button size="xs" color="primary" onClick={() => link(t)} disabled={busy}>
                    Link
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </CardBox>
  );
};

const InstitutionDetailContent = ({ institution }: { institution: IInstitutionDetail | null }) => {
  if (!institution) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">
          <Icon icon="solar:buildings-2-line-duotone" height={40} className="mx-auto mb-3" />
          <p>Institution not found.</p>
          <Link href="/dashboards/trybes/institutions" className="text-primary text-sm font-semibold mt-3 inline-block">
            ← Back to institutions
          </Link>
        </div>
      </CardBox>
    );
  }

  const facts = [
    kindLabel(institution.kind),
    institution.ownership ? OWNERSHIP.find((o) => o.value === institution.ownership)?.label : null,
    [institution.city, institution.state].filter(Boolean).join(", ") || null,
    institution.regulator ? `Listed by ${institution.regulator}` : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <InstitutionLogo src={institution.logo} size={56} />
        <div>
          <Link href="/dashboards/trybes/institutions" className="text-sm text-darklink">
            ← Institutions
          </Link>
          <h4 className="text-lg font-bold">
            {institution.name}
            {institution.short_name && <span className="text-darklink font-medium"> ({institution.short_name})</span>}
          </h4>
          <p className="text-sm text-darklink flex flex-wrap items-center gap-2">
            {facts.join(" · ")}
            <Chip value={institution.is_active ? "active" : "disabled"} />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-30">
          <TrybeCard institution={institution} />
          <CardBox>
            <p className="text-sm font-semibold">Levels its Trybe offers</p>
            <p className="text-xs text-darklink mb-3">Every active level marked for {kindLabel(institution.kind)}, in order.</p>
            <div className="flex flex-wrap gap-1.5">
              {institution.levels.length ? (
                institution.levels.map((l) => (
                  <span key={l} className="rounded-full bg-lightprimary text-primary px-2.5 py-0.5 text-xs font-medium">
                    {l}
                  </span>
                ))
              ) : (
                <span className="text-sm text-warning">None for this kind yet; its Trybe would use its own list.</span>
              )}
            </div>
            <Link href={`/dashboards/trybes/levels?kind=${institution.kind}`} className="text-primary text-sm font-semibold mt-3 inline-block">
              Manage levels →
            </Link>
          </CardBox>
          <CardBox>
            <LogoPicker institution={institution} />
            {institution.trybe && (
              <Link
                href={`/dashboards/trybes/departments?tab=unmatched&institution_id=${institution.uuid}`}
                className="text-primary text-sm font-semibold mt-4 inline-block"
              >
                Departments its students typed that aren&apos;t on the list →
              </Link>
            )}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-8">
          <CardBox>
            <InstitutionForm key={institution.updated_at} institution={institution} />
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDetailContent;
