import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import { getSettings } from "@/app/api/setting";
import type { Metadata } from "next";
import SettingsComp from "./SettingsComp";

export const metadata: Metadata = {
  title: "Settings",
};

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Settings",
  },
];
const CreateTickets = async () => {
  const settings: ISettingsResponse | null = await getSettings();

  return (
    <>
      <BreadcrumbComp title="Settings" items={BCrumb} />
      <SettingsComp
        settings={settings && Array.isArray(settings?.data) ? settings?.data : null}
      />
    </>
  );
};

export default CreateTickets;
