"use client";

import { useTransition } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { setTrendOverride } from "@/app/api/vflix-insights";
import { formatCount } from "../vflixStatus";
import { PanelTitle } from "../VflixUi";

const TrendList = ({
  title,
  sub,
  icon,
  tone,
  items,
  metric,
}: {
  title: string;
  sub: string;
  icon: string;
  tone: string;
  items: IVflixTrendItem[];
  metric: string;
}) => {
  const [pending, startTransition] = useTransition();
  const act = (it: IVflixTrendItem, action: "boost" | "suppress" | "clear") =>
    startTransition(async () => {
      const res = await setTrendOverride(it.video.uuid, action);
      if (res?.status) toast.success(res.message);
      else toast.error(res?.message || "Failed");
    });

  return (
    <CardBox className="h-full">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className={`size-9 rounded-md grid place-items-center ${tone}`}>
            <Icon icon={icon} height={19} />
          </span>
          <div>
            <h5 className="text-[15px] font-bold tracking-tight">{title}</h5>
            <p className="text-xs text-darklink">{sub}</p>
          </div>
        </div>
        <div className="flex flex-col">
          {items.map((it, i) => (
            <div key={it.video.uuid} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-ld" : ""}`}>
              <span className="w-5 text-center text-sm font-extrabold text-darklink shrink-0">{it.rank}</span>
              <div className="relative w-9 h-12 rounded-md overflow-hidden bg-muted dark:bg-dark shrink-0">
                {it.video.media?.[0]?.thumbnail && <Image src={it.video.media[0].thumbnail} alt="" fill className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold truncate">{it.video.caption || "Untitled"}</div>
                <div className="text-[11.5px] text-darklink truncate">
                  @{it.video.creator.username} · {formatCount(it.velocity)} {metric}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => act(it, "boost")}
                  disabled={pending}
                  title="Boost"
                  className="p-1.5 rounded-md hover:bg-lightsuccess text-success disabled:opacity-50"
                >
                  <Icon icon="solar:arrow-up-bold" height={16} />
                </button>
                <button
                  onClick={() => act(it, "suppress")}
                  disabled={pending}
                  title="Suppress"
                  className="p-1.5 rounded-md hover:bg-lighterror text-error disabled:opacity-50"
                >
                  <Icon icon="solar:arrow-down-bold" height={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardBox>
  );
};

const TrendingView = ({ data }: { data: IVflixTrending | null }) => {
  if (!data) return <CardBox><div className="py-16 text-center text-darklink">Unavailable.</div></CardBox>;
  return (
    <>
      <div className="flex items-center gap-2 mb-5 text-[12.5px] text-darklink">
        <Icon icon="solar:info-circle-linear" height={16} />
        Fed by the Recommender. Boost or suppress to override ranking manually.
      </div>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12 lg:col-span-6">
          <TrendList
            title="Trending"
            sub="Rising by view velocity"
            icon="solar:chart-2-bold"
            tone="bg-lightprimary text-primary"
            items={data.trending}
            metric="views/hr"
          />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <TrendList
            title="Hot"
            sub="Rising by engagement velocity"
            icon="solar:fire-bold"
            tone="bg-lighterror text-error"
            items={data.hot}
            metric="eng/hr"
          />
        </div>
      </div>
    </>
  );
};

export default TrendingView;
