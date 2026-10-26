import { Suspense } from "react";
import { getToken } from "@/lib/getToken";
import BusinessSuiteCard from "./BusinessSuiteCard";

// Server-only check that the staff member is signed in; the card needs no token.

const Page = async () => {
  const token = await getToken();

  if (!token) throw new Error("No token found");

  return (
    <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <BusinessSuiteCard />
    </Suspense>
  );
};

export default Page;
