"use client";

import { sendBroadcastPushNotification } from "@/app/api/push-notification";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button, Label, Select, Textarea, TextInput } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { toast } from "sonner";

const AdminAddPushNotification = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [category, setCategory] = useState<string>("all_users");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a notification title");
      return;
    }

    if (!body.trim()) {
      toast.error("Please enter a notification body");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);
    try {
      const response = await sendBroadcastPushNotification(title, body, category);

      if (response?.status) {
        toast.success("Notification sent successfully!");
        handleClose();
      } else {
        toast.error(response?.message || "Failed to send notification");
      }
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      toast.error(error?.message || "Failed to send notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setBody("");
    setCategory("all_users");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          onClose={handleClose}
          static
          open={isOpen}
          className="relative z-50"
        >
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30"
          />

          {/* Centered panel */}
          <div className="fixed inset-0 mx-auto flex items-center justify-center p-4">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[500px] md:max-w-[600px] lg:max-w-[700px] flex flex-col p-6 lg:p-8 gap-6 lg:gap-8 rounded-lg bg-white dark:bg-darkgray shadow-md dark:dark-shadow-md"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  Send Notification
                </DialogTitle>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                  disabled={loading}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {/* Title */}
                <div className="mb-4">
                  <div className="mb-2 block">
                    <Label htmlFor="title" value="Title" />
                  </div>
                  <TextInput
                    id="title"
                    type="text"
                    sizing="md"
                    placeholder="Enter notification title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                {/* Body */}
                <div className="mb-4">
                  <div className="mb-2 block">
                    <Label htmlFor="body" value="Body" />
                  </div>
                  <Textarea
                    id="body"
                    placeholder="Write your notification here..."
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                {/* Category + Submit Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                  {/* Select Category */}
                  <div className="flex-1 w-full">
                    <Label
                      htmlFor="category"
                      value="Select Category"
                      className="mb-2 block"
                    />
                    
                    <Select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={loading}
                      required
                    >
                      <option value="" disabled>Select a category</option>
                      <option value="all_users">All Users</option>
                      {/* Add more categories as needed */}
                      {/* <option value="premium_users">Premium Users</option>
                      <option value="verified_users">Verified Users</option> */}
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <Button
                    color="success"
                    type="submit"
                    isProcessing={loading}
                    disabled={loading}
                    className="h-fit mt-6 md:mt-8 px-6"
                  >
                    {loading ? "Sending..." : "Submit"}
                  </Button>
                </div>

                {/* Cancel Button */}
                <div className="flex justify-start">
                  <Button
                    color="gray"
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default AdminAddPushNotification;