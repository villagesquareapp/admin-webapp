"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Label, TextInput, FileInput } from "flowbite-react";
import React, { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { enableGift, disableGift } from "@/app/api/gift";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gift: IGifting | null;
refreshGifts: () => void;
}

const ChangeGiftStatus: React.FC<Props> = ({ isOpen, onClose, gift, refreshGifts}) => {
  const [name, setName] = useState(gift?.name);
  const [value, setValue] = useState(gift?.value.toString());
  // const [icon, setIcon] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setName(gift?.name);
    setValue(gift?.value.toString());
    // setIcon(null);
  }, [gift]);

  const handleStatusChange = async () => {
    if (!gift) return;
    setLoading(true);

    try {
      const response = gift?.status
        ? await disableGift(gift?.uuid)
        : await enableGift(gift?.uuid);
      if (response.status) {
        toast.success(
          `${gift.name} has been ${
            gift.status ? "disabled" : "enabled"
          } successfully`
        );
        onClose();
        refreshGifts();
      } else {
        toast.error(response.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Error occured");
    } finally {
      setLoading(false);
    }
  };

  if (!gift) return null;

  const action = gift.status ? "disable" : "enable";
  const buttonColor = gift.status ? "failure" : "success";

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog onClose={onClose} open={isOpen} className="relative z-50">
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
              <div className="mb-4">
                <DialogTitle className="text-xl font-semibold mb-2">
                  Confirm Action
                </DialogTitle>
              </div>
              <p>
                Are you sure you want to <strong>{action}</strong> this gift
              </p>

              <div className="flex justify-end gap-4">
                <Button
                  color="gray"
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                >
                  No
                </Button>
                <Button
                  color={buttonColor}
                  onClick={handleStatusChange}
                  isProcessing={loading}
                >
                  {loading
                    ? `${action.charAt(0).toUpperCase() + action.slice(1)}...`
                    : action.charAt(0).toUpperCase() + action.slice(1)}
                </Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ChangeGiftStatus;
