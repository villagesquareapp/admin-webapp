import React, { Suspense } from "react";
import { getRandomUsers } from "@/app/api/user";
import RandomUserTable from "./RandomUserTable";
export const dynamic = "force-dynamic";

const Page = async () => {
  return (
    <>
      <div className="col-span-12">
        <Suspense fallback={<div>Loading users...</div>}>
          <RandomUserTable

          // totalPages={randomUsers?.data || 1}
          // currentPage={page}
          // pageSize={limit}
          />
        </Suspense>
      </div>
    </>
  );
};

export default Page;
