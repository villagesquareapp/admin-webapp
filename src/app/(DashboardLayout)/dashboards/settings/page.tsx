import CreateTicketForm from "@/app/components/apps/tickets/CreateTicketForm";
import type { Metadata } from "next";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import { TicketProvider } from "@/app/context/TicketContext/index";
import SettingsComp from "./SettingsComp";

export const metadata: Metadata = {
  title: "Ticket App",
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
const CreateTickets = () => {
  return (
    <>
      <BreadcrumbComp title="Settings" items={BCrumb} />
      <SettingsComp />
    </>
  );
};

export default CreateTickets;
