import { Suspense } from "react";
import { getTicketStats, getTickets } from "@/app/api/ticket";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import TicketTable from "./TicketTable";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const TicketStatsWrapper = async () => {
  const ticketStats = await getTicketStats();

  const overviewData: IOverviewData[] = [
    {
      total: ticketStats?.data?.total || 0,
      icon: "mdi:ticket",
      bgcolor: "secondary",
      title: "Total Tickets",
      shape: shape1,
      link: "",
    },
    {
      total: ticketStats?.data?.open || 0,
      icon: "mdi:ticket-outline",
      bgcolor: "success",
      title: "Open Tickets",
      shape: shape2,
      link: "",
    },
    {
      total: ticketStats?.data?.in_progress || 0,
      icon: "mdi:progress-clock",
      bgcolor: "primary",
      title: "In Progress Tickets",
      shape: shape3,
      link: "",
    },
    {
      total: ticketStats?.data?.resolved || 0,
      icon: "mdi:check-circle",
      bgcolor: "primary",
      title: "Resolved Tickets",
      shape: shape3,
      link: "",
    },
    {
      total: ticketStats?.data?.closed || 0,
      icon: "mdi:close-circle",
      bgcolor: "primary",
      title: "Closed Tickets",
      shape: shape3,
      link: "",
    },
  ];

  return <SmallCards overviewData={overviewData} />;
};

const TicketTableWrapper = async ({ page, limit }: { page: number; limit: number }) => {
  const tickets = await getTickets(page, limit);
  return (
    <TicketTable
      tickets={tickets?.data || null}
      totalPages={tickets?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense fallback={<div className="h-[150px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <TicketStatsWrapper />
          </Suspense>
        </div>
        <div className="col-span-12">
          <Suspense key={`${page}-${limit}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <TicketTableWrapper page={page} limit={limit} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
