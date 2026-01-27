import { getUserStats, getUsers } from "@/app/api/user";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import ATCTable from "./ATCTable";
// import UserProfileWrapper from "./UserProfileWrapper";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";
import StatsWithMonthsFilter from "./StatsWithMonthsFilter";

import SearchAndFilter from "./SearchAndFilter";
import { getATCStats, getATCApplications } from "@/app/api/atc";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const applicationId = searchParams.applicationId as string;
  const search = searchParams.search as string;
  const status = searchParams.status as string;

  const [atcStats, applications] = await Promise.all([
    getATCStats(),
    getATCApplications(undefined, status, search, page, limit),
  ]);

  const selectedApplication =
    applicationId && applications?.data?.data
      ? applications.data.data.find(
        (app: IATCApplication) => app.uuid === applicationId
      )
      : null;

  const overviewData: IOverviewData[] = [
    {
      total: atcStats?.data?.applications?.overall?.total || 0,
      icon: "eos-icons:application",
      bgcolor: "secondary",
      title: "Total Application",
      shape: shape1,
      link: "",
    },

    {
      total: atcStats?.data?.applications?.overall?.approved || 0,
      icon: "streamline-flex:credit-card-approved-solid",
      bgcolor: "primary",
      title: "Total Approved",
      shape: shape3,
      link: "",
    },
    {
      total: atcStats?.data?.applications?.overall?.declined || 0,
      icon: "fluent-mdl2:event-declined",
      bgcolor: "success",
      title: "Total Declined",
      shape: shape2,
      link: "",
    },
  ];

  const BCrumb = [
    {
      to: "/",
      title: "Home",
    },
    {
      to: "/dashboards/users",
      title: "Users",
    },
    {
      title: selectedApplication?.fullname || "",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          {/* <SmallCards overviewData={overviewData} /> */}
          <StatsWithMonthsFilter initialStats={atcStats} />
        </div>

        <div className="col-span-12">
          <SearchAndFilter />
          <ATCTable
            applications={applications?.data || null}
            totalPages={applications?.data?.last_page || 1}
            currentPage={page}
            pageSize={limit}
          />
        </div>
      </div>
    </>
  );
};


export default Page;
