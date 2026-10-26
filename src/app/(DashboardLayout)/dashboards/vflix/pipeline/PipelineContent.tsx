"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useTransition } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { retryTranscode } from "@/app/api/vflix-insights";
import { formatDate } from "@/utils/dateUtils";
import { KpiTile, PanelTitle } from "../VflixUi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const STATUS_STYLE: Record<string, string> = {
  queued: "bg-lightwarning text-warning",
  processing: "bg-lightinfo text-info",
  complete: "bg-lightsuccess text-success",
  failed: "bg-lighterror text-error",
};

const PipelineContent = ({ data }: { data: IVflixPipeline | null }) => {
  const [pending, startTransition] = useTransition();
  if (!data) return <CardBox><div className="py-16 text-center text-darklink">Pipeline unavailable.</div></CardBox>;

  const retry = (job: IVflixPipelineJob) =>
    startTransition(async () => {
      const res = await retryTranscode(job.id);
      if (res?.status) toast.success("Retry queued");
      else toast.error(res?.message || "Failed");
    });

  const barOptions: any = {
    chart: { type: "bar", height: 260, fontFamily: "inherit", foreColor: "#8b98a9", toolbar: { show: false } },
    colors: ["#00A1FF"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "45%" } },
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(136,152,169,0.15)", strokeDashArray: 4 },
    xaxis: { categories: data.throughput.map((t) => t.name), axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: "11px" } } },
    yaxis: { labels: { style: { fontSize: "11px" } } },
    tooltip: { theme: "dark", y: { formatter: (v: number) => `${v} jobs` } },
  };

  return (
    <div className="flex flex-col gap-30">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-30">
        <KpiTile label="Queued" value={data.kpis.queued.toLocaleString()} icon="solar:hourglass-line-bold" tone="warning" />
        <KpiTile label="Processing" value={data.kpis.processing.toLocaleString()} icon="solar:refresh-circle-bold" tone="info" />
        <KpiTile label="Completed (24h)" value={data.kpis.complete_24h.toLocaleString()} icon="solar:check-circle-bold" tone="success" />
        <KpiTile label="Failed (24h)" value={data.kpis.failed_24h.toLocaleString()} icon="solar:danger-triangle-bold" tone="error" />
      </div>

      <CardBox>
        <div>
          <PanelTitle title="Throughput" sub="· jobs completed per 2h" />
          <Chart options={barOptions} series={[{ name: "Jobs", data: data.throughput.map((t) => t.value) }]} type="bar" height={260} />
        </div>
      </CardBox>

      <CardBox>
        <div>
          <PanelTitle title="Recent jobs" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-darklink border-b border-ld">
                  <th className="font-semibold py-2.5 pr-3">Video</th>
                  <th className="font-semibold py-2.5 px-3">Status</th>
                  <th className="font-semibold py-2.5 px-3">Attempts</th>
                  <th className="font-semibold py-2.5 px-3">Duration</th>
                  <th className="font-semibold py-2.5 px-3">Started</th>
                  <th className="font-semibold py-2.5 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((j) => (
                  <tr key={j.id} className="border-b border-ld last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-12 rounded-md overflow-hidden bg-muted dark:bg-dark shrink-0">
                          {j.video.thumbnail && <Image src={j.video.thumbnail} alt="" fill className="object-cover" />}
                        </div>
                        <span className="font-medium truncate max-w-[240px] block">{j.video.caption || "Untitled"}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[j.status]}`}>{j.status}</span>
                    </td>
                    <td className="py-2.5 px-3 tabular-nums">{j.attempts}</td>
                    <td className="py-2.5 px-3 tabular-nums text-darklink">{j.duration_sec ? `${j.duration_sec}s` : "—"}</td>
                    <td className="py-2.5 px-3 text-darklink">{formatDate(j.created_at)}</td>
                    <td className="py-2.5 pl-3 text-right">
                      {j.status === "failed" ? (
                        <button
                          onClick={() => retry(j)}
                          disabled={pending}
                          className="inline-flex items-center gap-1 text-xs font-semibold bg-lightprimary text-primary px-2.5 py-1.5 rounded-md disabled:opacity-50"
                        >
                          <Icon icon="solar:restart-bold" height={14} /> Retry
                        </button>
                      ) : (
                        <span className="text-darklink text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardBox>
    </div>
  );
};

export default PipelineContent;
