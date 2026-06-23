"use client";

import React, { useState } from "react";
import { Button, Badge, TextInput, Label } from "flowbite-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { FaPlus } from "react-icons/fa";
import CardBox from "@/app/components/shared/CardBox";
import {
  addLivestreamCategory,
  updateLivestreamCategory,
  deleteLivestreamCategory,
  getLivestreamCategories,
} from "@/app/api/livestream";
import { formatDate } from "@/utils/dateUtils";

interface Props {
  initialCategories: ILivestreamCategory[];
}

const LivestreamCategories: React.FC<Props> = ({ initialCategories }) => {
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

  const handleAdd = async (name: string) => {
    setLoading(true);
    try {
      const response = await addLivestreamCategory(name);
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

  const handleEdit = async (name: string) => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const response = await updateLivestreamCategory(selectedCategory.id, name);
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
      <CardBox>
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-lg font-semibold flex gap-2 items-center">
            Livestream Categories
            <Badge color="secondary">{categories.length}</Badge>
          </h5>
          <Button
            color="success"
            size="sm"
            onClick={() => setIsAddOpen(true)}
          >
            <FaPlus size={14} className="mr-2" />
            Add Category
          </Button>
        </div>
        <hr className="dark:border-white/20 mb-4" />

        {categories.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Icon icon="solar:list-broken" width={48} className="mx-auto mb-2 text-gray-400" />
            <p className="text-base font-medium">No categories yet</p>
            <p className="text-sm text-gray-400">Add your first livestream category</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-base text-ld font-semibold text-left border-b border-ld px-4 py-3">
                    Category
                  </th>
                  <th className="text-base text-ld font-semibold text-left border-b border-ld px-4 py-3">
                    Status
                  </th>
                  <th className="text-base text-ld font-semibold text-left border-b border-ld px-4 py-3">
                    Number of Streams
                  </th>
                  <th className="text-base text-ld font-semibold text-left border-b border-ld px-4 py-3">
                    Created At
                  </th>
                  <th className="text-base text-ld font-semibold text-left border-b border-ld px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-darkborder">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-800/10 dark:hover:bg-gray-50/10 transition-colors">
                    <td className="whitespace-nowrap py-3 px-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {category.name}
                      </p>
                    </td>
                    <td className="whitespace-nowrap py-3 px-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          category.status
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {category.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3 px-4">
                      <p className="text-sm text-darklink dark:text-bodytext">
                        {category.streams_count ?? 0}
                      </p>
                    </td>
                    <td className="whitespace-nowrap py-3 px-4">
                      <p className="text-sm text-darklink dark:text-bodytext">
                        {formatDate(category.created_at)}
                      </p>
                    </td>
                    <td className="whitespace-nowrap py-3 px-4">
                      <div className="flex items-center gap-1">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBox>

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
        defaultValue={selectedCategory?.name || ""}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteOpen && (
          <Dialog
            static
            open={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            className="relative z-50"
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

// Reusable form modal for Add/Edit
function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title,
  submitText,
  defaultValue = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  loading: boolean;
  title: string;
  submitText: string;
  defaultValue?: string;
}) {
  const [name, setName] = useState(defaultValue);

  // Reset form when modal opens with new default value
  React.useEffect(() => {
    setName(defaultValue);
  }, [defaultValue, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    onSubmit(name.trim());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={onClose} className="relative z-50">
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
              className="w-full max-w-md rounded-lg bg-white dark:bg-darkgray p-6 shadow-xl"
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
                <div className="mb-4">
                  <Label htmlFor="category-name" value="Category Name" />
                  <TextInput
                    id="category-name"
                    type="text"
                    sizing="md"
                    placeholder="e.g. Music, Gaming, Education"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
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
                    disabled={loading || !name.trim()}
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

export default LivestreamCategories;
