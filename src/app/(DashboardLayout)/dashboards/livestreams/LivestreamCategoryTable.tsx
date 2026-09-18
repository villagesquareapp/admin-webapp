"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Button } from "flowbite-react";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { CategoryFormModal } from "./ManageCategoriesModal";
import {
  addLivestreamCategory,
  updateLivestreamCategory,
  deleteLivestreamCategory,
} from "@/app/api/livestream";

const LivestreamCategoryTable = ({ categories }: { categories: ILivestreamCategory[] }) => {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editCat, setEditCat] = useState<ILivestreamCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const afterWrite = () => router.refresh();

  const handleAdd = async (data: { name: string; description: string; icon: string }) => {
    setLoading(true);
    try {
      const res = await addLivestreamCategory(data.name, data.description, data.icon);
      if (res?.status) { toast.success("Category added"); setAddOpen(false); afterWrite(); }
      else toast.error(res?.message || "Failed to add category");
    } finally { setLoading(false); }
  };

  const handleEdit = async (data: { name: string; description: string; icon: string }) => {
    if (!editCat) return;
    setLoading(true);
    try {
      const res = await updateLivestreamCategory(editCat.id, { name: data.name, description: data.description, icon: data.icon || undefined });
      if (res?.status) { toast.success("Category updated"); setEditCat(null); afterWrite(); }
      else toast.error(res?.message || "Failed to update category");
    } finally { setLoading(false); }
  };

  const handleDelete = async (cat: ILivestreamCategory) => {
    if (!window.confirm(`Delete "${cat.name}"? This can't be undone.`)) return;
    const res = await deleteLivestreamCategory(cat.id);
    if (res?.status) { toast.success("Category deleted"); afterWrite(); }
    else toast.error(res?.message || "Failed to delete");
  };

  const col = createColumnHelper<ILivestreamCategory>();
  const columns = [
    col.accessor("name", {
      header: () => <span>Category</span>,
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-lightprimary grid place-items-center shrink-0">
            <Icon icon={info.row.original.icon_id || "solar:gallery-broken"} width={20} className="text-primary" />
          </div>
          <span className="font-medium">{info.getValue()}</span>
        </div>
      ),
    }),
    col.accessor("description", {
      header: () => <span>Description</span>,
      cell: (info) => <span className="text-sm text-darklink line-clamp-1 max-w-[280px]">{info.getValue() || "—"}</span>,
    }),
    col.accessor("streams_count", {
      header: () => <span>Streams</span>,
      cell: (info) => <span className="text-sm font-semibold tabular-nums">{info.getValue() ?? 0}</span>,
    }),
    col.accessor("created_at", {
      header: () => <span>Created</span>,
      cell: (info) => <span className="text-sm text-darklink">{info.getValue() ? formatDate(info.getValue()!) : "—"}</span>,
    }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setEditCat(info.row.original)} className="qa-btn p-2 rounded-lg hover:bg-lightprimary hover:text-primary text-darklink" title="Edit">
            <Icon icon="solar:pen-new-square-linear" height={17} />
          </button>
          <button onClick={() => handleDelete(info.row.original)} className="p-2 rounded-lg hover:bg-lighterror hover:text-error text-darklink" title="Delete">
            <Icon icon="solar:trash-bin-trash-linear" height={17} />
          </button>
        </div>
      ),
    }),
  ];

  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={Array.isArray(categories) ? categories : []}
        columns={columns}
        totalPages={1}
        currentPage={1}
        pageSize={categories.length || 1}
        dense
        tableTitle="Livestream Categories"
        backTo="/dashboards/livestreams"
        extraButtons={
          <Button onClick={() => setAddOpen(true)}>
            <FaPlus className="mr-2" /> Add category
          </Button>
        }
      />

      <CategoryFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        loading={loading}
        title="Add Category"
        submitText="Add"
      />
      <CategoryFormModal
        isOpen={!!editCat}
        onClose={() => setEditCat(null)}
        onSubmit={handleEdit}
        loading={loading}
        title="Edit Category"
        submitText="Save"
        defaultName={editCat?.name || ""}
        defaultDescription={editCat?.description || ""}
        defaultIcon={editCat?.icon_id || ""}
      />
    </div>
  );
};

export default LivestreamCategoryTable;
