import Link from "next/link";
import { Icon } from "@iconify/react";
import { getReportReasons } from "@/app/api/report";
import ReasonsManager from "./ReasonsManager";

const Page = async () => {
  const res = await getReportReasons();
  return (
    <div className="flex flex-col gap-30">
      <div className="flex items-start gap-2">
        <Link href="/dashboards/reports" className="p-1.5 -ml-1.5 mt-0.5 rounded-full hover:bg-lightgray dark:hover:bg-white/5 text-darklink" aria-label="Back to reports">
          <Icon icon="solar:arrow-left-linear" height={20} />
        </Link>
        <div>
          <h4 className="text-lg font-bold">Report reasons</h4>
          <p className="text-sm text-darklink">
            What people pick when they report something in the app. Turn a reason off to hide it; reports that used it keep it.
          </p>
        </div>
      </div>
      {res?.data ? (
        <ReasonsManager reasons={res.data} />
      ) : (
        <div className="py-16 text-center text-darklink">The reasons couldn&apos;t be loaded. Try again in a moment.</div>
      )}
    </div>
  );
};

export default Page;
