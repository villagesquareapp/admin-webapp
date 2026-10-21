import { Suspense } from "react";
import { getInstitution } from "@/app/api/trybeCampus";
import InstitutionDetailContent from "./InstitutionDetailContent";

const Wrapper = async ({ id }: { id: string }) => {
  const res = await getInstitution(id);
  return <InstitutionDetailContent institution={res?.data ?? null} />;
};

const Page = async (props: { params: Promise<{ institution_id: string }> }) => {
  const params = await props.params;
  return (
    <Suspense
      key={params.institution_id}
      fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper id={params.institution_id} />
    </Suspense>
  );
};

export default Page;
