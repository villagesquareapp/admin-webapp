import React from "react";
import { getRandomUsers } from "@/app/api/user";
import RandomUserTable from "./RandomUserTable";

const Page = async () => {
 
  
  return (
    <div className="col-span-12">
      <RandomUserTable
        
        // totalPages={randomUsers?.data || 1}
        // currentPage={page}
        // pageSize={limit}
      />
    </div>
  );
};

export default Page;
