"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Label, TextInput } from "flowbite-react";
import { toast } from "sonner";
import { getCowryTopupMetadata, getExchangeRate, verifyCowryTransaction } from "@/app/api/wallet";
import Script from "next/script";

interface TopUpModalProps {
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

const TopUpCowryComp: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [amountInNaira, setAmountInNaira] = useState<number>(0);
  const [dollarValue, setDollarValue] = useState<string>("");
  const [cowryValue, setCowryValue] = useState<string>("");
  const [cowryTopup, setCowryTopup] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMetadata, setLoadingMetadata] = useState<boolean>(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const publicKey: string = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? "";
  const userEmail = "admin@admin.com";

  // Check if script is already loaded on mount
  useEffect(() => {
    if ("FlutterwaveCheckout" in window) {
      setScriptLoaded(true);
    }
  }, []);

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

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoadingMetadata(true);
      try {
        const response = await getCowryTopupMetadata();
        if (response?.data?.payment_event && response.data.payment_user_id) {
          setCowryTopup(response.data.payment_event);
          setUserId(response.data.payment_user_id);
        }
      } catch (error) {
        toast.error("Failed to load payment metadata");
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  const handlePayment = () => {
    if (typeof window === "undefined" || !window.FlutterwaveCheckout) {
      toast.error("Payment library is still loading. Please wait a moment and try again.");
      return;
    }

    if (!publicKey) {
      toast.error("Payment configuration missing. Contact support.");
      return;
    }

    const modal = window.FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: `cowry-topup-${Date.now()}`,
      amount: amountInNaira,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: {
        email: userEmail,
        name: "Admin",
      },
      meta: {
        payment_event: cowryTopup,
        payment_user_id: userId,
      },
      customizations: {
        title: "Top Up Cowry",
        description: "VS Cowry wallet top up",
      },
      callback: async (payment: any) => {
        console.log("Payment response:", payment);
        if (payment.status === "successful") {
          toast.success("Payment Successful");
          modal.close();

          try {
            const result = await verifyCowryTransaction(String(payment.transaction_id));
            console.log("Transaction Verified:", result);
            toast.success("Cowry updated!");
            onSuccess?.();
            onClose();
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Transaction verification failed");
          }
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
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        strategy="afterInteractive"
        onReady={() => setScriptLoaded(true)}
      />

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
                    Top Up Cowry
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
                    <Button
                      color="gray"
                      type="button"
                      onClick={onClose}
                      disabled={loading || loadingMetadata}
                    >
                      Cancel
                    </Button>
                    {amountInNaira >= 1 && (
                      <Button
                        color="success"
                        type="button"
                        onClick={handlePayment}
                        disabled={loading || loadingMetadata || !scriptLoaded}
                      >
                        {!scriptLoaded ? "Loading..." : "Top Up"}
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

export default TopUpCowryComp;
