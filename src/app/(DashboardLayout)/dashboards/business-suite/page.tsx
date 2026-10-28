import { Suspense } from "react";
import { getToken } from "@/lib/getToken";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import BusinessSuiteCard from "./BusinessSuiteCard";

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Business Suite" },
];

// Server-only check that the staff member is signed in; the card needs no token.
const Page = async () => {
  const token = await getToken();

  if (!token) throw new Error("No token found");

  return (
    <>
      <BreadcrumbComp title="Business Suite" items={BCrumb} />
      <Suspense
        fallback={
          <div className="h-[220px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
        }
      >
        <BusinessSuiteCard />
      </Suspense>
    </>
  );
};

export default Page;
