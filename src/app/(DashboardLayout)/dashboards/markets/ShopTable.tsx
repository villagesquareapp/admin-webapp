"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { updateShopStatus } from "@/app/api/market-square";

const SHOP_STATUS_TONE: Record<string, string> = {
  active: "bg-lightsuccess text-success",
  inactive: "bg-lightwarning text-warning",
  banned: "bg-lighterror text-error",
};

const ShopTable = ({
  shops,
  totalPages,
  currentPage,
  pageSize,
}: {
  shops: IMarketSquareShops[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const col = createColumnHelper<IMarketSquareShops>();

  const setStatus = async (id: string, status: ShopStatus, label: string) => {
    const res = await updateShopStatus(id, status);
    if (res?.status) { toast.success(label); router.refresh(); }
    else toast.error(res?.message || "Action failed");
  };

  const columns = [
    col.accessor("name", {
      header: () => <span>Shop</span>,
      cell: (info) => {
        const s = info.row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative size-10 rounded-full overflow-hidden border border-ld bg-lightgray dark:bg-dark shrink-0">
              {s.logo && <Image src={s.logo} alt="" fill className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[200px]">{s.name}</p>
              <p className="text-xs text-darklink truncate max-w-[200px]">@{s.user?.username || "—"}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${SHOP_STATUS_TONE[i.getValue()] || ""}`}>
          {i.getValue() || "active"}
        </span>
      ),
    }),
    col.accessor("products_count", {
      header: () => <span>Products</span>,
      cell: (i) => <span className="text-sm font-semibold tabular-nums">{i.getValue() || 0}</span>,
    }),
    col.accessor("location", {
      header: () => <span>Location</span>,
      cell: (i) => <span className="text-sm text-darklink truncate max-w-[160px] inline-block">{i.getValue() || "—"}</span>,
    }),
    col.accessor("created_at", {
      header: () => <span>Created</span>,
      cell: (i) => <span className="text-sm text-darklink">{formatDate(i.getValue())}</span>,
    }),
    col.display({
      id: "actions",
      header: () => <span></span>,
      cell: (info) => {
        const s = info.row.original;
        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Dropdown
              label=""
              inline
              dismissOnClick
              renderTrigger={() => (
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><HiOutlineDotsVertical /></button>
              )}
            >
              <Dropdown.Item onClick={() => router.push(`/dashboards/markets/shops/${s.uuid}`)}>View shop</Dropdown.Item>
              {s.status !== "banned" ? (
                <Dropdown.Item onClick={() => setStatus(s.uuid, "banned", "Shop banned")}>Ban shop</Dropdown.Item>
              ) : (
                <Dropdown.Item onClick={() => setStatus(s.uuid, "active", "Shop reinstated")}>Reinstate</Dropdown.Item>
              )}
              {s.status === "active" ? (
                <Dropdown.Item onClick={() => setStatus(s.uuid, "inactive", "Shop deactivated")}>Deactivate</Dropdown.Item>
              ) : s.status === "inactive" ? (
                <Dropdown.Item onClick={() => setStatus(s.uuid, "active", "Shop activated")}>Activate</Dropdown.Item>
              ) : null}
            </Dropdown>
          </div>
        );
      },
    }),
  ];

  return (
    <ReusableTable
      tableData={Array.isArray(shops) ? shops : []}
      columns={columns}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
      dense
      compactTitle
      tableTitle="Shops"
      backTo="/dashboards/markets"
      onRowClick={(row: IMarketSquareShops) => router.push(`/dashboards/markets/shops/${row.uuid}`)}
    />
  );
};

export default ShopTable;
