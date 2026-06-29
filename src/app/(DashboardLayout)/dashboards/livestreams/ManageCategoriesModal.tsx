"use client";

import React, { useState } from "react";
import { Button, TextInput, Label, Textarea } from "flowbite-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { FaPlus } from "react-icons/fa";
import {
  addLivestreamCategory,
  updateLivestreamCategory,
  deleteLivestreamCategory,
  getLivestreamCategories,
} from "@/app/api/livestream";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCategories: ILivestreamCategory[];
}

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
}

const ManageCategoriesModal: React.FC<Props> = ({ isOpen, onClose, initialCategories }) => {
  const [categories, setCategories] = useState<ILivestreamCategory[]>(initialCategories);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ILivestreamCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getLivestreamCategories();
      if (res?.data && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleAdd = async (data: CategoryFormData) => {
    if (!data.icon) {
      toast.error("Please select an icon");
      return;
    }
    setLoading(true);
    try {
      const response = await addLivestreamCategory(data.name, data.description, data.icon);
      if (response?.status) {
        toast.success("Category added successfully!");
        await fetchCategories();
        setIsAddOpen(false);
      } else {
        toast.error(response?.message || "Failed to add category");
      }
    } catch (error) {
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data: CategoryFormData) => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const response = await updateLivestreamCategory(selectedCategory.id, {
        name: data.name,
        description: data.description,
        icon: data.icon || undefined,
      });
      if (response?.status) {
        toast.success("Category updated successfully!");
        await fetchCategories();
        setIsEditOpen(false);
        setSelectedCategory(null);
      } else {
        toast.error(response?.message || "Failed to update category");
      }
    } catch (error) {
      toast.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const response = await deleteLivestreamCategory(selectedCategory.id);
      if (response?.status) {
        toast.success("Category deleted successfully!");
        await fetchCategories();
        setIsDeleteOpen(false);
        setSelectedCategory(null);
      } else {
        toast.error(response?.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main Manage Modal */}
      <AnimatePresence>
        {isOpen && (
          <Dialog
            static
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-white dark:bg-darkgray shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                  <DialogTitle className="text-xl font-bold">
                    Manage Livestream Categories
                  </DialogTitle>
                  <div className="flex items-center gap-3">
                    <Button
                      color="success"
                      size="sm"
                      onClick={() => setIsAddOpen(true)}
                    >
                      <FaPlus size={12} className="mr-2" />
                      Add Category
                    </Button>
                    <button
                      onClick={onClose}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Icon icon="solar:close-circle-bold" height={24} />
                    </button>
                  </div>
                </div>

                {/* Category List */}
                <div className="flex-1 overflow-y-auto p-6">
                  {categories.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <Icon icon="solar:list-broken" width={48} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-base font-medium">No categories yet</p>
                      <p className="text-sm text-gray-400">Add your first livestream category</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                              {category.icon_id ? (
                                <Icon icon={category.icon_id} width={28} className="text-primary" />
                              ) : (
                                <Icon icon="solar:gallery-broken" width={20} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-800 dark:text-white">
                                {category.name}
                              </h6>
                              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[300px] truncate">
                                {category.description || "No description"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                category.status
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {category.status ? "Active" : "Inactive"}
                            </span> */}
                            <button
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsEditOpen(true);
                              }}
                              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Icon icon="solar:pen-new-square-broken" width={18} className="text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsDeleteOpen(true);
                              }}
                              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Icon icon="solar:trash-bin-minimalistic-outline" width={18} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <CategoryFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
        loading={loading}
        title="Add New Category"
        submitText="Add"
      />

      {/* Edit Category Modal */}
      <CategoryFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleEdit}
        loading={loading}
        title="Edit Category"
        submitText="Save"
        defaultName={selectedCategory?.name || ""}
        defaultDescription={selectedCategory?.description || ""}
        defaultIcon={selectedCategory?.icon_id || ""}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteOpen && (
          <Dialog
            static
            open={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            className="relative z-[60]"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm rounded-lg bg-white dark:bg-darkgray p-6 shadow-xl"
              >
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Category
                </DialogTitle>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete <strong>{selectedCategory?.name}</strong>? This action cannot be undone.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    color="gray"
                    size="sm"
                    onClick={() => {
                      setIsDeleteOpen(false);
                      setSelectedCategory(null);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="failure"
                    size="sm"
                    onClick={handleDelete}
                    isProcessing={loading}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

// Popular icons for livestream categories
const POPULAR_ICONS = [
  "mdi:account-group",
  "mdi:gamepad-variant",
  "mdi:microphone",
  "mdi:music",
  "mdi:palette",
  "mdi:school",
  "mdi:food",
  "mdi:basketball",
  "mdi:laptop",
  "mdi:camera",
  "mdi:heart",
  "mdi:star",
  "mdi:film",
  "mdi:book-open-variant",
  "mdi:yoga",
  "mdi:dumbbell",
  "mdi:shopping",
  "mdi:car",
  "mdi:airplane",
  "mdi:earth",
  "mdi:flower",
  "mdi:guitar-electric",
  "mdi:headphones",
  "mdi:chat",
  "mdi:lightbulb",
  "mdi:rocket",
  "mdi:trophy",
  "mdi:brush",
  "mdi:code-tags",
  "mdi:cash",
  "mdi:hand-heart",
  "mdi:dog",
];

// Reusable form modal for Add/Edit with Icon Picker
function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title,
  submitText,
  defaultName = "",
  defaultDescription = "",
  defaultIcon = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  loading: boolean;
  title: string;
  submitText: string;
  defaultName?: string;
  defaultDescription?: string;
  defaultIcon?: string;
}) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [selectedIcon, setSelectedIcon] = useState(defaultIcon);
  const [iconSearch, setIconSearch] = useState("");

  React.useEffect(() => {
    setName(defaultName);
    setDescription(defaultDescription);
    setSelectedIcon(defaultIcon);
    setIconSearch("");
  }, [defaultName, defaultDescription, defaultIcon, isOpen]);

  const filteredIcons = iconSearch.trim()
    ? POPULAR_ICONS.filter((icon) =>
        icon.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : POPULAR_ICONS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!selectedIcon) {
      toast.error("Please select an icon");
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim(), icon: selectedIcon });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={onClose} className="relative z-[60]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-darkgray p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <DialogTitle className="text-xl font-semibold">
                  {title}
                </DialogTitle>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Icon Picker */}
                <div className="mb-4">
                  <Label value="Select Icon" />
                  
                  {/* Selected icon preview */}
                  {selectedIcon && (
                    <div className="mt-2 mb-3 flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Icon icon={selectedIcon} width={32} className="text-primary" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedIcon}
                      </span>
                    </div>
                  )}

                  {/* Search icons */}
                  <TextInput
                    type="text"
                    sizing="sm"
                    placeholder="Search icons..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="mt-2"
                  />

                  {/* Icon grid */}
                  <div className="mt-3 grid grid-cols-8 gap-2 max-h-[160px] overflow-y-auto p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {filteredIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                          selectedIcon === icon
                            ? "bg-primary text-white ring-2 ring-primary ring-offset-1"
                            : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                        title={icon}
                      >
                        <Icon icon={icon} width={22} />
                      </button>
                    ))}
                    {filteredIcons.length === 0 && (
                      <p className="col-span-8 text-center text-xs text-gray-400 py-4">
                        No icons found
                      </p>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <Label htmlFor="category-name" value="Title" />
                  <TextInput
                    id="category-name"
                    type="text"
                    sizing="md"
                    placeholder="e.g. Social, Gaming, Beauty"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <Label htmlFor="category-description" value="Description" />
                  <Textarea
                    id="category-description"
                    placeholder="e.g. Chatting, Q&A, updates"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button color="gray" type="button" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    color="success"
                    type="submit"
                    isProcessing={loading}
                    disabled={loading || !name.trim() || !description.trim() || !selectedIcon}
                  >
                    {loading ? "Processing..." : submitText}
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

export default ManageCategoriesModal;
