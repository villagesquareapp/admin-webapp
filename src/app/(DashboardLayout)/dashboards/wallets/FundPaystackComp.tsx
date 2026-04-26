"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Label, TextInput } from "flowbite-react";
import { toast } from "sonner";
import { getExchangeRate } from "@/app/api/wallet";
import Script from "next/script";

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  onGiftAdded?: () => void;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout: (config: any) => { close: () => void };
  }
}

const FundPaystackComp: React.FC<FundModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [amountInNaira, setAmountInNaira] = useState<number>(0);
  const [dollarValue, setDollarValue] = useState<string>("");
  const [cowryValue, setCowryValue] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const publicKey: string = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? "";
  const userEmail = "admin@admin.com";

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!amountInNaira || amountInNaira < 1) {
        setDollarValue("");
        setCowryValue("");
        return;
      }
      setLoading(true);
      try {
        const res = await getExchangeRate(amountInNaira);
        if (res?.data?.usd_value && res?.data?.cowry_value) {
          setDollarValue(res.data.usd_value);
          setCowryValue(res.data.cowry_value);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate", error);
        toast.error("Could not fetch exchange rate");
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, [amountInNaira]);

  const handlePayment = () => {
    if (typeof window === "undefined" || !window.FlutterwaveCheckout) {
      toast.error("Payment library not loaded. Please try again.");
      return;
    }

    const modal = window.FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: `fund-paystack-${Date.now()}`,
      amount: amountInNaira,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: {
        email: userEmail,
        name: "Admin",
      },
      customizations: {
        title: "Fund Flutterwave Wallet",
        description: "Direct Flutterwave wallet funding",
      },
      callback: (payment: any) => {
        console.log("Payment response:", payment);
        if (payment.status === "successful") {
          toast.success("Payment Successful");
          onSuccess?.();
          modal.close();
          onClose();
        } else {
          toast.error("Payment was not successful");
          modal.close();
        }
      },
      onclose: (incomplete: boolean) => {
        if (incomplete) {
          toast.warning("Payment cancelled");
        }
      },
    });
  };

  return (
    <>
      <Script src="https://checkout.flutterwave.com/v3.js" strategy="lazyOnload" />

      <AnimatePresence>
        {isOpen && (
          <Dialog onClose={onClose} static open={isOpen} className="relative z-50">
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
                className="w-full max-w-[500px] md:max-w-[400px] lg:max-w-[500px] flex flex-col p-6 lg:p-8 gap-6 lg:gap-8 rounded-lg bg-white dark:bg-darkgray shadow-md"
              >
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl lg:text-2xl font-semibold">
                    Fund Wallet Directly
                  </DialogTitle>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    ✕
                  </button>
                </div>

                <form className="mt-3">
                  <div className="mb-4">
                    <div className="mb-2 block">
                      <Label htmlFor="naira" value="Amount In Naira" />
                    </div>
                    <TextInput
                      id="naira"
                      type="number"
                      sizing="md"
                      value={amountInNaira || ""}
                      onChange={(e) => setAmountInNaira(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="mb-4 flex-1">
                      <div className="mb-2 block">
                        <Label htmlFor="dollar" value="Dollar Value" />
                      </div>
                      <TextInput
                        id="dollar"
                        type="text"
                        sizing="md"
                        value={loading ? "..." : dollarValue}
                        disabled
                      />
                    </div>
                    <div className="mb-4 flex-1">
                      <div className="mb-2 block">
                        <Label htmlFor="cowry" value="Cowry Value" />
                      </div>
                      <TextInput
                        id="cowry"
                        type="text"
                        sizing="md"
                        value={loading ? "..." : cowryValue}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button color="gray" type="button" onClick={onClose} disabled={loading}>
                      Cancel
                    </Button>
                    {amountInNaira >= 1 && (
                      <Button
                        color="success"
                        type="button"
                        onClick={handlePayment}
                        disabled={loading}
                      >
                        Fund
                      </Button>
                    )}
                  </div>
                </form>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default FundPaystackComp;
