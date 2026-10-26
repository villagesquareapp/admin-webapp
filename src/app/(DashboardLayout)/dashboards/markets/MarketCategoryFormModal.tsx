"use client";

import { useEffect, useState } from "react";
import { Label, TextInput, Textarea, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

export const DEFAULT_CATEGORY_COLOR = "#2563EB";
export const isHexColor = (v?: string | null): v is string => !!v && /^#[0-9a-f]{6}$/i.test(v);

const POPULAR_ICONS = [
  "mdi:shopping", "mdi:cart", "mdi:store", "mdi:tag", "mdi:sale", "mdi:gift", "mdi:package-variant", "mdi:basket",
  "mdi:tshirt-crew", "mdi:hanger", "mdi:shoe-sneaker", "mdi:shoe-heel", "mdi:purse", "mdi:bag-personal", "mdi:watch",
  "mdi:necklace", "mdi:ring", "mdi:diamond-stone", "mdi:glasses", "mdi:lipstick", "mdi:spray-bottle", "mdi:hair-dryer",
  "mdi:cellphone", "mdi:laptop", "mdi:television", "mdi:headphones", "mdi:camera", "mdi:gamepad-variant", "mdi:printer",
  "mdi:sofa", "mdi:bed", "mdi:lamp", "mdi:home-variant", "mdi:silverware-fork-knife", "mdi:food-apple", "mdi:cupcake",
  "mdi:coffee", "mdi:baby-carriage", "mdi:toy-brick", "mdi:book-open-variant", "mdi:palette", "mdi:guitar-acoustic",
  "mdi:dumbbell", "mdi:bike", "mdi:car", "mdi:tools", "mdi:hammer-wrench", "mdi:flower", "mdi:sprout", "mdi:paw",
  "mdi:pill", "mdi:briefcase",
];

const withHash = (v: string) => (v.startsWith("#") ? v : `#${v}`);

export interface MarketCategoryFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

const MarketCategoryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title,
  submitText,
  defaultName = "",
  defaultDescription = "",
  defaultIcon = "",
  defaultColor = DEFAULT_CATEGORY_COLOR,
  currentIconUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MarketCategoryFormData) => void;
  loading: boolean;
  title: string;
  submitText: string;
  defaultName?: string;
  defaultDescription?: string;
  defaultIcon?: string;
  defaultColor?: string;
  // Editing a category whose icon isn't an Iconify id: keep it unless another is picked.
  currentIconUrl?: string | null;
}) => {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [icon, setIcon] = useState(defaultIcon);
  const [color, setColor] = useState(defaultColor);
  const [colorText, setColorText] = useState(defaultColor);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setName(defaultName);
    setDescription(defaultDescription);
    setIcon(defaultIcon);
    setColor(defaultColor);
    setColorText(defaultColor);
    setSearch("");
  }, [defaultName, defaultDescription, defaultIcon, defaultColor, isOpen]);

  const filtered = search.trim() ? POPULAR_ICONS.filter((i) => i.toLowerCase().includes(search.toLowerCase())) : POPULAR_ICONS;
  const hasIcon = !!icon || !!currentIconUrl;

  const changeColorText = (v: string) => {
    setColorText(v);
    if (isHexColor(withHash(v.trim()))) setColor(withHash(v.trim()).toUpperCase());
  };

  const pickColor = (v: string) => {
    setColor(v.toUpperCase());
    setColorText(v.toUpperCase());
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    if (!hasIcon) return toast.error("Please select an icon");
    if (!isHexColor(withHash(colorText.trim()))) return toast.error("Enter a hex color like #2563EB");
    onSubmit({ name: name.trim(), description: description.trim(), icon, color });
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
                  <Label>Select icon</Label>
                  {(icon || currentIconUrl) && (
                    <div className="mt-2 mb-3 flex items-center gap-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                      {icon ? (
                        <Icon icon={icon} width={28} style={{ color }} />
                      ) : (
                        <img src={currentIconUrl!} alt="" className="w-7 h-7 object-contain" />
                      )}
                      <span className="text-sm font-medium">{icon || "Current icon (pick one to replace it)"}</span>
                    </div>
                  )}
                  <TextInput sizing="sm" placeholder="Search icons..." value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1" />
                  <div className="mt-3 grid grid-cols-8 gap-2 max-h-[160px] overflow-y-auto p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {filtered.map((i) => (
                      <button key={i} type="button" onClick={() => setIcon(i)} title={i} className={`p-2 rounded-lg grid place-items-center transition ${icon === i ? "bg-primary text-white ring-2 ring-primary" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                        <Icon icon={i} width={22} />
                      </button>
                    ))}
                    {filtered.length === 0 && <p className="col-span-8 text-center text-xs text-gray-400 py-4">No icons found</p>}
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="market-cat-name">Name</Label>
                  <TextInput id="market-cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sneakers, Phones" required className="mt-1" />
                </div>
                <div className="mb-4">
                  <Label htmlFor="market-cat-description">Description (optional)</Label>
                  <Textarea id="market-cat-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What sellers list here" rows={3} className="mt-1" />
                </div>
                <div className="mb-4">
                  <Label htmlFor="market-cat-color">Color</Label>
                  <div className="mt-1 flex items-center gap-3">
                    <input type="color" aria-label="Pick a color" value={color.toLowerCase()} onChange={(e) => pickColor(e.target.value)} className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent p-1" />
                    <TextInput id="market-cat-color" value={colorText} onChange={(e) => changeColorText(e.target.value)} placeholder={DEFAULT_CATEGORY_COLOR} maxLength={7} className="flex-1" />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button color="gray" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
                  <Button color="success" type="submit" disabled={loading || !name.trim() || !hasIcon}>{(loading) && <Spinner size="sm" light />}{submitText}</Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default MarketCategoryFormModal;
