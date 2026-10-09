import { Suspense } from "react";
import { getTrybesOverview } from "@/app/api/trybes";
import TrybesOverview from "./TrybesOverview";

const Wrapper = async () => {
  const res = await getTrybesOverview();
  return <TrybesOverview data={res?.status ? (res.data ?? null) : null} message={res?.message} />;
};

const Page = () => (
  <div className="flex flex-col gap-4">
    <div>
      <h4 className="text-lg font-bold">Trybes overview</h4>
      <p className="text-sm text-darklink">How Trybes are doing, and where staff are needed.</p>
    </div>
    <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper />
    </Suspense>
  </div>
);

export default Page;
