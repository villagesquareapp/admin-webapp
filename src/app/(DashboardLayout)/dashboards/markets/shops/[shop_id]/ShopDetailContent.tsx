"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";
import CardBox from "@/app/components/shared/CardBox";
import { updateShopStatus } from "@/app/api/market-square";

const SHOP_STATUS_TONE: Record<string, string> = {
  active: "bg-lightsuccess text-success",
  inactive: "bg-lightwarning text-warning",
  banned: "bg-lighterror text-error",
};
const money = (p: IMarketProductLite) =>
  p.price == null ? "—" : `${p.currency?.symbol || ""}${new Intl.NumberFormat("en").format(p.price)}`;

const ShopDetailContent = ({ shop }: { shop: IMarketShopDetail | null }) => {
  const router = useRouter();
  if (!shop) {
    return <CardBox><div className="py-16 text-center text-darklink">Shop not found or unavailable.</div></CardBox>;
  }

  const setStatus = async (status: ShopStatus, label: string) => {
    const res = await updateShopStatus(shop.uuid, status);
    if (res?.status) { toast.success(label); router.refresh(); }
    else toast.error(res?.message || "Action failed");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => router.push("/dashboards/markets/shops")} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-darklink shrink-0">
            <Icon icon="solar:alt-arrow-left-linear" height={20} />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative size-11 rounded-full overflow-hidden border border-ld bg-lightgray dark:bg-dark shrink-0">
              {shop.logo && <Image src={shop.logo} alt="" fill className="object-cover" />}
            </div>
            <div className="min-w-0">
              <h4 className="text-lg font-bold truncate">{shop.name}</h4>
              <p className="text-sm text-darklink truncate">{shop.tagline || `@${shop.user?.username || ""}`}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${SHOP_STATUS_TONE[shop.status] || ""}`}>{shop.status}</span>
          <Dropdown
            label=""
            inline
            dismissOnClick
            renderTrigger={() => (
              <button className="p-2 rounded-full border border-ld hover:bg-gray-100 dark:hover:bg-gray-700"><HiOutlineDotsVertical /></button>
            )}
          >
            {shop.status !== "banned" ? (
              <Dropdown.Item onClick={() => setStatus("banned", "Shop banned")}>Ban shop</Dropdown.Item>
            ) : (
              <Dropdown.Item onClick={() => setStatus("active", "Shop reinstated")}>Reinstate</Dropdown.Item>
            )}
            {shop.status === "active" ? (
              <Dropdown.Item onClick={() => setStatus("inactive", "Shop deactivated")}>Deactivate</Dropdown.Item>
            ) : shop.status === "inactive" ? (
              <Dropdown.Item onClick={() => setStatus("active", "Shop activated")}>Activate</Dropdown.Item>
            ) : null}
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Owner</h5>
            {shop.user && (
              <Link href={`/dashboards/users/${shop.user.uuid}`} className="flex items-center gap-3 py-1">
                <div className="relative size-9 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
                  {shop.user.profile_picture && <Image src={shop.user.profile_picture} alt="" fill className="object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{shop.user.name}</p>
                  <p className="text-xs text-darklink truncate">@{shop.user.username}</p>
                </div>
              </Link>
            )}
          </CardBox>
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Details</h5>
            <dl className="flex flex-col gap-2 text-sm">
              {[
                { k: "Products", v: String(shop.products_count) },
                { k: "Website", v: shop.website || "—" },
                { k: "Location", v: shop.location || "—" },
                { k: "Address", v: shop.address || "—" },
                { k: "Created", v: formatDate(shop.created_at) },
              ].map((r) => (
                <div key={r.k} className="flex justify-between gap-3 border-b border-ld py-1.5 last:border-0">
                  <dt className="text-darklink shrink-0">{r.k}</dt>
                  <dd className="font-medium truncate text-right">{r.v}</dd>
                </div>
              ))}
            </dl>
          </CardBox>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Products ({shop.products_count})</h5>
            {shop.products.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {shop.products.map((p) => (
                  <Link key={p.uuid} href={`/dashboards/markets/products/${p.uuid}`} className="flex items-center gap-3 py-2.5 border-b border-border dark:border-darkborder">
                    <div className="relative size-10 rounded-lg overflow-hidden bg-lightgray dark:bg-dark shrink-0">
                      {p.image && <Image src={p.image} alt="" fill className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate flex items-center gap-1">
                        {p.title}
                        {p.taken_down && <Icon icon="solar:trash-bin-trash-bold" className="text-error" height={12} />}
                      </p>
                      <p className="text-xs text-darklink truncate">{p.category?.name || "Uncategorised"}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums shrink-0">{money(p)}</span>
                  </Link>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No products in this shop.</div>}
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailContent;
