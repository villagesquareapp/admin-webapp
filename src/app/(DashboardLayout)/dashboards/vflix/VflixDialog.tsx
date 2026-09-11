"use client";

import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { Button as FbButton, Label, Select, Textarea } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  featureVflixVideo,
  getVflixVideoDetail,
  unfeatureVflixVideo,
  updateVflixStatus,
} from "@/app/api/vflix";
import { formatDate } from "@/utils/dateUtils";
import { can } from "@/utils/permissions";
import VflixStatusBadge from "./VflixStatusBadge";
import VflixVideoPlayer from "./VflixVideoPlayer";
import { formatCount, formatStatusLabel } from "./vflixStatus";

const Metric = ({ icon, label, value }: { icon: string; label: string; value: number }) => (
  <div className="flex flex-col items-center rounded-lg border border-ld py-3">
    <Icon icon={icon} height={20} className="text-primary" />
    <span className="text-base font-semibold mt-1">{formatCount(value)}</span>
    <span className="text-xs text-darklink">{label}</span>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex justify-between gap-4 py-1.5 border-b border-ld/60 last:border-0">
    <span className="text-sm text-darklink">{label}</span>
    <span className="text-sm text-ld text-right break-words max-w-[60%]">{value ?? "—"}</span>
  </div>
);

const VflixDialog = ({
  isOpen,
  setIsOpen,
  video,
  statuses,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  video?: IVflixVideo | null;
  statuses: string[];
}) => {
  const [detail, setDetail] = useState<IVflixVideoDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);

  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [featuring, setFeaturing] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (video?.uuid && isOpen) {
        setLoading(true);
        try {
          const res = await getVflixVideoDetail(video.uuid);
          if (res?.data) setDetail(res.data);
        } catch (error) {
          console.error("Error fetching VFlix detail:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDetail();
  }, [video?.uuid, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setDetail(null);
      setMediaIndex(0);
      setSelected("");
      setReason("");
    }
  }, [isOpen]);

  if (!video) return null;

  const current = detail ?? video;
  const media = current.media || [];
  const isFeatured = detail?.is_featured ?? video.is_featured;

  const handleUpdateStatus = async () => {
    if (!selected) return toast.error("Please select a status");
    setSaving(true);
    try {
      const res = await updateVflixStatus(video.uuid, selected, reason || undefined);
      if (res?.status) {
        toast.success("Video status updated");
        if (res.data) setDetail(res.data as IVflixVideoDetail);
        setReason("");
        setSelected("");
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeature = async () => {
    setFeaturing(true);
    try {
      const res = isFeatured
        ? await unfeatureVflixVideo(video.uuid)
        : await featureVflixVideo(video.uuid);
      if (res?.status) {
        toast.success(isFeatured ? "Removed from featured" : "Added to featured");
        setDetail((prev) => (prev ? { ...prev, is_featured: !isFeatured } : prev));
      } else {
        toast.error(res?.message || "Failed to update featured state");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating featured state");
    } finally {
      setFeaturing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[1100px] flex flex-col h-[95dvh] max-h-[860px] overflow-hidden rounded-lg bg-white dark:bg-darkgray shadow-md"
            >
              {/* header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-ld h-16 shrink-0">
                <DialogTitle className="text-lg font-semibold">Video Details</DialogTitle>
                <Button onClick={() => setIsOpen(false)} className="p-1 rounded-full">
                  <Icon icon="solar:close-circle-bold" height={28} />
                </Button>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent" />
                    <p className="mt-4 text-darklink">Loading video details...</p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 flex-1 overflow-hidden">
                  {/* media column */}
                  <div className="bg-black/[0.03] dark:bg-black/30 p-4 flex items-center justify-center relative overflow-y-auto">
                    <div className="relative w-full max-w-[340px]">
                      {media.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setMediaIndex((p) => (p === 0 ? media.length - 1 : p - 1))
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70"
                          >
                            <Icon icon="solar:arrow-left-linear" className="text-white" height={20} />
                          </button>
                          <button
                            onClick={() =>
                              setMediaIndex((p) => (p === media.length - 1 ? 0 : p + 1))
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70"
                          >
                            <Icon icon="solar:arrow-right-linear" className="text-white" height={20} />
                          </button>
                        </>
                      )}
                      <VflixVideoPlayer media={media[mediaIndex]} />
                      {media.length > 1 && (
                        <div className="flex justify-center gap-2 mt-3">
                          {media.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setMediaIndex(i)}
                              className={`w-2 h-2 rounded-full ${
                                i === mediaIndex ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* info column */}
                  <div className="overflow-y-auto p-6 flex flex-col gap-5">
                    {/* creator + status */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 rounded-full overflow-hidden">
                          <Image
                            src={current.creator.profile_picture}
                            alt={current.creator.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{current.creator.name}</p>
                          <p className="text-sm text-darklink">@{current.creator.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isFeatured && (
                          <span className="text-xs px-2 py-1 rounded-full bg-lightprimary text-primary font-medium">
                            Featured
                          </span>
                        )}
                        <VflixStatusBadge status={current.status} />
                      </div>
                    </div>

                    {/* caption */}
                    <p className="text-sm text-ld whitespace-pre-wrap">{current.caption || "—"}</p>

                    {/* metrics */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      <Metric icon="solar:eye-linear" label="Views" value={current.views_count} />
                      <Metric icon="solar:heart-linear" label="Likes" value={current.likes_count} />
                      <Metric icon="solar:chat-round-line-linear" label="Comments" value={current.comments_count} />
                      <Metric icon="solar:share-linear" label="Shares" value={current.shares_count} />
                      <Metric icon="solar:gift-linear" label="Gifts" value={current.gifts_count} />
                    </div>

                    {/* meta */}
                    <div>
                      <h6 className="card-title text-base mb-2">Details</h6>
                      <InfoRow label="Content type" value={formatStatusLabel(current.content_type)} />
                      <InfoRow label="Privacy" value={current.privacy} />
                      <InfoRow label="Created" value={formatDate(current.created_at)} />
                      {detail && (
                        <>
                          <InfoRow label="Language" value={detail.language} />
                          <InfoRow label="Location" value={detail.address} />
                          <InfoRow label="Culture tag" value={detail.culture_tag} />
                          <InfoRow label="Sound ID" value={detail.audio_id} />
                          <InfoRow label="Filter ID" value={detail.filter_id} />
                          <InfoRow label="Template ID" value={detail.template_id} />
                        </>
                      )}
                    </div>

                    {/* moderation audit */}
                    {detail && (detail.moderated_at || detail.moderation_reason) && (
                      <div>
                        <h6 className="card-title text-base mb-2">Moderation audit</h6>
                        <InfoRow label="Moderated by" value={detail.moderated_by} />
                        <InfoRow
                          label="Moderated at"
                          value={detail.moderated_at ? formatDate(detail.moderated_at) : null}
                        />
                        <InfoRow label="Reason" value={detail.moderation_reason} />
                      </div>
                    )}

                    {/* reports */}
                    <div>
                      <h6 className="card-title text-base mb-2">
                        Reports {detail?.reports?.length ? `(${detail.reports.length})` : ""}
                      </h6>
                      {detail?.reports?.length ? (
                        <div className="flex flex-col gap-2">
                          {detail.reports.map((r) => (
                            <div
                              key={r.uuid}
                              className="rounded-lg border border-ld p-3 flex items-start justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold capitalize">{r.type}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-lightwarning text-warning capitalize">
                                    {r.status}
                                  </span>
                                </div>
                                <p className="text-sm text-darklink mt-1">{r.reason}</p>
                              </div>
                              <span className="text-xs text-darklink shrink-0">
                                {formatDate(r.created_at)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-darklink">No reports on this video.</p>
                      )}
                    </div>

                    {/* actions */}
                    <div className="mt-auto pt-4 border-t border-ld flex flex-col gap-3">
                      {can("vflix.feature") && (
                        <FbButton
                          color={isFeatured ? "gray" : "primary"}
                          onClick={handleToggleFeature}
                          disabled={featuring}
                          isProcessing={featuring}
                          className="w-full"
                        >
                          <Icon icon="solar:star-linear" height={18} className="mr-2" />
                          {isFeatured ? "Remove from featured" : "Add to featured"}
                        </FbButton>
                      )}

                      {can("vflix.moderate") && (
                        <div className="rounded-lg border border-ld p-3 flex flex-col gap-3">
                          <div>
                            <div className="mb-1 block">
                              <Label htmlFor="detail-status" value="Change status" />
                            </div>
                            <Select
                              id="detail-status"
                              value={selected}
                              onChange={(e) => setSelected(e.target.value)}
                              sizing="md"
                            >
                              <option value="">Select a status</option>
                              {statuses.map((s) => (
                                <option key={s} value={s}>
                                  {formatStatusLabel(s)}
                                </option>
                              ))}
                            </Select>
                          </div>
                          <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Reason (optional, stored in audit trail)"
                            rows={2}
                          />
                          <FbButton
                            color="success"
                            onClick={handleUpdateStatus}
                            disabled={saving}
                            isProcessing={saving}
                          >
                            {saving ? "Applying..." : "Apply status"}
                          </FbButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default VflixDialog;
