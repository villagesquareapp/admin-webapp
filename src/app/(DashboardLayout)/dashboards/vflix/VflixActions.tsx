"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Dropdown, Label, Select, Textarea } from "flowbite-react";
import { useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { toast } from "sonner";
import {
  featureVflixVideo,
  unfeatureVflixVideo,
  updateVflixStatus,
} from "@/app/api/vflix";
import { can } from "@/utils/permissions";
import { formatStatusLabel } from "./vflixStatus";

/**
 * Row-level moderation actions for a VFlix video.
 * - Update status (§4.6) is the takedown/restore mechanism; captures an
 *   optional reason for the audit trail.
 * - Feature / unfeature (§4.7).
 * Buttons are wrapped in can() so they can be permission-gated later (§7).
 */
const VflixActions = ({
  video,
  statuses,
  statusLoading,
}: {
  video: IVflixVideo;
  statuses: string[];
  statusLoading: boolean;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [featuring, setFeaturing] = useState(false);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const canModerate = can("vflix.moderate");
  const canFeature = can("vflix.feature");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return toast.error("Please select a status");
    setLoading(true);
    try {
      const res = await updateVflixStatus(video.uuid, selected, reason || undefined);
      if (res?.status) {
        toast.success("Video status updated");
        setShowModal(false);
        setReason("");
        setSelected("");
      } else {
        toast.error(res?.message || "Failed to update video status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating video status");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async () => {
    setFeaturing(true);
    try {
      const res = video.is_featured
        ? await unfeatureVflixVideo(video.uuid)
        : await featureVflixVideo(video.uuid);
      if (res?.status) {
        toast.success(video.is_featured ? "Removed from featured" : "Added to featured");
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
    <div className="flex justify-end" onClick={stop}>
      <Dropdown
        label=""
        inline
        dismissOnClick
        renderTrigger={() => (
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <HiOutlineDotsVertical className="text-lg" />
          </button>
        )}
      >
        {canModerate && (
          <Dropdown.Item onClick={() => setShowModal(true)}>
            Update status
          </Dropdown.Item>
        )}
        {canFeature && (
          <Dropdown.Item onClick={handleToggleFeature} disabled={featuring}>
            {video.is_featured ? "Unfeature" : "Feature"}
          </Dropdown.Item>
        )}
      </Dropdown>

      <AnimatePresence>
        {showModal && (
          <Dialog
            onClose={() => setShowModal(false)}
            open={showModal}
            className="relative z-50"
          >
            <motion.div
              className="fixed inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg p-6 bg-white dark:bg-darkgray rounded-lg shadow-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <DialogTitle className="text-xl font-semibold">
                    Update Video Status
                  </DialogTitle>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="vflix-status" value="Status" />
                    </div>
                    <Select
                      id="vflix-status"
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                      required
                      sizing="md"
                      className="w-full"
                    >
                      <option value="">Select a status</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {formatStatusLabel(status)}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="vflix-reason" value="Reason (optional)" />
                    </div>
                    <Textarea
                      id="vflix-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. nudity — policy 3.2"
                      rows={3}
                      className="w-full"
                    />
                    <p className="text-xs text-darklink mt-1">
                      Stored in the moderation audit trail.
                    </p>
                  </div>

                  <div className="flex justify-end gap-4 mt-2">
                    <Button
                      color="gray"
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="success"
                      type="submit"
                      disabled={loading || statusLoading}
                      isProcessing={loading}
                    >
                      {loading ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </form>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VflixActions;
