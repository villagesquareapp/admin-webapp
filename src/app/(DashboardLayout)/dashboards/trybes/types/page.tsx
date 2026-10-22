import { getTrybeTypes } from "@/app/api/trybes";
import TrybeTypesContent from "./TrybeTypesContent";

const Page = async () => {
  const res = await getTrybeTypes();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Trybe types</h4>
        <p className="text-sm text-darklink">
          Kinds of Trybe. Only enabled types show in the app; disabling one hides its Trybes from Explore and stops new
          requests, but members keep access.
        </p>
      </div>
      <TrybeTypesContent types={res?.data || []} />
    </div>
  );
};

export default Page;
