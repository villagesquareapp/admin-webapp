"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";

const money = (p: IMarketProductLite) =>
  p.price == null ? "—" : `${p.currency?.symbol || ""}${new Intl.NumberFormat("en").format(p.price)}`;

const statusFilter = {
  label: "Status",
  key: "status",
  defaultValue: "",
  options: [
    { value: "", label: "All active" },
    { value: "featured", label: "Featured" },
    { value: "out_of_stock", label: "Out of stock" },
    { value: "taken_down", label: "Taken down" },
  ],
};

const ProductTable = ({
  products,
  totalPages,
  currentPage,
  pageSize,
}: {
  products: IMarketProductLite[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const col = createColumnHelper<IMarketProductLite>();

  const columns = [
    col.accessor("title", {
      header: () => <span>Product</span>,
      cell: (info) => {
        const p = info.row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative size-10 rounded-lg overflow-hidden bg-lightgray dark:bg-dark shrink-0">
              {p.image && <Image src={p.image} alt="" fill className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[220px] flex items-center gap-1">
                {p.title}
                {p.featured && <Icon icon="solar:star-bold" className="text-warning" height={13} />}
              </p>
              <p className="text-xs text-darklink truncate max-w-[220px]">@{p.user?.username || "—"}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("shop", {
      header: () => <span>Shop</span>,
      cell: (i) => <span className="text-sm truncate max-w-[140px] inline-block">{i.getValue()?.name || "—"}</span>,
    }),
    col.accessor("category", {
      header: () => <span>Category</span>,
      cell: (i) => <span className="text-sm text-darklink">{i.getValue()?.name || "Uncategorised"}</span>,
    }),
    col.accessor("price", {
      header: () => <span>Price</span>,
      cell: (i) => <span className="text-sm font-semibold tabular-nums">{money(i.row.original)}</span>,
    }),
    col.display({
      id: "state",
      header: () => <span>State</span>,
      cell: (info) => {
        const p = info.row.original;
        return (
          <div className="flex items-center gap-1.5">
            {p.taken_down ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lighterror text-error">Taken down</span>
            ) : p.in_stock ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lightsuccess text-success">In stock</span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lightwarning text-warning">Out of stock</span>
            )}
          </div>
        );
      },
    }),
    col.accessor("created_at", {
      header: () => <span>Listed</span>,
      cell: (i) => <span className="text-sm text-darklink">{formatDate(i.getValue())}</span>,
    }),
  ];

  return (
    <ReusableTable
      tableData={Array.isArray(products) ? products : []}
      columns={columns}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
      dense
      compactTitle
      tableTitle="Products"
      backTo="/dashboards/markets"
      filterDropdowns={[statusFilter]}
      onRowClick={(row: IMarketProductLite) => router.push(`/dashboards/markets/products/${row.uuid}`)}
    />
  );
};

export default ProductTable;
