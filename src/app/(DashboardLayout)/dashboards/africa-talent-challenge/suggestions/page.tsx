import { Suspense } from "react";
import { getATCSuggestions } from "@/app/api/atc";
import SuggestionsView from "./SuggestionsView";

const Wrapper = async () => {
  const res = await getATCSuggestions();
  return <SuggestionsView data={res?.data || null} />;
};

const Page = async () => (
  <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
    <Wrapper />
  </Suspense>
);

export default Page;
