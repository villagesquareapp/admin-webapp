"use client";

import { useEffect, useState } from "react";
import { Checkbox, Label, TextInput, Textarea, Spinner, HelperText } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

const POPULAR_ICONS = [
  "mdi:chat-question", "mdi:help-circle", "mdi:incognito", "mdi:fire", "mdi:lightbulb-on", "mdi:bullhorn",
  "mdi:chat", "mdi:forum", "mdi:heart", "mdi:star", "mdi:newspaper", "mdi:briefcase", "mdi:school",
  "mdi:book-open-variant", "mdi:music", "mdi:soccer", "mdi:gamepad-variant", "mdi:food", "mdi:emoticon-happy",
  "mdi:emoticon-cry", "mdi:hand-heart", "mdi:earth", "mdi:camera", "mdi:palette", "mdi:cash", "mdi:home-heart",
  "mdi:account-group", "mdi:map-marker", "mdi:calendar", "mdi:trophy", "mdi:rocket", "mdi:film",
];

const SLUG = /^[a-z0-9-]*$/;

export interface PostCategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_anonymous: boolean;
  is_enabled: boolean;
}

// Adding when category is null; editing it otherwise (its slug can't change).
const PostCategoryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title,
  submitText,
  category = null,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostCategoryFormData) => void;
  loading: boolean;
  title: string;
  submitText: string;
  category?: IPostCategory | null;
}) => {
  const [form, setForm] = useState<PostCategoryFormData>({
    name: "",
    slug: "",
    description: "",
    icon: "",
    is_anonymous: false,
    is_enabled: true,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    setForm({
      name: category?.name ?? "",
      slug: "",
      description: category?.description ?? "",
      icon: category?.icon ?? "",
      is_anonymous: category?.is_anonymous ?? false,
      is_enabled: category?.is_enabled ?? true,
    });
    setSearch("");
  }, [category, isOpen]);

  const set = <K extends keyof PostCategoryFormData>(key: K, value: PostCategoryFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const filtered = search.trim() ? POPULAR_ICONS.filter((i) => i.toLowerCase().includes(search.toLowerCase())) : POPULAR_ICONS;
  const slugValid = SLUG.test(form.slug);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Category name is required");
    if (!slugValid) return toast.error("The slug may only use a-z, 0-9 and -");
    onSubmit({ ...form, name: form.name.trim(), slug: form.slug.trim(), description: form.description.trim() });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={onClose} className="relative z-[60]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel as={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-darkgray p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={submit}>
                <div className="mb-4">
                  <Label htmlFor="post-cat-name">Name</Label>
                  <TextInput id="post-cat-name" value={form.name} maxLength={40} onChange={(e) => set("name", e.target.value)} placeholder="e.g. AskTheTrybe, Confessions" required className="mt-1" />
                </div>
                {!category && (
                  <div className="mb-4">
                    <Label htmlFor="post-cat-slug">Slug (optional)</Label>
                    <TextInput
                      id="post-cat-slug"
                      value={form.slug}
                      maxLength={40}
                      onChange={(e) => set("slug", e.target.value.toLowerCase())}
                      placeholder="made from the name"
                      color={slugValid ? undefined : "failure"}
                      className="mt-1"
                    />
                    <HelperText color={slugValid ? undefined : "failure"}>
                      The tab&apos;s key: lower-case letters, numbers and -. Made from the name if empty. It can&apos;t change later.
                    </HelperText>
                  </div>
                )}
                <div className="mb-4">
                  <Label htmlFor="post-cat-description">Description (optional)</Label>
                  <Textarea id="post-cat-description" value={form.description} maxLength={300} onChange={(e) => set("description", e.target.value)} placeholder="Shown under the tab" rows={2} className="mt-1" />
                </div>
                <div className="mb-4">
                  <Label>Icon (optional)</Label>
                  {form.icon && (
                    <div className="mt-2 mb-3 flex items-center gap-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                      <Icon icon={form.icon} width={28} className="text-primary" />
                      <span className="text-sm font-medium flex-1">{form.icon}</span>
                      <button type="button" onClick={() => set("icon", "")} className="text-xs text-darklink hover:text-error">Remove</button>
                    </div>
                  )}
                  <TextInput sizing="sm" placeholder="Search icons..." value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1" />
                  <div className="mt-3 grid grid-cols-8 gap-2 max-h-[160px] overflow-y-auto p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {filtered.map((i) => (
                      <button key={i} type="button" onClick={() => set("icon", i)} title={i} className={`p-2 rounded-lg grid place-items-center transition ${form.icon === i ? "bg-primary text-white ring-2 ring-primary" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                        <Icon icon={i} width={22} />
                      </button>
                    ))}
                    {filtered.length === 0 && <p className="col-span-8 text-center text-xs text-gray-400 py-4">No icons found</p>}
                  </div>
                </div>
                <div className="mb-3 flex items-start gap-2">
                  <Checkbox id="post-cat-anonymous" checked={form.is_anonymous} onChange={(e) => set("is_anonymous", e.target.checked)} className="mt-0.5" />
                  <div>
                    <Label htmlFor="post-cat-anonymous">Anonymous</Label>
                    <p className="text-xs text-darklink">Posts here hide the author&apos;s name. Changing this only affects new posts.</p>
                  </div>
                </div>
                <div className="mb-5 flex items-center gap-2">
                  <Checkbox id="post-cat-enabled" checked={form.is_enabled} onChange={(e) => set("is_enabled", e.target.checked)} />
                  <Label htmlFor="post-cat-enabled">Enabled</Label>
                </div>
                <div className="flex justify-end gap-3">
                  <Button color="gray" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
                  <Button color="success" type="submit" disabled={loading || !form.name.trim() || !slugValid}>{(loading) && <Spinner size="sm" light />}{submitText}</Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default PostCategoryFormModal;
