"use client";
import { Dropdown, DropdownItem, Spinner } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Label, TextInput, FileInput, Select } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { toast } from "sonner";
import { getUsers, getUserStatus, updateUserStatus } from "@/app/api/user";
import ModerateUserModal from "@/app/components/shared/ModerateUserModal";

const UserActions = ({ user, statuses, statusLoading }: { user: IUser, statuses: IUserStatusList[], statusLoading: boolean }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModerate, setShowModerate] = useState<boolean>(false);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return toast.error("Please select a status");
    if (!reason.trim()) return toast.error("Please give a reason");
    setLoading(true);
    try {
      const res = await updateUserStatus(user.user_details.profile.id, selected, reason.trim(), days);
      if (res?.status) {
        toast.success("User status updated");
        setShowModal(false);
      } else {
        toast.error(res?.message || "Failed to update user");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Error updating user status");
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
        <DropdownItem onClick={() => setShowModal(true)}>Update status</DropdownItem>
        <DropdownItem onClick={() => setShowModerate(true)}>Moderate</DropdownItem>
      </Dropdown>

      <ModerateUserModal
        userId={showModerate ? user.user_details.profile.id : null}
        open={showModerate}
        onClose={() => setShowModerate(false)}
      />

      {/* Modal */}
      {/* {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Update User</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              You are updating: <strong>{user.user_details.profile.name}</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )} */}
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
                    Update User Status
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
                      <option value="">Select a user status</option>
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {selected === "suspended" && (
                    <div className="w-full mt-4">
                      <Label htmlFor="suspend-days">Suspend for (days)</Label>
                      <TextInput
                        id="suspend-days"
                        type="number"
                        min={1}
                        max={365}
                        value={days}
                        onChange={(e) => setDays(Math.max(1, Math.min(365, Number(e.target.value) || 7)))}
                        className="mt-1"
                      />
                    </div>
                  )}
                  <div className="w-full mt-4">
                    <Label htmlFor="status-reason">Reason</Label>
                    <TextInput
                      id="status-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={1000}
                      required
                      placeholder="Shown in the enforcement log"
                      className="mt-1"
                    />
                    <p className="text-xs text-darklink mt-2">
                      Ban and suspend sign the user out and send them a notice with this reason.
                    </p>
                  </div>
                  <div className="flex justify-end gap-4 mt-8">
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
                    >
                      {loading && <Spinner size="sm" light />}
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

export default UserActions;
