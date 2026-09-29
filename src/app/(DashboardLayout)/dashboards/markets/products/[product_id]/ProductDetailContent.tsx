"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";
import CardBox from "@/app/components/shared/CardBox";
import { executeModeration } from "@/app/api/moderation";

const money = (p: IMarketProductDetail) =>
  p.price == null ? "—" : `${p.currency?.symbol || ""}${new Intl.NumberFormat("en").format(p.price)}`;

const Stat = ({ icon, label, value }: { icon: string; label: string; value: number | string }) => (
  <div className="rounded-xl border border-ld p-3">
    <div className="flex items-center gap-2 text-darklink"><Icon icon={icon} height={15} /><span className="text-[11px]">{label}</span></div>
    <p className="text-lg font-bold tabular-nums mt-1">{value}</p>
  </div>
);

const ProductDetailContent = ({ product }: { product: IMarketProductDetail | null }) => {
  const router = useRouter();
  const media = product?.media?.length ? product.media : product?.image ? [{ url: product.image } as IProductMedia] : [];
  const [active, setActive] = useState(0);

  if (!product) {
    return <CardBox><div className="py-16 text-center text-darklink">Product not found or unavailable.</div></CardBox>;
  }

  const moderate = async (action: string, label: string) => {
    const res = await executeModeration({ service_type: "marketplace", target_id: product.uuid, actions: [{ action }] });
    if (res?.status) { toast.success(label); router.refresh(); }
    else toast.error(res?.message || "Action failed");
  };

  const cover = media[active]?.url || media[active]?.thumbnail || product.image;

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => router.push("/dashboards/markets/products")} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-darklink shrink-0">
            <Icon icon="solar:alt-arrow-left-linear" height={20} />
          </button>
          <div className="min-w-0">
            <h4 className="text-lg font-bold truncate flex items-center gap-2">
              {product.title}
              {product.featured && <Icon icon="solar:star-bold" className="text-warning" height={16} />}
            </h4>
            <p className="text-sm text-darklink">{money(product)} · {product.category?.name || "Uncategorised"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {product.taken_down ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lighterror text-error">Taken down</span>
          ) : product.in_stock ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lightsuccess text-success">In stock</span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lightwarning text-warning">Out of stock</span>
          )}
          <Dropdown
            label=""
            inline
            dismissOnClick
            renderTrigger={() => (
              <button className="p-2 rounded-full border border-ld hover:bg-gray-100 dark:hover:bg-gray-700"><HiOutlineDotsVertical /></button>
            )}
          >
            {product.taken_down ? (
              <Dropdown.Item onClick={() => moderate("restore_content", "Product restored")}>Restore</Dropdown.Item>
            ) : (
              <Dropdown.Item onClick={() => moderate("remove_content", "Product taken down")}>Take down</Dropdown.Item>
            )}
            {product.featured && (
              <Dropdown.Item onClick={() => moderate("unfeature_content", "Product unfeatured")}>Unfeature</Dropdown.Item>
            )}
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* media + description */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
          <CardBox>
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-lightgray dark:bg-dark">
              {cover && <Image src={cover} alt={product.title} fill className="object-contain" />}
            </div>
            {media.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {media.map((m, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`relative size-16 rounded-lg overflow-hidden shrink-0 border-2 ${i === active ? "border-primary" : "border-transparent"}`}>
                    {(m.thumbnail || m.url) && <Image src={m.thumbnail || m.url} alt="" fill className="object-cover" />}
                  </button>
                ))}
              </div>
            )}
          </CardBox>

          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-2">Description</h5>
            <p className="text-sm text-darklink whitespace-pre-wrap break-words">{product.description || "No description."}</p>
            {!!product.tags?.length && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {product.tags.map((t) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-lightgray dark:bg-dark text-darklink">#{t}</span>)}
              </div>
            )}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {Object.entries(product.attributes).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm border-b border-ld py-1">
                    <span className="text-darklink capitalize">{k}</span>
                    <span className="font-medium truncate">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBox>
        </div>

        {/* side: owner/shop/stats/moderation */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Shop & owner</h5>
            {product.shop && (
              <Link href={`/dashboards/markets/shops/${product.shop.uuid}`} className="flex items-center justify-between py-2 border-b border-ld">
                <div className="flex items-center gap-2"><Icon icon="solar:shop-2-linear" height={18} className="text-primary" /><span className="text-sm font-medium">{product.shop.name}</span></div>
                <span className="text-xs text-darklink">View shop →</span>
              </Link>
            )}
            {product.user && (
              <Link href={`/dashboards/users/${product.user.uuid}`} className="flex items-center gap-3 py-2.5">
                <div className="relative size-9 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
                  {product.user.profile_picture && <Image src={product.user.profile_picture} alt="" fill className="object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{product.user.name}</p>
                  <p className="text-xs text-darklink truncate">@{product.user.username}</p>
                </div>
              </Link>
            )}
            <p className="text-xs text-darklink mt-2">Listed {formatDate(product.created_at)}</p>
          </CardBox>

          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Metrics</h5>
            <div className="grid grid-cols-2 gap-3">
              <Stat icon="solar:eye-linear" label="Views" value={product.views_count} />
              <Stat icon="solar:heart-linear" label="Wishlist" value={product.wishlist_count} />
              <Stat icon="solar:cart-check-linear" label="Purchases" value={product.purchase_count} />
              <Stat icon="solar:star-linear" label="Reviews" value={product.reviews_count} />
            </div>
          </CardBox>

          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Moderation</h5>
            <div className="flex items-center justify-between text-sm py-1.5 border-b border-ld">
              <span className="text-darklink">Open reports</span>
              <span className={`font-semibold ${product.moderation.open_reports ? "text-error" : ""}`}>{product.moderation.open_reports}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1.5">
              <span className="text-darklink">Status</span>
              <span className="font-semibold">{product.moderation.taken_down ? "Taken down" : "Live"}</span>
            </div>
            <Link href={`/dashboards/markets/enforcement?target_id=${product.uuid}`} className="text-xs font-semibold text-primary mt-2 inline-flex items-center gap-1">
              Enforcement history <Icon icon="solar:alt-arrow-right-linear" height={13} />
            </Link>
          </CardBox>
        </div>
      </div>

      {/* reviews */}
      <CardBox>
        <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Reviews ({product.reviews.length})</h5>
        {product.reviews.length ? (
          <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
            {product.reviews.map((r) => (
              <div key={r.uuid} className="flex items-start gap-3 py-3">
                <div className="relative size-8 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
                  {r.user?.profile_picture && <Image src={r.user.profile_picture} alt="" fill className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{r.user?.name || "Unknown"}</p>
                    <span className="flex items-center gap-0.5 text-xs text-warning"><Icon icon="solar:star-bold" height={12} />{r.rating}</span>
                    {!r.is_visible && <span className="text-[10px] px-1.5 rounded bg-lighterror text-error">hidden</span>}
                  </div>
                  <p className="text-sm text-darklink break-words">{r.comment || ""}</p>
                </div>
                <span className="text-[11px] text-darklink shrink-0">{formatDate(r.created_at)}</span>
              </div>
            ))}
          </div>
        ) : <div className="py-6 text-center text-sm text-darklink">No reviews yet.</div>}
      </CardBox>
    </div>
  );
};

export default ProductDetailContent;
