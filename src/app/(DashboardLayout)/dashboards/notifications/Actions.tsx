"use client";

import React, { useState } from "react";
import { Dropdown, DropdownItem, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { HiOutlineDotsVertical, HiOutlineExclamationCircle } from "react-icons/hi";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; 

interface ActionsProps {
  notification: IPushNotifications;
  onResend?: (notification_id: string) => Promise<any>;
  onDelete?: (notification_id: string) => Promise<any>;
}

const Actions = ({ notification, onResend, onDelete }: ActionsProps) => {
  const router = useRouter(); 
  const [showResendModal, setShowResendModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleResend = async () => {
    if (!onResend) return;
    
    setIsLoading(true);
    try {
      const response = await onResend(notification.uuid);
      if (response.status) {
        toast.success("Notification resent successfully!");
        setShowResendModal(false);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to resend notification");
      }
    } catch (error) {
      toast.error("An error occurred while resending notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsLoading(true);
    try {
      const response = await onDelete(notification.uuid);
      if (response.status) {
        toast.success("Notification deleted successfully!");
        setShowDeleteModal(false);
        router.refresh(); 
      } else {
        toast.error(response.message || "Failed to delete notification");
      }
    } catch (error) {
      toast.error("An error occurred while deleting notification");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dropdown
        label=""
        inline
        dismissOnClick={false}
        renderTrigger={() => (
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <HiOutlineDotsVertical className="text-lg text-gray-600 dark:text-gray-400" />
          </button>
        )}
      >
        <DropdownItem onClick={() => setShowResendModal(true)}>
          Resend
        </DropdownItem>
        <DropdownItem
          onClick={() => setShowDeleteModal(true)}
          className="text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/20 focus:!bg-red-50"
        >
          Delete
        </DropdownItem>
      </Dropdown>

      <Modal
        show={showResendModal}
        size="lg"
        onClose={() => !isLoading && setShowResendModal(false)}
        popup
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to resend this notification?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="gray"
                onClick={() => setShowResendModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                color="success"
                onClick={handleResend}
                disabled={isLoading}
              >
                {isLoading && <Spinner size="sm" light />}
                Yes, Resend
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        show={showDeleteModal}
        size="lg"
        onClose={() => !isLoading && setShowDeleteModal(false)}
        popup
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-400 dark:text-red-300" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this notification?
            </h3>
            <p className="mb-5 text-sm text-gray-400 dark:text-gray-500">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                color="gray"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                color="failure"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading && <Spinner size="sm" light />}
                Yes, Delete
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default Actions;