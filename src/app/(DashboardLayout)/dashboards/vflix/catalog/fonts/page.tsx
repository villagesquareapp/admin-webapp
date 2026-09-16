import { getFonts } from "@/app/api/vflix-catalog";
import VflixBreadcrumb from "../../VflixBreadcrumb";
import CatalogGrid from "../CatalogGrid";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix/catalog", title: "Catalog" },
  { title: "Fonts" },
];

const Page = async () => {
  const res = await getFonts(1, 60);
  return (
    <>
      <VflixBreadcrumb title="Fonts" items={BCrumb} backTo="/dashboards/vflix/catalog" />
      <CatalogGrid kind="font" title="Fonts" items={res?.data?.data || []} uploadLabel="Add font" />
    </>
  );
};

export default Page;
