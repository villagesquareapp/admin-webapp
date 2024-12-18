import { getLivestreams, getLivestreamStats } from "@/app/api/livestream";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import LivestreamTable from "./LivestreamTable";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  const [livestreamStats, livestreams] = await Promise.all([
    getLivestreamStats(),
    getLivestreams(page, limit),
  ]);

  const overviewData: IOverviewData[] = [
    {
      total: livestreamStats?.data?.total_livestreams || 0,
      icon: "mdi:video-outline",
      bgcolor: "secondary",
      title: "Total Livestreams",
      shape: shape1,
      link: "",
    },
    {
      total: livestreamStats?.data?.new_livestreams || 0,
      icon: "mdi:video-plus-outline",
      bgcolor: "success",
      title: "New Livestreams",
      shape: shape2,
      link: "",
    },
    {
      total: livestreamStats?.data?.currently_live || 0,
      icon: "mdi:broadcast",
      bgcolor: "primary",
      title: "Currently Live",
      shape: shape3,
      link: "",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <SmallCards overviewData={overviewData} />
        </div>
        <div className="col-span-12">
          <LivestreamTable
            livestreams={livestreams?.data || null}
            totalPages={livestreams?.data?.last_page || 1}
            currentPage={page}
            pageSize={limit}
          />
        </div>
      </div>
    </>
  );
};

export default Page;
