import { getATCPeriods } from "@/app/api/atc";
import ATCSettingsButton from "./ATCSettingsButton";

const Page = async () => {
  const periodsResponse = await getATCPeriods();
  // Assuming the first period is the active/latest one for now
  // In a real scenario, the API might return an explicit "active" field
  const activePeriod = periodsResponse?.data?.periods?.[0]?.value || "";

  return (
    <>
      <div className="">
        <h2 className="text-2xl font-bold mb-6">Africa Talent Challenge Management</h2>
        <p className="text-gray-500 mb-8">Manage the current ATC episode settings and participants.</p>

        <div className="flex justify-start">
          <ATCSettingsButton activePeriod={activePeriod} />
        </div>
      </div>
    </>
  );
};

export default Page;
