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
import { reviewATCApplication, approveATCApplication, declineATCApplication } from "@/app/api/atc";
import { ATC_STATUS_TONE } from "../../ATCOverviewContent";

const statusLabel = (s: string) => (s === "in_review" ? "Under review" : s.charAt(0).toUpperCase() + s.slice(1));

const Metric = ({ icon, label, value, tone }: { icon: string; label: string; value: number; tone: string }) => (
  <div className="rounded-xl border border-ld p-3 text-center">
    <span className={`size-8 rounded-md grid place-items-center mx-auto ${tone}`}><Icon icon={icon} height={16} /></span>
    <p className="text-lg font-bold tabular-nums mt-1.5">{new Intl.NumberFormat("en", { notation: "compact" }).format(value || 0)}</p>
    <p className="text-[11px] text-darklink">{label}</p>
  </div>
);

const KycImage = ({ src, label }: { src?: string; label: string }) => (
  <div>
    <p className="text-xs text-darklink mb-1">{label}</p>
    {src ? (
      <a href={src} target="_blank" rel="noreferrer" className="relative block w-full aspect-[16/10] rounded-lg overflow-hidden bg-lightgray dark:bg-dark border border-ld">
        <Image src={src} alt={label} fill className="object-cover" unoptimized />
      </a>
    ) : <div className="w-full aspect-[16/10] rounded-lg bg-lightgray dark:bg-dark grid place-items-center text-xs text-darklink">Not provided</div>}
  </div>
);

const ATCApplicationDetail = ({ application }: { application: IATCApplication | null }) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!application) {
    return <CardBox><div className="py-16 text-center text-darklink">Application not found or unavailable.</div></CardBox>;
  }
  const a = application;

  const act = async (fn: (id: string) => Promise<any>, label: string) => {
    setBusy(true);
    const res = await fn(a.uuid);
    if (res?.status) { toast.success(label); router.refresh(); }
    else toast.error(res?.message || "Action failed");
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => router.push("/dashboards/africa-talent-challenge/applications")} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-darklink shrink-0">
            <Icon icon="solar:alt-arrow-left-linear" height={20} />
          </button>
          <div className="min-w-0">
            <h4 className="text-lg font-bold truncate">{a.fullname}</h4>
            <p className="text-sm text-darklink truncate">{a.occupation}{a.episode?.name ? ` · ${a.episode.name}` : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ATC_STATUS_TONE[a.status] || ""}`}>{statusLabel(a.status)}</span>
          <Dropdown label="" inline dismissOnClick renderTrigger={() => (
            <button className="p-2 rounded-full border border-ld hover:bg-gray-100 dark:hover:bg-gray-700" disabled={busy}><HiOutlineDotsVertical /></button>
          )}>
            <Dropdown.Item disabled={busy || a.status === "in_review"} onClick={() => act(reviewATCApplication, "Moved to review")}>Move to review</Dropdown.Item>
            <Dropdown.Item disabled={busy || a.status === "approved"} onClick={() => act(approveATCApplication, "Application approved")}>Approve</Dropdown.Item>
            <Dropdown.Item disabled={busy || a.status === "declined"} onClick={() => act(declineATCApplication, "Application declined")}>Decline</Dropdown.Item>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* left: video + about */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Talent submission</h5>
            {a.video_url ? (
              <video src={a.video_url} poster={a.thumbnail_url || undefined} controls className="w-full max-h-[460px] rounded-xl bg-black" />
            ) : <div className="w-full aspect-video rounded-xl bg-lightgray dark:bg-dark grid place-items-center text-sm text-darklink">No video submitted</div>}
          </CardBox>

          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-2">About</h5>
            <p className="text-sm text-darklink whitespace-pre-wrap break-words">{a.about || "No description."}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { k: "Occupation", v: a.occupation },
                { k: "Experience", v: a.occupation_duration || "—" },
                { k: "Type", v: (a.application_type || "solo") },
                { k: "Address", v: a.address || "—" },
              ].map((r) => (
                <div key={r.k} className="flex flex-col border-b border-ld py-1.5">
                  <span className="text-[11px] text-darklink">{r.k}</span>
                  <span className="text-sm font-medium capitalize truncate">{r.v}</span>
                </div>
              ))}
            </div>
          </CardBox>

          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3 flex items-center gap-2">
              <Icon icon="solar:shield-user-linear" height={16} className="text-warning" /> Identity documents
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <KycImage src={a.id_card_front_url} label="ID — front" />
              <KycImage src={a.id_card_back_url} label="ID — back" />
            </div>
          </CardBox>
        </div>

        {/* right: contestant + metrics */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Contestant</h5>
            <div className="flex items-center gap-3">
              <div className="relative size-12 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
                {a.profile_picture_url && <Image src={a.profile_picture_url} alt="" fill className="object-cover" unoptimized />}
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold truncate">{a.fullname}</p>
                <p className="text-xs text-darklink truncate">Applied {formatDate(a.created_at)}</p>
              </div>
            </div>
            {a.user && (
              <Link href={`/dashboards/users/${a.user.uuid}`} className="flex items-center justify-between mt-3 pt-3 border-t border-ld">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative size-8 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
                    {a.user.profile_picture && <Image src={a.user.profile_picture} alt="" fill className="object-cover" unoptimized />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.user.name}</p>
                    <p className="text-xs text-darklink truncate">@{a.user.username}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary shrink-0">Platform profile →</span>
              </Link>
            )}
          </CardBox>

          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Engagement</h5>
            <div className="grid grid-cols-3 gap-3">
              <Metric icon="solar:like-bold" label="Votes" value={a.votes_count} tone="bg-lightsecondary text-secondary" />
              <Metric icon="solar:heart-bold" label="Likes" value={a.likes_count} tone="bg-lighterror text-error" />
              <Metric icon="solar:chat-round-line-bold" label="Comments" value={a.comments_count} tone="bg-lightinfo text-info" />
              <Metric icon="solar:gift-bold" label="Gifts" value={a.gifts_count} tone="bg-lightwarning text-warning" />
              <Metric icon="solar:share-bold" label="Shares" value={a.shares_count || 0} tone="bg-lightprimary text-primary" />
              <Metric icon="solar:eye-bold" label="Visits" value={a.profile_visits_count || 0} tone="bg-lightsuccess text-success" />
            </div>
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default ATCApplicationDetail;
