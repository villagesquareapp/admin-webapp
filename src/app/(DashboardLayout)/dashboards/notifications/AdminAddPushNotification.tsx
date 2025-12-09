"use client";

import { sendBroadcastPushNotification } from "@/app/api/push-notification";
import { getSearchUser } from "@/app/api/user";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button, Label, Select, Textarea, TextInput } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FaSearch, FaUser } from "react-icons/fa";
import { HiCheck, HiX } from "react-icons/hi";
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
  const [category, setCategory] = useState<string>("broadcast");
  const [target, setTarget] = useState<string>("all_users");

  const [currentView, setCurrentView] = useState<"form" | "search">("form");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<IRandomUsers[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<IRandomUsers[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await getSearchUser(searchQuery);
        setSearchResults(response?.data || []);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await getSearchUser(searchQuery);
      setSearchResults(response?.data || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleUserSelection = (user: IRandomUsers) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.uuid === user.uuid);
      if (isSelected) {
        return prev.filter((u) => u.uuid !== user.uuid);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.uuid !== userId));
  };

  const handleFinalSubmit = async () => {
    if (target === "specific_users" && selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setLoading(true);
    try {
      const userIds =
        target === "all_users"
          ? ["00000000-0000-0000-0000-000000000000"]
          : selectedUsers.map((u) => u.uuid);
      // For specific users, we might need to handle how 'category' interacts.
      // Assuming logic: if specific users, category might be ignored or used as metadata.
      // But the original component required category. We'll keep sending it.

      const response = await sendBroadcastPushNotification(
        title,
        body,
        category,
        userIds
      );

      if (response?.status) {
        toast.success("Notification sent successfully!");
        handleClose();
      } else {
        toast.error(response?.message || "Failed to send notification");
      }
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      toast.error(
        error?.message || "Failed to send notification. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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

    if (target === "specific_users") {
      setCurrentView("search");
      return;
    }

    // Default 'All Users' submission
    handleFinalSubmit();
  };

  const handleClose = () => {
    setTitle("");
    setBody("");
    setCategory("all_users");
    setTarget("all_users");
    setCurrentView("form");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30"
          />

          <div className="fixed inset-0 mx-auto flex items-center justify-center p-4">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[500px] md:max-w-[600px] lg:max-w-[700px] flex flex-col p-6 lg:p-8 gap-6 lg:gap-8 rounded-lg bg-white dark:bg-darkgray shadow-md dark:dark-shadow-md"
            >
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

              <div className="relative overflow-hidden mt-6">
                <AnimatePresence mode="wait">
                  {currentView === "form" ? (
                    <motion.div
                      key="form"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
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
                          maxLength={100}
                        />
                        <div className="text-right text-sm text-gray-500">
                          {title.length}/100
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="mb-2 block">
                          <Label htmlFor="body" value="Body" />
                        </div>
                        <Textarea
                          id="body"
                          placeholder="Write your notification here..."
                          rows={6}
                          value={body}
                          onChange={(e) =>
                            setBody(e.target.value.slice(0, 1000))
                          }
                          disabled={loading}
                          maxLength={300}
                          required
                        />
                        <div className="text-right text-sm text-gray-500">
                          {body.length}/300
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
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
                            <option value="" disabled>
                              Select a category
                            </option>
                            <option value="broadcast">Broadcast</option>
                          </Select>
                        </div>

                        <div className="flex-1 w-full">
                          <Label
                            htmlFor="target"
                            value="Select Target"
                            className="mb-2 block"
                          />

                          <Select
                            id="target"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            disabled={loading}
                            required
                          >
                            <option value="all_users">All Users</option>
                            <option value="specific_users">
                              Specific Users
                            </option>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-between gap-4">
                        <Button
                          color="gray"
                          type="button"
                          onClick={handleClose}
                          disabled={loading}
                        >
                          Cancel
                        </Button>

                        <Button
                          color="success"
                          type="button"
                          isProcessing={loading}
                          disabled={loading}
                          onClick={(e) => handleSubmit(e as any)}
                          className="px-6"
                        >
                          {loading
                            ? "Sending..."
                            : target === "specific_users"
                            ? "Next"
                            : "Submit"}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Selected Users List */}
                      {selectedUsers.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                          {selectedUsers.map((user) => (
                            <div
                              key={user.uuid}
                              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full whitespace-nowrap"
                            >
                              <div className="relative">
                                {user.profile_picture ? (
                                  <img
                                    src={user.profile_picture}
                                    alt={user.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <FaUser className="text-gray-600 dark:text-gray-300 text-xs" />
                                  </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                                  <HiCheck className="text-white text-[8px]" />
                                </div>
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {user.name}
                              </span>
                              <button
                                onClick={() => handleRemoveUser(user.uuid)}
                                className="ml-1 text-gray-400 hover:text-red-500"
                              >
                                <HiX />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Search Input */}
                      <div className="relative">
                        <TextInput
                          type="text"
                          placeholder="Search users by name, username, or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          icon={FaSearch}
                        />
                      </div>

                      {/* Search Results Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[300px] overflow-y-auto p-1">
                        {isSearching ? (
                          <div className="col-span-full flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((user) => {
                            const isSelected = selectedUsers.some(
                              (u) => u.uuid === user.uuid
                            );
                            return (
                              <div
                                key={user.uuid}
                                onClick={() => toggleUserSelection(user)}
                                className={`
                                            relative flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                                            ${
                                              isSelected
                                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                : "border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }
                                        `}
                              >
                                <div className="relative mb-2">
                                  {user.profile_picture ? (
                                    <img
                                      src={user.profile_picture}
                                      alt={user.name}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                      <FaUser className="text-gray-600 dark:text-gray-300" />
                                    </div>
                                  )}
                                  {isSelected && (
                                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                                      <HiCheck className="text-white text-xs" />
                                    </div>
                                  )}
                                </div>
                                <p className="font-medium text-sm text-center text-gray-900 dark:text-white truncate w-full">
                                  {user.name}
                                </p>
                                <p className="text-xs text-center text-gray-500 dark:text-gray-400 truncate w-full">
                                  @{user.username}
                                </p>
                              </div>
                            );
                          })
                        ) : searchQuery.trim() ? (
                          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                            No users found
                          </div>
                        ) : (
                          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                            Start typing to search for users
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                        <Button
                          color="gray"
                          onClick={() => setCurrentView("form")}
                          disabled={loading}
                        >
                          Back
                        </Button>
                        <Button
                          color="success"
                          onClick={handleFinalSubmit}
                          disabled={loading || selectedUsers.length === 0}
                          isProcessing={loading}
                        >
                          {loading ? "Sending..." : "Submit"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default AdminAddPushNotification;
