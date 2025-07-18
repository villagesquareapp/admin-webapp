"use client";

import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Label, TextInput, FileInput } from "flowbite-react";
import { toast } from "sonner";
import { addGifts } from "@/app/api/addGiftClient";
import { getExchangeRate } from "@/app/api/wallet";
import Paystack from "@paystack/inline-js";
// import { addGiftClient } from "@/app/api/addGiftClient";


interface AddGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  onGiftAdded?: () => void;
  onSuccess?: () => void;
}

const FundPaystackComp: React.FC<AddGiftModalProps> = ({
  isOpen,
  onClose,
  token,
  onGiftAdded,
  onSuccess
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const [amountInNaira, setAmountInNaira] = useState<number>(0);
  const [dollarValue, setDollarValue] = useState<string>("");
  const [cowryValue, setCowryValue] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const rawKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY
  const publicKey: string =  rawKey ?? '';
  const userEmail = "admin@admin.com";

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!amountInNaira || amountInNaira < 1) {
        setDollarValue("");
        setCowryValue("");
        return;
      }

      setLoading(true)
      try {
        const res = await getExchangeRate(amountInNaira);
        if (res?.data?.usd_value && res?.data.cowry_value) {
          setDollarValue(res.data.usd_value);
          setCowryValue(res.data.cowry_value);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch exchange rate", error);
        toast.error("Could not fetch exchange rate");
      } finally {
        setLoading(false)
      }
    };

    fetchExchangeRate();
  }, [amountInNaira]);

  // const paystackProps = typeof window !== "undefined" ? {
  //   reference: new Date().getTime().toString(),
  //   email: userEmail,
  //   amount: amountInNaira * 100,
  //   publicKey,
  //   text: loading ? "Processing..." : "Fund",
  //   className: "px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded",
  //   onSuccess: (reference: any) => {
  //     toast.success("Payment successful");
  //     console.log("✅ Paystack success:", reference);
  //     setLoading(false);
  //     onClose();
  //   },
  //   onClose: () => {
  //     toast.warning("Payment closed");
  //     setLoading(false);
  //   },
  // } : {};

  const handlePayment = () => {
    if (typeof window !== 'undefined') {
      const paystack = new Paystack();
  
      paystack.newTransaction({
        key: publicKey,
        email: userEmail,
        amount: amountInNaira * 100,
        onSuccess: (transaction) => {
          toast.success("Payment Successful");
          onSuccess?.();
          onClose()
          console.log("Payment Success:", transaction);
        },
        onCancel: () => {
          console.log("Payment cancelled");
          toast.success("Payment Cancelled");
        },
        onLoad: () => {
          console.log("Payment modal loaded");
        },
        onError: (error) => {
          console.error("Payment error:", error.message);
          toast.error(error.message);
        },
      });
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
              className="w-full max-w-[500px] md:max-w-[400px] lg:max-w-[500px] flex flex-col p-6 lg:p-8 gap-6 lg:gap-8 rounded-lg bg-white dark:bg-darkgray shadow-md dark:dark-shadow-md"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl lg:text-2xl font-semibold">
                  Fund Paystack Directly
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <form className="mt-3">
                <div className="mb-4">
                  <div className="mb-2 block">
                    <Label htmlFor="name" value="Amount In Naira" />
                  </div>
                  <TextInput
                    id="naira"
                    type="text"
                    sizing="md"
                    value={amountInNaira}
                    onChange={(e) => setAmountInNaira(Number(e.target.value))}
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
                <div className="flex items-center justify-between gap-2">
                  <div className="mb-4">
                    <div className="mb-2 block">
                      <Label htmlFor="dollar" value="Dollar Value" />
                    </div>
                    <TextInput
                      id="dollar"
                      type="text"
                      sizing="md"
                      value={dollarValue}
                      disabled
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <div className="mb-2 block">
                      <Label htmlFor="cowry" value="Cowry Value" />
                    </div>
                    <TextInput
                      id="cowry"
                      type="text"
                      sizing="md"
                      value={cowryValue}
                      disabled
                      className="w-full"
                    />
                  </div>
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
                  {amountInNaira >= 1 && (
                    // <PaystackButton {...paystackProps} />
                    <Button
                    color="success"
                    type="button"
                    onClick={handlePayment}
                    disabled={loading}
                  >
                    Fund
                  </Button>
                  )}
                  {/* <Button
                    color="success"
                    type="submit"
                    isProcessing={loading}
                    disabled={loading || !amountInNaira}
                  >
                    {loading ? "Funding..." : "Fund"}
                  </Button> */}
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

export default FundPaystackComp;
