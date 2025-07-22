"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Label, TextInput, FileInput } from "flowbite-react";
import React, { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { editGift } from "@/app/api/gift";
import { editCoin } from "@/app/api/coin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  coin: ICoins;
  // onGiftUpdated: (updatedGift: IGifting) => void;
  onCoinUpdated: () => void | Promise<void>;
}

const EditCoin: React.FC<Props> = ({ isOpen, onClose, coin, onCoinUpdated }) => {
    // const [icon, setIcon] = useState<File | null>(null);
    const [amountValue, setAmountValue] = useState<number>(Number(coin.amount));
    const [priceValue, setPriceValue] = useState<number>(Number(coin.price));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAmountValue(Number(coin.amount));
    setPriceValue(Number(coin.price));
    // setIcon(null);
  }, [coin]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Optional: send to backend via your update API
      // const response = await updateGift(gift.uuid, { name, value, icon });

      const response = await editCoin(coin.uuid, {
        amount: Number(amountValue),
        price: Number(priceValue)
      });

      // const updatedGift: IGifting = {
      //   ...gift,
      //   name,
      //   value: Number(value),
      //   // icon: icon ? URL.createObjectURL(icon) : gift.icon, // for preview/demo
      // };

      if (response.status) {
        toast.success("Coin updated successfully");
        // onGiftUpdated({ ...gift, name, value: Number(value) });
        await onCoinUpdated();
        onClose();
      } else {
        toast.error(response.message || "Failed to update coin");
      }

      // onSave(updatedGift);
      // toast.success("Gift updated!");
      // onClose();
    } catch (err) {
      toast.error("Failed to update coin");
    } finally {
      setLoading(false);
    }
  };

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
              <div className="flex justify-between items-center mb-4">
                <DialogTitle className="text-xl font-semibold">
                  Update Coin
                </DialogTitle>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="amount" value="Amount" />
                  <TextInput
                    id="amount"
                    type="number"
                    value={amountValue}
                    onChange={(e) => setAmountValue(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="price" value="Price" />
                  <TextInput
                    id="price"
                    type="number"
                    value={priceValue}
                    onChange={(e) => setPriceValue(Number(e.target.value))}
                    required
                  />
                </div>

                {/* <div className="mb-4">
                  <Label htmlFor="icon" value="Icon" />
                  <FileInput
                    id="icon"
                    accept="image/*"
                    onChange={(e) => setIcon(e.target.files?.[0] || null)}
                  />
                </div> */}

                <div className="flex justify-end gap-4">
                  <Button color="gray" type="button" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button color="success" type="submit" isProcessing={loading}>
                    {loading ? "Saving..." : "Save"}
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

export default EditCoin;