import { Suspense } from "react";
import { getLevels } from "@/app/api/trybeCampus";
import LevelsContent from "./LevelsContent";

const Wrapper = async ({ kind }: { kind?: string }) => {
  const res = await getLevels({ kind });
  return <LevelsContent levels={res?.data || []} kind={kind} />;
};

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const searchParams = await props.searchParams;
  const kind = (searchParams.kind as string) || undefined;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Levels</h4>
        <p className="text-sm text-darklink">
          One list for every institution. A Campus Trybe offers the active levels of its institution&apos;s kind, in this
          order. Renaming or turning off a level doesn&apos;t change answers students already gave.
        </p>
      </div>
      <Suspense key={kind ?? "all"} fallback={<div className="h-[520px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
        <Wrapper kind={kind} />
      </Suspense>
    </div>
  );
};

export default Page;
