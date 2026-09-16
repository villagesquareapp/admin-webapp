import { getColours } from "@/app/api/vflix-catalog";
import VflixBreadcrumb from "../../VflixBreadcrumb";
import CatalogGrid from "../CatalogGrid";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix/catalog", title: "Catalog" },
  { title: "Colours" },
];

const Page = async () => {
  const res = await getColours(1, 60);
  return (
    <>
      <VflixBreadcrumb title="Colours" items={BCrumb} backTo="/dashboards/vflix/catalog" />
      <CatalogGrid kind="colour" title="Colours" items={res?.data?.data || []} uploadLabel="Add colour" />
    </>
  );
};

export default Page;
