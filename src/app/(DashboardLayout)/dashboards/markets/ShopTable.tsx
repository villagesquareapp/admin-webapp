"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { Icon } from "@iconify/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Dropdown } from "flowbite-react";
import Image from "next/image";

const ShopTable = ({
  shops,
  totalPages,
  currentPage,
  pageSize,
}: {
  shops: IMarketSquareShopsResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const columnHelper = createColumnHelper<IMarketSquareShops>();

  const columns = [
    columnHelper.accessor("logo", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="relative size-10 border dark:border/20 rounded-full">
            {!!info.getValue() && (
              <Image
                src={info.getValue()}
                alt="icon"
                fill
                className="rounded-full object-cover"
              />
            )}
          </div>

          <div className="truncat line-clamp-2 sm:max-w-56">
            <h6 className="text-base">{info.row.original.name}</h6>
          </div>
        </div>
      ),
      header: () => <span>Shop</span>,
    }),
    columnHelper.accessor("tagline", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || "-"}</p>
      ),
      header: () => <span>Tagline</span>,
    }),
    columnHelper.accessor("location", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || "-"}</p>
      ),
      header: () => <span>Location</span>,
    }),
    columnHelper.accessor("address", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || "-"}</p>
      ),
      header: () => <span>Address</span>,
    }),
    columnHelper.accessor("products", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.row.original.products.length || 0}
        </p>
      ),
      header: () => <span>Products</span>,
    }),
    columnHelper.accessor("created_at", {
      cell: (info) => {
        return (
          <p className="text-darklink dark:text-bodytext text-sm">
            {formatDate(info.getValue())}
          </p>
        );
      },
      header: () => <span>Date Added</span>,
    }),
    // columnHelper.accessor("actions", {
    //   cell: () => (
    //     <Dropdown
    //       label=""
    //       dismissOnClick={false}
    //       renderTrigger={() => (
    //         <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
    //           <IconDotsVertical size={22} />
    //         </span>
    //       )}
    //     >
    //       {[
    //         { icon: "solar:add-circle-outline", listtitle: "Add" },
    //         { icon: "solar:pen-new-square-broken", listtitle: "Edit" },
    //         { icon: "solar:trash-bin-minimalistic-outline", listtitle: "Delete" },
    //       ].map((item, index) => (
    //         <Dropdown.Item key={index} className="flex gap-3">
    //           <Icon icon={item.icon} height={18} />
    //           <span>{item.listtitle}</span>
    //         </Dropdown.Item>
    //       ))}
    //     </Dropdown>
    //   ),
    //   header: () => <span></span>,
    // }),
  ];
  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={shops?.data && Array.isArray(shops?.data) ? shops?.data : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default ShopTable;
