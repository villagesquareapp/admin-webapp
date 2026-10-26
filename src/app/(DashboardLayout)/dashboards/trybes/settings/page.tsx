import { getTrybeCode } from "@/app/api/trybeCampus";
import { getTrybeTypes } from "@/app/api/trybes";
import CampusSettingsContent from "./CampusSettingsContent";

const Page = async () => {
  const [code, types] = await Promise.all([getTrybeCode(), getTrybeTypes()]);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Campus settings</h4>
        <p className="text-sm text-darklink">
          The Trybe Code everyone agrees to before joining a Trybe, and where the rest of the Campus setup lives.
        </p>
      </div>
      <CampusSettingsContent code={code?.data ?? null} campus={(types?.data || []).find((t) => t.slug === "campus") ?? null} />
    </div>
  );
};

export default Page;
