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
import type { CategoryScope } from "@/utils/categoryScope";
import MarketCategoryFormModal, { DEFAULT_CATEGORY_COLOR, isHexColor, MarketCategoryFormData } from "./MarketCategoryFormModal";
import { addMarketSquareCategory, updateMarketSquareCategory, deleteMarketSquareCategory } from "@/app/api/market-square";

const CategoryIcon = ({ cat }: { cat: IMarketCategory }) => {
  const color = isHexColor(cat.color) ? cat.color : undefined;
  return (
    <div
      className="w-9 h-9 rounded-lg bg-lightprimary text-primary grid place-items-center shrink-0 overflow-hidden"
      style={color ? { backgroundColor: `${color}1A`, color } : undefined}
    >
      {cat.icon_id ? (
        <Icon icon={cat.icon_id} width={20} />
      ) : cat.icon ? (
        <img src={cat.icon} alt="" className="w-5 h-5 object-contain" />
      ) : (
        <Icon icon="solar:bag-4-linear" width={20} />
      )}
    </div>
  );
};

const MarketCategoryTable = ({ categories, scope }: { categories: IMarketCategory[]; scope: CategoryScope }) => {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editCat, setEditCat] = useState<IMarketCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (data: MarketCategoryFormData) => {
    setLoading(true);
    try {
      const res = await addMarketSquareCategory({
        name: data.name,
        description: data.description || undefined,
        icon: data.icon || undefined,
        color: data.color,
        ...(scope.trybeTypeId ? { trybe_type_id: scope.trybeTypeId } : {}),
      });
      if (res?.status) { toast.success("Category added"); setAddOpen(false); router.refresh(); }
      else toast.error(res?.message || "Failed to add category");
    } finally { setLoading(false); }
  };

  const handleEdit = async (data: MarketCategoryFormData) => {
    if (!editCat) return;
    setLoading(true);
    try {
      const res = await updateMarketSquareCategory(editCat.id, {
        name: data.name,
        // Sent only when changed, so an untouched empty description isn't posted as "".
        description: data.description !== (editCat.description || "") ? data.description : undefined,
        icon: data.icon || undefined,
        color: data.color,
      });
      if (res?.status) { toast.success("Category updated"); setEditCat(null); router.refresh(); }
      else toast.error(res?.message || "Failed to update category");
    } finally { setLoading(false); }
  };

  const handleDelete = async (cat: IMarketCategory) => {
    if (!window.confirm(`Delete "${cat.name}"? This can't be undone.`)) return;
    const res = await deleteMarketSquareCategory(cat.id);
    if (res?.status) { toast.success("Category deleted"); router.refresh(); }
    else toast.error(res?.message || "Failed to delete");
  };

  const col = createColumnHelper<IMarketCategory>();
  const columns = [
    col.accessor("name", {
      header: () => <span>Category</span>,
      cell: (info) => (
        <div className="flex items-center gap-3">
          <CategoryIcon cat={info.row.original} />
          <span className="font-medium">{info.getValue()}</span>
        </div>
      ),
    }),
    col.accessor("description", {
      header: () => <span>Description</span>,
      cell: (info) => <span className="text-sm text-darklink line-clamp-1 max-w-[280px]">{info.getValue() || "—"}</span>,
    }),
    col.accessor("color", {
      header: () => <span>Color</span>,
      cell: (info) => {
        const color = info.getValue();
        return color ? (
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md border border-ld shrink-0" style={{ backgroundColor: color }} />
            <span className="text-sm text-darklink font-mono uppercase">{color}</span>
          </div>
        ) : <span className="text-sm text-darklink">—</span>;
      },
    }),
    col.accessor("products_count", {
      header: () => <span>Products</span>,
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
          <button onClick={() => setEditCat(info.row.original)} className="p-2 rounded-lg hover:bg-lightprimary hover:text-primary text-darklink" title="Edit">
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
        tableTitle={`MarketSquare Categories · ${scope.label}`}
        backTo="/dashboards/markets"
        extraButtons={
          <Button onClick={() => setAddOpen(true)}>
            <FaPlus className="mr-2" /> Add category
          </Button>
        }
      />
      <MarketCategoryFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        loading={loading}
        title={`Add MarketSquare Category · ${scope.label}`}
        submitText="Add"
      />
      <MarketCategoryFormModal
        isOpen={!!editCat}
        onClose={() => setEditCat(null)}
        onSubmit={handleEdit}
        loading={loading}
        title="Edit MarketSquare Category"
        submitText="Save"
        defaultName={editCat?.name || ""}
        defaultDescription={editCat?.description || ""}
        defaultIcon={editCat?.icon_id || ""}
        defaultColor={isHexColor(editCat?.color) ? editCat.color.toUpperCase() : DEFAULT_CATEGORY_COLOR}
        currentIconUrl={editCat?.icon_id ? null : editCat?.icon}
      />
    </div>
  );
};

export default MarketCategoryTable;
