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
import EchoCategoryFormModal from "./EchoCategoryFormModal";
import { addEchoCategory, deleteEchoCategory } from "@/app/api/echo";

const EchoCategoryTable = ({ categories }: { categories: IEchoCategory[] }) => {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (data: { name: string; icon: string }) => {
    setLoading(true);
    try {
      const res = await addEchoCategory(data);
      if (res?.status) { toast.success("Category added"); setAddOpen(false); router.refresh(); }
      else toast.error(res?.message || "Failed to add category");
    } finally { setLoading(false); }
  };

  const handleDelete = async (cat: IEchoCategory) => {
    if (!window.confirm(`Delete "${cat.name}"? This can't be undone.`)) return;
    const res = await deleteEchoCategory(cat.id);
    if (res?.status) { toast.success("Category deleted"); router.refresh(); }
    else toast.error(res?.message || "Failed to delete");
  };

  const col = createColumnHelper<IEchoCategory>();
  const columns = [
    col.accessor("name", {
      header: () => <span>Category</span>,
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-lightprimary grid place-items-center shrink-0">
            <Icon icon={info.row.original.icon || "solar:microphone-linear"} width={20} className="text-primary" />
          </div>
          <span className="font-medium">{info.getValue()}</span>
        </div>
      ),
    }),
    col.accessor("echoes_count", {
      header: () => <span>Echoes</span>,
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
        <div className="flex items-center justify-end">
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
        tableTitle="Echo Categories"
        backTo="/dashboards/echoes"
        extraButtons={
          <Button onClick={() => setAddOpen(true)}>
            <FaPlus className="mr-2" /> Add category
          </Button>
        }
      />
      <EchoCategoryFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        loading={loading}
        title="Add Echo Category"
        submitText="Add"
      />
    </div>
  );
};

export default EchoCategoryTable;
