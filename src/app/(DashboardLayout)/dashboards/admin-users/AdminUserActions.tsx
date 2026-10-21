"use client";
import { Dropdown, DropdownItem, Select, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { resetStaffAuthenticator, resetStaffPassword, updateStaffMember } from "@/app/api/admin-user";
import { STAFF_ROLES, usePermissions } from "@/utils/permissions";

// Super admins change a staff member's role, or turn their access off and on.
const AdminUserActions = ({ user }: { user: IAdminUsers }) => {
  const { can } = usePermissions();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [role, setRole] = useState(user.is_super_admin ? "super_admin" : user.role);
  const [loading, setLoading] = useState<boolean>(false);

  if (!can("staff.manage")) return null;

  const reset = async (kind: "password" | "authenticator") => {
    const what = kind === "password" ? "email them a new temporary password" : "make them set up their authenticator again";
    if (!window.confirm(`This signs ${user.name} out and will ${what}. Continue?`)) return;
    setLoading(true);
    try {
      const res = kind === "password" ? await resetStaffPassword(user.uuid) : await resetStaffAuthenticator(user.uuid);
      if (res?.status) toast.success(res.message || "Done");
      else toast.error(res?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const save = async (change: { role?: string; is_active?: boolean }, done: string) => {
    setLoading(true);
    try {
      const res = await updateStaffMember(user.uuid, change);
      if (res?.status) {
        toast.success(done);
        setShowModal(false);
      } else {
        toast.error(res?.message || "Failed to update staff member");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating staff member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
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
        <DropdownItem onClick={() => setShowModal(true)}>Change role</DropdownItem>
        <DropdownItem onClick={() => reset("password")}>Reset password</DropdownItem>
        <DropdownItem onClick={() => reset("authenticator")}>Reset authenticator</DropdownItem>
        {user.is_active ? (
          <DropdownItem onClick={() => save({ is_active: false }, `${user.name} can no longer sign in`)}>
            Turn off access
          </DropdownItem>
        ) : (
          <DropdownItem onClick={() => save({ is_active: true }, `${user.name} can sign in again`)}>
            Turn on access
          </DropdownItem>
        )}
      </Dropdown>

      <AnimatePresence>
        {showModal && (
          <Dialog onClose={() => setShowModal(false)} open={showModal} className="relative z-50">
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
                  <DialogTitle className="text-xl font-semibold">Change role</DialogTitle>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800">
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {user.name} ({user.email}). The new role applies from their next request; their menu updates when
                  they next sign in.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    save({ role }, `${user.name} is now ${STAFF_ROLES.find((r) => r.value === role)?.label ?? role}`);
                  }}
                >
                  <Select value={role} onChange={(e) => setRole(e.target.value)} required sizing="md" className="w-full">
                    {STAFF_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                  <div className="flex justify-end gap-4 mt-8">
                    <Button color="gray" type="button" onClick={() => setShowModal(false)} disabled={loading}>
                      Cancel
                    </Button>
                    <Button color="success" type="submit" disabled={loading}>
                      {loading && <Spinner size="sm" light />}
                      {loading ? "Saving..." : "Save"}
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

export default AdminUserActions;
