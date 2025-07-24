"use client";
import { Dropdown, Select } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Label, TextInput, FileInput } from "flowbite-react";
import { getPostStatus, updatePostStatus } from "@/app/api/post";
import { toast } from "sonner";

const PostActions = ({ post }: { post: IPosts }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [statuses, setStatuses] = useState<IPostStatusList[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusLoading(true);
      try {
        const res = await getPostStatus();
        setStatuses(res?.data || []);
        setStatusLoading(false);
      } catch (error) {
        console.error("Failed to load post statuses:", error);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return toast.error("Please select a status");
    setLoading(true);
    try {
      const res = await updatePostStatus(post.uuid, selected);
      if (res?.status) {
        toast.success("Post status updated");
        setShowModal(false);
      } else {
        toast.error(res?.message || "Failed to update post status");
      }
      setLoading(false)
    } catch (error) {
      console.error(error);
      toast.error("Error updating post status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end" onClick={handleClick}>
      <Dropdown
        label=""
        inline
        dismissOnClick={false}
        renderTrigger={() => (
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <HiOutlineDotsVertical className="text-lg" />
          </button>
        )}
      >
        <Dropdown.Item onClick={() => setShowModal(true)}>Update</Dropdown.Item>
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
                    Update Post Status
                  </DialogTitle>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="w-full">
                    <Select
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                      required
                      sizing={'md'}
                      className="w-full"
                    >
                      <option value="">Select a post status</option>
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex justify-end gap-4 mt-8">
                    <Button
                      color="gray"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button color="success" type="submit" disabled={loading || statusLoading} isProcessing={loading}>
                      {loading ? "Updating...": "Update"}
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

export default PostActions;
