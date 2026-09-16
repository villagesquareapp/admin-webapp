"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Label, Select, Textarea } from "flowbite-react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import VflixStatusBadge from "../../VflixStatusBadge";
import VflixVideoPlayer from "../../VflixVideoPlayer";
import { formatCount, formatDuration, formatStatusLabel } from "../../vflixStatus";
import { formatDate } from "@/utils/dateUtils";
import {
  featureVflixVideo,
  unfeatureVflixVideo,
  updateVflixStatus,
} from "@/app/api/vflix";

const STATUS_OPTIONS = ["active", "reported", "flagged", "shadow_hidden", "disabled", "banned", "archived"];

/* engagement stat cell (shown below the video) */
const StatCell = ({ icon, value, label, tint }: { icon: string; value: number; label: string; tint?: string }) => (
  <div className="flex flex-col items-center gap-1 rounded-lg bg-white/5 py-2.5">
    <Icon icon={icon} height={18} className={tint || "text-white/80"} />
    <span className="text-[13px] font-bold text-white tabular-nums">{formatCount(value)}</span>
    <span className="text-[10px] text-white/50">{label}</span>
  </div>
);

/* metadata tile (no thin dividers — soft tiles instead) */
const Tile = ({ icon, label, value }: { icon: string; label: string; value?: string | number | null }) => (
  <div className="bg-lightgray dark:bg-dark rounded-md p-3 min-w-0">
    <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-darklink font-semibold">
      <Icon icon={icon} height={13} /> {label}
    </div>
    <div className="text-sm font-medium mt-1 truncate">{value ?? "—"}</div>
  </div>
);

const VideoDetailContent = ({ video }: { video: IVflixVideoDetail | null }) => {
  const [detail, setDetail] = useState<IVflixVideoDetail | null>(video);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  if (!detail) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">
          <Icon icon="solar:videocamera-record-linear" height={40} className="mx-auto mb-3" />
          <p>Video not found.</p>
          <Link href="/dashboards/vflix/videos" className="text-primary text-sm font-semibold mt-3 inline-block">
            ← Back to videos
          </Link>
        </div>
      </CardBox>
    );
  }

  const media = detail.media || [];
  const cur = media[mediaIndex];
  const isRemoved = detail.status === "banned" || detail.status === "disabled";

  const apply = (status: string) =>
    startTransition(async () => {
      const res = await updateVflixStatus(detail.uuid, status, reason || undefined);
      if (res?.status) {
        toast.success(`Status set to ${formatStatusLabel(status)}`);
        if (res.data) setDetail(res.data as IVflixVideoDetail);
        setSelected("");
        setReason("");
      } else toast.error(res?.message || "Failed to update status");
    });

  const toggleFeature = () =>
    startTransition(async () => {
      const res = detail.is_featured ? await unfeatureVflixVideo(detail.uuid) : await featureVflixVideo(detail.uuid);
      if (res?.status) {
        toast.success(detail.is_featured ? "Removed from featured" : "Added to featured");
        setDetail((p) => (p ? { ...p, is_featured: !p.is_featured } : p));
      } else toast.error(res?.message || "Failed");
    });

  return (
    <div className="flex flex-col gap-30">
      {/* top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboards/vflix/videos"
            className="size-9 rounded-full grid place-items-center border border-ld hover:border-primary hover:text-primary text-darklink transition"
          >
            <Icon icon="solar:alt-arrow-left-linear" height={18} />
          </Link>
          <div>
            <h4 className="text-xl font-extrabold tracking-tight">Video details</h4>
            <p className="text-[11px] text-darklink font-mono">{detail.uuid}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {detail.is_featured && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-lightprimary text-primary font-semibold">
              <Icon icon="solar:star-bold" height={13} /> Featured
            </span>
          )}
          <VflixStatusBadge status={detail.status} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-30 items-start">
        {/* ---- reels stage ---- */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#141f33] to-[#0b1320] shadow-lg">
            <div className="relative w-full max-w-[420px] mx-auto aspect-[9/16]">
              {media.length > 1 && (
                <>
                  <button
                    onClick={() => setMediaIndex((p) => (p === 0 ? media.length - 1 : p - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  >
                    <Icon icon="solar:alt-arrow-left-linear" height={20} />
                  </button>
                  <button
                    onClick={() => setMediaIndex((p) => (p === media.length - 1 ? 0 : p + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  >
                    <Icon icon="solar:alt-arrow-right-linear" height={20} />
                  </button>
                </>
              )}
              {cur && <VflixVideoPlayer media={cur} />}
            </div>

            {media.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMediaIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === mediaIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
                  />
                ))}
              </div>
            )}

            {/* engagement stats — below the video */}
            <div className="mt-4 grid grid-cols-5 gap-2">
              <StatCell icon="solar:eye-bold" value={detail.views_count} label="Views" />
              <StatCell icon="solar:heart-bold" value={detail.likes_count} label="Likes" tint="text-[#ff6692]" />
              <StatCell icon="solar:chat-round-bold" value={detail.comments_count} label="Comments" />
              <StatCell icon="solar:share-bold" value={detail.shares_count} label="Shares" />
              <StatCell icon="solar:gift-bold" value={detail.gifts_count} label="Gifts" tint="text-[#ffb900]" />
            </div>

            {/* stage meta pills */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80 capitalize">
                {detail.content_type}
              </span>
              {cur && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80">
                  {formatDuration(cur.duration)}
                </span>
              )}
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cur?.is_transcode_complete ? "bg-[#00ceb6]/20 text-[#3fe0cf]" : "bg-[#ffb900]/20 text-[#ffcf4d]"}`}>
                {cur?.is_transcode_complete ? "HLS ready" : "Transcoding"}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/60">
                {formatDate(detail.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* ---- content + actions ---- */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-30">
          {/* creator + caption */}
          <CardBox>
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative size-12 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/30 bg-muted dark:bg-dark">
                    {detail.creator.profile_picture && (
                      <Image src={detail.creator.profile_picture} alt={detail.creator.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{detail.creator.name}</p>
                    <p className="text-sm text-darklink truncate">@{detail.creator.username}</p>
                  </div>
                </div>
                <Link
                  href={`/dashboards/vflix/creator/${detail.creator.uuid}`}
                  className="flex items-center gap-1.5 text-xs font-semibold border border-ld hover:border-primary hover:text-primary rounded-full px-3.5 py-2 shrink-0 transition"
                >
                  View creator <Icon icon="solar:alt-arrow-right-linear" height={14} />
                </Link>
              </div>
              <p className="text-[15px] leading-relaxed mt-4 whitespace-pre-wrap">{detail.caption || "—"}</p>
              <div className="text-xs text-darklink mt-3 flex items-center gap-2 flex-wrap">
                <Icon icon="solar:global-linear" height={14} /> {detail.privacy}
                <span className="opacity-40">•</span>
                Posted {formatDate(detail.created_at)}
              </div>
            </div>
          </CardBox>

          {/* actions */}
          <CardBox>
            <div>
              <h5 className="text-[15px] font-bold tracking-tight mb-4">Moderation actions</h5>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={toggleFeature}
                  disabled={pending}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full disabled:opacity-50 transition ${
                    detail.is_featured ? "bg-lightgray dark:bg-dark text-darklink" : "bg-lightprimary text-primary"
                  }`}
                >
                  <Icon icon={detail.is_featured ? "solar:star-linear" : "solar:star-bold"} height={17} />
                  {detail.is_featured ? "Unfeature" : "Feature"}
                </button>

                {isRemoved || detail.status === "shadow_hidden" ? (
                  <button
                    onClick={() => apply("active")}
                    disabled={pending}
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full bg-success text-white disabled:opacity-50"
                  >
                    <Icon icon="solar:restart-bold" height={17} /> Restore video
                  </button>
                ) : (
                  <>
                    {(detail.status === "reported" || detail.status === "flagged") && (
                      <button
                        onClick={() => apply("active")}
                        disabled={pending}
                        className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full bg-lightsuccess text-success disabled:opacity-50"
                      >
                        <Icon icon="solar:check-circle-bold" height={17} /> Mark reviewed
                      </button>
                    )}
                    <button
                      onClick={() => apply("shadow_hidden")}
                      disabled={pending}
                      className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full bg-lightsecondary text-secondary disabled:opacity-50"
                    >
                      <Icon icon="solar:eye-closed-bold" height={17} /> Shadow-hide
                    </button>
                    <button
                      onClick={() => apply("banned")}
                      disabled={pending}
                      className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full bg-error text-white disabled:opacity-50"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" height={17} /> Take down
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-ld grid sm:grid-cols-[190px_1fr_auto] gap-3 items-end">
                <div>
                  <div className="mb-1.5 block">
                    <Label htmlFor="set-status" value="Set a specific status" />
                  </div>
                  <Select id="set-status" value={selected} onChange={(e) => setSelected(e.target.value)}>
                    <option value="">Choose status…</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{formatStatusLabel(s)}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <div className="mb-1.5 block">
                    <Label htmlFor="reason" value="Reason (optional — audit trail)" />
                  </div>
                  <Textarea id="reason" rows={1} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. nudity — policy 3.2" />
                </div>
                <button
                  onClick={() => selected && apply(selected)}
                  disabled={pending || !selected}
                  className="text-sm font-semibold px-5 py-2.5 rounded-md bg-primary text-white disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
          </CardBox>

          {/* about */}
          <CardBox>
            <div>
              <h5 className="text-[15px] font-bold tracking-tight mb-3">About this video</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Tile icon="solar:videocamera-linear" label="Type" value={formatStatusLabel(detail.content_type)} />
                <Tile icon="solar:global-linear" label="Language" value={detail.language} />
                <Tile icon="solar:map-point-linear" label="Location" value={detail.address} />
                <Tile icon="solar:hashtag-linear" label="Culture" value={detail.culture_tag} />
                <Tile icon="solar:music-note-2-linear" label="Sound" value={detail.audio_id} />
                <Tile icon="solar:tuning-2-linear" label="Filter" value={detail.filter_id} />
                <Tile icon="solar:widget-5-linear" label="Template" value={detail.template_id} />
                <Tile
                  icon="solar:clapperboard-play-linear"
                  label="Series"
                  value={detail.series_id ? `${detail.series_id} · ep ${detail.episode_number ?? "—"}` : null}
                />
                <Tile icon="solar:lock-keyhole-minimalistic-linear" label="Privacy" value={detail.privacy} />
              </div>
            </div>
          </CardBox>

          {/* moderation audit */}
          {(detail.moderated_at || detail.moderation_reason) && (
            <CardBox>
              <div>
                <h5 className="text-[15px] font-bold tracking-tight mb-3 flex items-center gap-2">
                  <Icon icon="solar:shield-check-bold" height={18} className="text-warning" /> Moderation audit
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Tile icon="solar:user-linear" label="Moderated by" value={detail.moderated_by} />
                  <Tile icon="solar:clock-circle-linear" label="Moderated at" value={detail.moderated_at ? formatDate(detail.moderated_at) : null} />
                  <Tile icon="solar:document-text-linear" label="Reason" value={detail.moderation_reason} />
                </div>
              </div>
            </CardBox>
          )}

          {/* reports */}
          <CardBox>
            <div>
              <h5 className="text-[15px] font-bold tracking-tight mb-3">
                Reports {detail.reports?.length ? <span className="text-error">({detail.reports.length})</span> : ""}
              </h5>
              {detail.reports?.length ? (
                <div className="flex flex-col gap-2.5">
                  {detail.reports.map((r) => (
                    <div key={r.id} className="rounded-md bg-lightgray dark:bg-dark p-3 flex items-start gap-3">
                      <span className="size-9 rounded-md grid place-items-center bg-lighterror text-error shrink-0">
                        <Icon icon="solar:flag-2-bold" height={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold capitalize">{r.type}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-lightwarning text-warning capitalize">{r.status}</span>
                        </div>
                        <p className="text-sm text-darklink mt-1">{r.reason}</p>
                      </div>
                      <span className="text-xs text-darklink shrink-0">{formatDate(r.created_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-darklink py-2">
                  <Icon icon="solar:check-circle-bold" height={18} className="text-success" /> No reports on this video.
                </div>
              )}
            </div>
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailContent;
