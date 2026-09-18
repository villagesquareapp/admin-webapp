"use client";

import { useEffect, useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

const POPULAR_ICONS = [
  "mdi:microphone", "mdi:account-group", "mdi:music", "mdi:podcast", "mdi:bullhorn",
  "mdi:school", "mdi:heart", "mdi:star", "mdi:chat", "mdi:lightbulb", "mdi:basketball",
  "mdi:gamepad-variant", "mdi:book-open-variant", "mdi:cash", "mdi:hand-heart",
  "mdi:earth", "mdi:brush", "mdi:code-tags", "mdi:trophy", "mdi:rocket", "mdi:film",
  "mdi:headphones", "mdi:food", "mdi:dumbbell",
];

const EchoCategoryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title,
  submitText,
  defaultName = "",
  defaultIcon = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; icon: string }) => void;
  loading: boolean;
  title: string;
  submitText: string;
  defaultName?: string;
  defaultIcon?: string;
}) => {
  const [name, setName] = useState(defaultName);
  const [icon, setIcon] = useState(defaultIcon);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setName(defaultName);
    setIcon(defaultIcon);
    setSearch("");
  }, [defaultName, defaultIcon, isOpen]);

  const filtered = search.trim() ? POPULAR_ICONS.filter((i) => i.toLowerCase().includes(search.toLowerCase())) : POPULAR_ICONS;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    if (!icon) return toast.error("Please select an icon");
    onSubmit({ name: name.trim(), icon });
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
                  <Label value="Select icon" />
                  {icon && (
                    <div className="mt-2 mb-3 flex items-center gap-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                      <Icon icon={icon} width={28} className="text-primary" />
                      <span className="text-sm font-medium">{icon}</span>
                    </div>
                  )}
                  <TextInput sizing="sm" placeholder="Search icons..." value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1" />
                  <div className="mt-3 grid grid-cols-8 gap-2 max-h-[160px] overflow-y-auto p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {filtered.map((i) => (
                      <button key={i} type="button" onClick={() => setIcon(i)} title={i} className={`p-2 rounded-lg grid place-items-center transition ${icon === i ? "bg-primary text-white ring-2 ring-primary" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                        <Icon icon={i} width={22} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="echo-cat-name" value="Name" />
                  <TextInput id="echo-cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Talk shows, Music" required className="mt-1" />
                </div>
                <div className="flex justify-end gap-3">
                  <Button color="gray" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
                  <Button color="success" type="submit" isProcessing={loading} disabled={loading || !name.trim() || !icon}>{submitText}</Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default EchoCategoryFormModal;
