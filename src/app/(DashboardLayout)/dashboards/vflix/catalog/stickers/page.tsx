import { getStickers } from "@/app/api/vflix-catalog";
import VflixBreadcrumb from "../../VflixBreadcrumb";
import CatalogGrid from "../CatalogGrid";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix/catalog", title: "Catalog" },
  { title: "Stickers" },
];

const Page = async () => {
  const res = await getStickers(1, 60);
  return (
    <>
      <VflixBreadcrumb title="Stickers" items={BCrumb} backTo="/dashboards/vflix/catalog" />
      <CatalogGrid kind="sticker" title="Stickers" items={res?.data?.data || []} uploadLabel="Upload sticker" />
    </>
  );
};

export default Page;
