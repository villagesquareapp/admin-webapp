"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button, Label, Select, Textarea, TextInput } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

const AdminAddPushNotification = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [loading, setLoading] = useState(false);
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          onClose={onClose}
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
                <DialogTitle className="text-xl lg:text-2xl font-semibold">
                  Send Notification
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <form className="mt-6 space-y-6">
                {/* Title */}
                <div className="mb-4">
                  <div className="mb-2 block">
                    <Label htmlFor="name" value="Title" />
                  </div>
                  <TextInput
                    id="title"
                    type="text"
                    sizing="md"
                    placeholder=""
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Body */}
                <div className="mb-4">
                  <div className="mb-2 block">
                    <Label htmlFor="value" value="Body" />
                  </div>
                  <Textarea
                    id="body"
                    placeholder="Write your notification here..."
                    rows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
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
                    {/* <select
                      id="category"
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-darkgray p-2"
                      required
                    >
                      <option value="">Choose a category</option>
                      <option value="general">General</option>
                      <option value="users">Users</option>
                      <option value="creators">Creators</option>
                      <option value="admins">Admins</option>
                    </select> */}
                    <Select
                      id="category"
                    //   value={verificationType}
                    //   onChange={(e) => setVerificationType(e.target.value)}
                    >
                      <option value="" disabled>Select a category</option>
                      <option value="all_users">All Users</option>
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
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </div>

                {/* Cancel Button */}
                <div className="flex justify-start">
                  <Button
                    color="gray"
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              {/* Modal Footer */}
              {/* <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 text-sm font-medium bg-gray-300 hover:bg-gray-400 rounded"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded"
                  //   onClick={() => {
                  //     // You can replace this with real form logic
                  //     onClose();
                  //   }}
                >
                  Submit
                </button>
              </div> */}
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default AdminAddPushNotification;
