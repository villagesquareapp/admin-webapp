import { getMeetingHosts } from "@/app/api/meetings";
import HostsContent from "./HostsContent";

const Page = async () => {
  const res = await getMeetingHosts();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Meeting hosts</h4>
        <p className="text-sm text-darklink">
          Accounts that can start meetings on VillageSquare Meet. Anyone with the link can join as a guest.
        </p>
      </div>
      <HostsContent hosts={res?.data ?? []} message={res?.data ? undefined : res?.message} />
    </div>
  );
};

export default Page;
