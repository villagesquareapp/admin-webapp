import CrmMarketingReport from "@/app/components/dashboards/crm/CrmMareketingReport";
import CurrentBalance from "@/app/components/dashboards/crm/CurrentBalance";
import DeliveryAnalytics from "@/app/components/dashboards/crm/DeliveryAnalytics";
import EarningReports from "@/app/components/dashboards/crm/EarningReports";
import OverallBalance from "@/app/components/dashboards/crm/OverallBalance";
import PaymentMethods from "@/app/components/dashboards/crm/PaymentMethods";
import RecentProjects from "@/app/components/dashboards/crm/RecentProjects";
import ReturnOnInvest from "@/app/components/dashboards/crm/ReturnOnInvest";
import TotalFollowers from "@/app/components/dashboards/crm/TotalFollowers";
import TotalIncome from "@/app/components/dashboards/crm/TotalIncome";
import React from "react";
import type { Metadata } from "next";
import CowryOverallBalance from "./CowryOverallBalance";
import RecentCowryTransfer from "./RecentCowryTransfer";
import PaystackOverallBalance from "./PaystackOverallBalance";
import { getCowryBalance, getPaystackBalance } from "@/app/api/wallet";
export const metadata: Metadata = {
  title: "Village Square Admin Dashboard",
  description: "",
};
const Page = async () => {
  const [paystackStat] = await Promise.all([getPaystackBalance()]);
  const [cowryStat] = await Promise.all([getCowryBalance()]);
  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className='col-span-12'>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaystackOverallBalance paystackValue={paystackStat?.data ?? null} />
            <CowryOverallBalance cowryValue={cowryStat?.data ?? null} />
          </div>
        </div>
        {/* <div className="lg:col-span-4 col-span-12">
          <ReturnOnInvest />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <TotalFollowers />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <TotalIncome />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <CurrentBalance />
        </div>
        <div className="lg:col-span-5 col-span-12">
          <CrmMarketingReport />
        </div>
        <div className="lg:col-span-7 col-span-12">
          <PaymentMethods />
        </div> */}
        <div className="col-span-12">
          <RecentCowryTransfer />
        </div>
        {/* <div className="lg:col-span-8 col-span-12">
          <DeliveryAnalytics />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <EarningReports />
        </div> */}
      </div>
    </>
  );
};
export default Page;
