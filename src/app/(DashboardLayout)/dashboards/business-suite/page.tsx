import { Suspense } from "react";
import { getToken } from "@/lib/getToken";
import SuiteHeader from "./SuiteHeader";
import BusinessSuiteCard from "./BusinessSuiteCard";

// Server-only check that the staff member is signed in; the card needs no token.
const Page = async () => {
  const token = await getToken();

  if (!token) throw new Error("No token found");

  return (
    <div className="flex flex-col gap-5">
      <SuiteHeader title="Business Suite" subtitle="Platform settings, push notifications and the monthly talent challenge." />
      <Suspense
        fallback={
          <div className="h-[220px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
        }
      >
        <BusinessSuiteCard />
      </Suspense>
    </div>
  );
};

export default Page;
