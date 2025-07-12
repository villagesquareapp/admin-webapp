import React from "react";
import { getRandomUsers } from "@/app/api/user";
import RandomUserTable from "./RandomUserTable";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;

  const [users] = await Promise.all([getRandomUsers(page, limit)]);
  
  return (
    <div className="col-span-12">
      <RandomUserTable
        users={users?.data || null}
        totalPages={users?.data?.last_page || 1}
        currentPage={page}
        pageSize={limit}
      />
    </div>
  );
};

export default Page;
