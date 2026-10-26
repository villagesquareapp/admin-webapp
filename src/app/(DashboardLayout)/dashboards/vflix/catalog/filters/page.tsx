import { getFilters } from "@/app/api/vflix-catalog";
import VflixBreadcrumb from "../../VflixBreadcrumb";
import CatalogGrid from "../CatalogGrid";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix/catalog", title: "Catalog" },
  { title: "Filters" },
];

const Page = async () => {
  const res = await getFilters(1, 60);
  return (
    <>
      <VflixBreadcrumb title="Filters (LUTs)" items={BCrumb} backTo="/dashboards/vflix/catalog" />
      <CatalogGrid kind="filter" title="Filters" items={res?.data?.data || []} uploadLabel="Upload filter" />
    </>
  );
};

export default Page;
