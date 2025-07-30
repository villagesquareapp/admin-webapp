"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Label, TextInput, FileInput, Select } from "flowbite-react";
import { toast } from "sonner";
import { addGifts } from "@/app/api/addGiftClient";
// import { addGiftClient } from "@/app/api/addGiftClient";

interface AddGiftModalProps {
  isOpen?: boolean;
  onClose: () => void;
  token?: string;
  onGiftAdded?: () => void;
}

const AdminAddAdminModal: React.FC<AddGiftModalProps> = ({
  isOpen,
  onClose,
  token,
  onGiftAdded,
}) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
//   const [icon, setIcon] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState("");

  // const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setIcon(e.target.files[0]);
  //   }

  //   console.log("Selected Icon", icon)
  // };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();

//     if (!name || !email || !selected) {
//       toast.error("Please fill the form");
//       return;
//     }
//     // Submit logic here (e.g., API call)
//     setLoading(true);
//     try {
//     //   const response = await addGifts(name, value, icon as File, token);

//       console.log(response);

//       if (response.status) {
//         toast.success("Gift added successfully");

//         // Reset form
//         setName("");
//         setEmail("");
//         // setIcon(null);

//         // Optional callbacks
//         onGiftAdded();
//         onClose();
//       } else {
//         toast.error(response.message || "Something went wrong");
//       }
//     } catch (error) {
//       console.error("Error adding gift:", error);
//       toast.error("Failed to add gift.");
//     } finally {
//       setLoading(false);
//     }
//   };

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
                  Add New Gift
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <form className="mt-6">
                <div className="mb-4">
                  <div className="mb-2 block">
                    <Label htmlFor="name" value="Name" />
                  </div>
                  <TextInput
                    id="name"
                    type="text"
                    sizing="md"
                    placeholder=""
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    // {...form.register("email")}
                    // className={`form-control ${
                    //   form.formState.errors.email ? "border-red-500" : ""
                    // }`}
                  />
                  {/* {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )} */}
                </div>
                <div className="mb-4">
                  <div className="mb-2 block">
                    <Label htmlFor="value" value="Value" />
                  </div>
                  <TextInput
                    id="email"
                    type="email"
                    sizing="md"
                    placeholder=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {/* <div className="mb-4">
                  <div className="mb-2 block">
                    <Label htmlFor="icon" value="Icon" />
                  </div>
                  <FileInput
                    id="gift-icon"
                    // onChange={handleIconChange}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      console.log("Selected File:", file);
                      setIcon(file ?? null);
                    }}
                    accept="image/*"
                    required
                  />
                </div> */}
                <div className="w-full">
                  <Select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    required
                    sizing={"md"}
                    className="w-full"
                  >
                    <option value="">Select a user status</option>
                    {/* {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.name}
                      </option>
                    ))} */}
                  </Select>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    color="gray"
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="success"
                    type="submit"
                    isProcessing={loading}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
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

export default AdminAddAdminModal;
