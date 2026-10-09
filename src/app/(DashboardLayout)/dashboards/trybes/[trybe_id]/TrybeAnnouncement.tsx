"use client";

import { useRef, useState } from "react";
import { Button, Checkbox, Label, Modal, TextInput, Textarea } from "flowbite-react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { formatDate } from "@/utils/dateUtils";
import { clearTrybeFeatured, setTrybeFeatured } from "@/app/api/trybes";

// The Highlights tab's announcement. The Trybe's owner and admins set it in
// the app (members with the bell on get a push); staff can replace or remove
// it here, and push it to members if they choose.
const TrybeAnnouncement = ({ trybe }: { trybe: ITrybeDetail }) => {
  const [title, setTitle] = useState(trybe.featured_title ?? "");
  const [body, setBody] = useState(trybe.featured_body ?? "");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [reason, setReason] = useState("");
  const [dropImage, setDropImage] = useState(false);
  const [notify, setNotify] = useState(false);
  const image = useRef<HTMLInputElement>(null);

  const save = async () => {
    const form = new FormData();
    form.append("title", title.trim());
    if (body.trim()) form.append("body", body.trim());
    const file = image.current?.files?.[0];
    if (file) form.append("image", file);
    // Without a new image the current one stays unless this is ticked.
    else if (dropImage) form.append("remove_image", "true");
    if (notify) form.append("notify", "true");
    setBusy(true);
    try {
      const res = await setTrybeFeatured(trybe.uuid, form);
      if (res?.status) {
        const push = res.data?.push;
        if (push && "error" in push) toast.warning(`Announcement saved, but the push didn't go: ${push.error}`);
        else if (push) toast.success(`Announcement saved and sent to ${push.recipients.toLocaleString()} ${push.recipients === 1 ? "member" : "members"}`);
        else toast.success("Announcement saved");
        if (image.current) image.current.value = "";
        setDropImage(false);
        setNotify(false);
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
                {trybe.featured_at ? ` · ${formatDate(trybe.featured_at)}` : ""}
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
            Members see it at the top of the Highlights tab. No push goes out unless you ask for one below.
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
              {trybe.featured_image && (
                <label className="flex items-center gap-2 text-sm mt-2">
                  <Checkbox checked={dropImage} onChange={(e) => setDropImage(e.target.checked)} />
                  Remove the current image (otherwise it stays unless you pick a new one)
                </label>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={notify} onChange={(e) => setNotify(e.target.checked)} disabled={trybe.status !== "active"} />
                Also notify members
              </label>
              <p className="text-xs text-darklink mt-1 ms-6">
                {trybe.status !== "active"
                  ? "Only an active Trybe can be messaged."
                  : "Members with the bell on get “New announcement” with its title. It counts towards the Trybe's push limit (1 an hour, 5 a day); when the limit is reached nothing is saved."}
              </p>
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
