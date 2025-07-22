"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Label, TextInput, FileInput } from "flowbite-react";
import { toast } from "sonner";
import { addCoin } from "@/app/api/coin";

interface AddCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onCoinAdded: () => void;
}

const AddCoin: React.FC<AddCoinModalProps> = ({
  isOpen,
  onClose,
  token,
  onCoinAdded,
}) => {
  const [amountValue, setAmountValue] = useState<number>();
  const [priceValue, setPriceValue] = useState<number>();
  //   const [icon, setIcon] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await addCoin(Number(amountValue), Number(priceValue));

      console.log(response);

      if (response.status) {
        toast.success("Coin added successfully");

        // Reset form
        setAmountValue(0);
        setPriceValue(0);

        // Optional callbacks
        onCoinAdded();
        onClose();
      } else {
        toast.error(response.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error adding coin:", error);
      toast.error("Failed to add coin.");
    } finally {
      setLoading(false);
    }
  };

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
                  Add New Coin
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <form className="mt-6" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div className="mb-2 block">
                    <Label htmlFor="amount" value="Amount" />
                  </div>
                  <TextInput
                    id="amount"
                    type="number"
                    sizing="md"
                    placeholder=""
                    value={amountValue}
                    onChange={(e) => setAmountValue(Number(e.target.value))}
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
                    <Label htmlFor="price" value="Price" />
                  </div>
                  <TextInput
                    id="price"
                    type="number"
                    sizing="md"
                    placeholder=""
                    value={priceValue}
                    onChange={(e) => setPriceValue(Number(e.target.value))}
                    required
                  />
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

export default AddCoin;
