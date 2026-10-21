"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@/utils/table";
import { Icon } from "@iconify/react";
import { Badge, ToggleSwitch } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import type { CategoryScope } from "@/utils/categoryScope";
import PostCategoryFormModal, { PostCategoryFormData } from "./PostCategoryFormModal";
import { addPostCategory, reorderPostCategories, updatePostCategory } from "@/app/api/post-categories";

type Result = { status: boolean; message?: string } | null;

// Categories are turned off rather than deleted, because posts keep pointing at them.
const PostCategoryTable = ({ categories, scope }: { categories: IPostCategory[]; scope: CategoryScope }) => {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editCat, setEditCat] = useState<IPostCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (work: () => Promise<Result>, done: string) => {
    setBusy(true);
    try {
      const res = await work();
      if (res?.status) {
        toast.success(done);
        router.refresh();
        return true;
      }
      toast.error(res?.message || "Something went wrong");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
    return false;
  };

  const handleAdd = async (data: PostCategoryFormData) => {
    setLoading(true);
    try {
      const res = await addPostCategory({
        name: data.name,
        ...(data.slug ? { slug: data.slug } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.icon ? { icon: data.icon } : {}),
        is_anonymous: data.is_anonymous,
        is_enabled: data.is_enabled,
        ...(scope.trybeTypeId ? { trybe_type_id: scope.trybeTypeId } : {}),
      });
      if (res?.status) { toast.success("Category added"); setAddOpen(false); router.refresh(); }
      else toast.error(res?.message || "Failed to add category");
    } finally { setLoading(false); }
  };

  // Only what changed is sent; an empty description or icon clears it.
  const handleEdit = async (data: PostCategoryFormData) => {
    if (!editCat) return;
    const changes = {
      ...(data.name !== editCat.name ? { name: data.name } : {}),
      ...(data.description !== (editCat.description ?? "") ? { description: data.description } : {}),
      ...(data.icon !== (editCat.icon ?? "") ? { icon: data.icon } : {}),
      ...(data.is_anonymous !== editCat.is_anonymous ? { is_anonymous: data.is_anonymous } : {}),
      ...(data.is_enabled !== editCat.is_enabled ? { is_enabled: data.is_enabled } : {}),
    };
    if (!Object.keys(changes).length) return setEditCat(null);
    setLoading(true);
    try {
      const res = await updatePostCategory(editCat.id, changes);
      if (res?.status) { toast.success("Category updated"); setEditCat(null); router.refresh(); }
      else toast.error(res?.message || "Failed to update category");
    } finally { setLoading(false); }
  };

  const move = (index: number, by: -1 | 1) => {
    const ids = categories.map((c) => c.id);
    [ids[index], ids[index + by]] = [ids[index + by], ids[index]];
    run(() => reorderPostCategories(scope.type, ids), "Order saved");
  };

  const toggle = (cat: IPostCategory, on: boolean) =>
    run(() => updatePostCategory(cat.id, { is_enabled: on }), on ? `${cat.name} turned on` : `${cat.name} turned off`);

  const col = createColumnHelper<IPostCategory>();
  const columns = [
    col.display({
      id: "order",
      header: () => <span>Order</span>,
      cell: (info) => {
        const i = info.row.index;
        return (
          <div className="flex items-center gap-0.5">
            <button type="button" aria-label="Move up" title="Move up" disabled={busy || i === 0} onClick={() => move(i, -1)} className="p-1 rounded hover:bg-lightprimary hover:text-primary text-darklink disabled:opacity-30 disabled:pointer-events-none">
              <Icon icon="solar:alt-arrow-up-linear" height={18} />
            </button>
            <button type="button" aria-label="Move down" title="Move down" disabled={busy || i === categories.length - 1} onClick={() => move(i, 1)} className="p-1 rounded hover:bg-lightprimary hover:text-primary text-darklink disabled:opacity-30 disabled:pointer-events-none">
              <Icon icon="solar:alt-arrow-down-linear" height={18} />
            </button>
          </div>
        );
      },
    }),
    col.accessor("name", {
      header: () => <span>Category</span>,
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-lightprimary grid place-items-center shrink-0">
            <Icon icon={info.row.original.icon || "solar:hashtag-square-linear"} width={20} className="text-primary" />
          </div>
          <span className="font-medium">{info.getValue()}</span>
          {info.row.original.is_anonymous && <Badge color="purple">Anonymous</Badge>}
        </div>
      ),
    }),
    col.accessor("slug", {
      header: () => <span>Slug</span>,
      cell: (info) => <code className="text-xs text-darklink">{info.getValue()}</code>,
    }),
    col.accessor("description", {
      header: () => <span>Description</span>,
      cell: (info) => (
        <span className="block max-w-[260px] truncate text-sm text-darklink" title={info.getValue() ?? undefined}>
          {info.getValue() || "—"}
        </span>
      ),
    }),
    col.accessor("posts_count", {
      header: () => <span>Posts</span>,
      cell: (info) => <span className="text-sm font-semibold tabular-nums">{info.getValue() ?? 0}</span>,
    }),
    col.accessor("is_enabled", {
      header: () => <span>Enabled</span>,
      cell: (info) => <ToggleSwitch checked={info.getValue()} disabled={busy} onChange={(on) => toggle(info.row.original, on)} />,
    }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setEditCat(info.row.original)} className="p-2 rounded-lg hover:bg-lightprimary hover:text-primary text-darklink" title="Edit">
            <Icon icon="solar:pen-new-square-linear" height={17} />
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
        tableTitle={`Post Categories · ${scope.label}`}
        backTo="/dashboards/posts"
        extraButtons={
          <Button onClick={() => setAddOpen(true)}>
            <FaPlus className="mr-2" /> Add category
          </Button>
        }
      />
      <PostCategoryFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        loading={loading}
        title={`Add Post Category · ${scope.label}`}
        submitText="Add"
      />
      <PostCategoryFormModal
        isOpen={!!editCat}
        onClose={() => setEditCat(null)}
        onSubmit={handleEdit}
        loading={loading}
        title="Edit Post Category"
        submitText="Save"
        category={editCat}
      />
    </div>
  );
};

export default PostCategoryTable;
