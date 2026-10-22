"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";

const TONE: Record<string, string> = {
  primary: "bg-lightprimary text-primary",
  success: "bg-lightsuccess text-success",
  warning: "bg-lightwarning text-warning",
  secondary: "bg-lightsecondary text-secondary",
  error: "bg-lighterror text-error",
  info: "bg-lightinfo text-info",
};

const CatalogHub = ({ summary }: { summary: IVflixCatalogSummary | null }) => {
  const s = summary;
  const cards = [
    { label: "Sounds", count: s?.sounds ?? 0, sub: `${s?.featured_sounds ?? 0} featured`, icon: "solar:music-note-2-bold", tone: "secondary", href: "/dashboards/vflix/catalog/sounds" },
    { label: "Filters", count: s?.filters ?? 0, sub: `${s?.active_filters ?? 0} active`, icon: "solar:tuning-2-bold", tone: "primary", href: "/dashboards/vflix/catalog/filters" },
    { label: "Templates", count: s?.templates ?? 0, sub: `${s?.pending_templates ?? 0} pending review`, icon: "solar:widget-5-bold", tone: "info", href: "/dashboards/vflix/catalog/templates" },
    { label: "Stickers", count: s?.stickers ?? 0, sub: "Creation assets", icon: "solar:sticker-smile-circle-2-bold", tone: "warning", href: "/dashboards/vflix/catalog/stickers" },
    { label: "Fonts", count: s?.fonts ?? 0, sub: "Text styles", icon: "solar:text-bold", tone: "success", href: "/dashboards/vflix/catalog/fonts" },
    { label: "Colours", count: s?.colours ?? 0, sub: "Palette", icon: "solar:palette-2-bold", tone: "error", href: "/dashboards/vflix/catalog/colours" },
  ];

  return (
    <div className="flex flex-col gap-30">
      {(s?.pending_templates ?? 0) > 0 && (
        <Link
          href="/dashboards/vflix/catalog/templates?status=pending"
          className="flex items-center gap-3 p-4 rounded-tw bg-lightwarning text-warning font-semibold"
        >
          <Icon icon="solar:info-circle-bold" height={20} />
          {s?.pending_templates} user-submitted templates are awaiting review
          <span className="ml-auto text-sm">Review →</span>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-30">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <CardBox className="h-full transition hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <span className={`size-12 rounded-tw grid place-items-center shrink-0 ${TONE[c.tone]}`}>
                  <Icon icon={c.icon} height={24} />
                </span>
                <div className="min-w-0">
                  <div className="text-2xl font-extrabold tabular-nums leading-none">{c.count.toLocaleString()}</div>
                  <div className="text-sm font-semibold mt-1">{c.label}</div>
                  <div className="text-xs text-darklink">{c.sub}</div>
                </div>
                <Icon icon="solar:alt-arrow-right-linear" height={18} className="ml-auto text-darklink shrink-0" />
              </div>
            </CardBox>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CatalogHub;
