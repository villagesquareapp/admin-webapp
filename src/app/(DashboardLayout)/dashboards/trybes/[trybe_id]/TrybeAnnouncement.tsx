"use client";

import { useRef, useState } from "react";
import { Button, Label, Modal, TextInput, Textarea } from "flowbite-react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { clearTrybeFeatured, setTrybeFeatured } from "@/app/api/trybes";

// The Highlights tab's announcement. The Trybe's owner and admins set it in
// the app (members with the bell on get a push); staff can replace or remove
// it here, without a push.
const TrybeAnnouncement = ({ trybe }: { trybe: ITrybeDetail }) => {
  const [title, setTitle] = useState(trybe.featured_title ?? "");
  const [body, setBody] = useState(trybe.featured_body ?? "");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [reason, setReason] = useState("");
  const image = useRef<HTMLInputElement>(null);

  const save = async () => {
    const form = new FormData();
    form.append("title", title.trim());
    if (body.trim()) form.append("body", body.trim());
    const file = image.current?.files?.[0];
    if (file) form.append("image", file);
    setBusy(true);
    try {
      const res = await setTrybeFeatured(trybe.uuid, form);
      if (res?.status) {
        toast.success("Announcement saved");
        if (image.current) image.current.value = "";
      } else toast.error(res?.message || "Couldn't save the announcement");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await clearTrybeFeatured(trybe.uuid, reason.trim() || undefined);
      if (res?.status) {
        toast.success("Announcement removed");
        setRemoving(false);
        setReason("");
        setTitle("");
        setBody("");
      } else toast.error(res?.message || "Couldn't remove the announcement");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-30">
      <div className="col-span-12 lg:col-span-5">
        <CardBox>
          <p className="text-sm font-semibold mb-3">Current announcement</p>
          {trybe.featured_title ? (
            <div className="flex flex-col gap-2">
              {trybe.featured_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={trybe.featured_image} alt="" className="w-full max-h-48 rounded-xl object-cover" />
              )}
              <p className="font-semibold">{trybe.featured_title}</p>
              {trybe.featured_body && <p className="text-sm whitespace-pre-line">{trybe.featured_body}</p>}
              <p className="text-xs text-darklink">
                {trybe.featured_by ? "Posted by a Trybe admin" : "Posted by staff"}
                {trybe.featured_at ? ` · ${new Date(trybe.featured_at).toLocaleString()}` : ""}
              </p>
              <Button size="xs" color="failure" className="w-fit mt-2" onClick={() => setRemoving(true)} disabled={busy}>
                Remove
              </Button>
            </div>
          ) : (
            <p className="text-sm text-darklink">No announcement. The Highlights tab hides the section.</p>
          )}
        </CardBox>
      </div>
      <div className="col-span-12 lg:col-span-7">
        <CardBox>
          <p className="text-sm font-semibold mb-1">{trybe.featured_title ? "Replace it" : "Post one"}</p>
          <p className="text-xs text-darklink mb-4">
            Members see it at the top of the Highlights tab. Posting from here sends no notification.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="featured-title" value="Title" />
              <TextInput id="featured-title" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="featured-body" value="Text (optional)" />
              <Textarea id="featured-body" rows={4} maxLength={500} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="featured-image" value="Image (optional, JPG, PNG or WebP up to 5 MB)" />
              <input
                ref={image}
                id="featured-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="mt-1 block text-sm"
              />
            </div>
            <Button color="primary" className="w-fit" onClick={save} isProcessing={busy} disabled={busy || !title.trim()}>
              Save announcement
            </Button>
          </div>
        </CardBox>
      </div>

      <Modal show={removing} onClose={() => !busy && setRemoving(false)} size="md">
        <Modal.Header>Remove the announcement</Modal.Header>
        <Modal.Body>
          <Textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (kept in the audit log)" />
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setRemoving(false)} disabled={busy}>
            Cancel
          </Button>
          <Button color="failure" onClick={remove} isProcessing={busy} disabled={busy}>
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TrybeAnnouncement;
