import { Suspense } from "react";
import { getToken } from "@/lib/getToken";
import BusinessSuiteCard from "./BusinessSuiteCard";

const BusinessSuiteWrapper = ({ token }: { token: string }) => {
  return <BusinessSuiteCard token={token} />;
};

const Page = async () => {
  const token = await getToken();

  if (!token) throw new Error("No token found");

  return (
    <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <BusinessSuiteWrapper token={token} />
    </Suspense>
  );
};

export default Page;
