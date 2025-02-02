"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { Button, Label, TextInput } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { PiEmpty } from "react-icons/pi";

const CategoryDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [category, setCategory] = useState<string[]>([]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
          className="relative z-50"
        >
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <DialogPanel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-[1100px] flex flex-col h-fit max-h-[850px] overflow-hidden rounded-lg bg-white dark:bg-darkgray shadow-md dark:dark-shadow-md"
              >
                <div className="sticky top-0 bg-white dark:bg-darkgray border-b dark:border-gray-600 z-50">
                  <div className="flex items-center justify-between px-6 py-4">
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Add Category
                    </DialogTitle>
                    <div
                      onClick={() => setIsOpen(false)}
                      className="p-1 px-2.5 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Icon icon="solar:close-circle-bold" height={30} />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <Label htmlFor="categoryName" value="Name" />
                    <div className="flex items-center mt-1 gap-2 w-full">
                      <TextInput
                        id="categoryName"
                        placeholder="Enter category name"
                        className=" w-full"
                      />
                      <Button
                        color={"primary"}
                        className="whitespace-nowrap hover:bg-lightprimary hover:text-primary  "
                      >
                        Add New
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex gap-2 items-center bg-lightgray w-fit dark:bg-gray-800/70 p-2 rounded-md">
                      <p className="font-semibold">Hello</p>
                      <FaTrash className="size-4" />
                    </div>
                  </div>
                  {!category?.length && (
                    <div className="bg-lightgray dark:bg-gray-800/70 p-6 my-6 rounded-md">
                      <div className="p-16 gap-2 items-center flex flex-col text-center">
                        <PiEmpty className="size-12" />
                        <p className="font-semibold">No category added!</p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <div className="flex gap-3 ">
                      <Button
                        color={"error"}
                        className=""
                        // onClick={() => {
                        //   router.push("/apps/settingss");
                        // }}
                      >
                        Cancel
                      </Button>
                      <Button
                        color={"primary"}
                        // onClick={handleSubmit}
                        className=" hover:bg-lightprimary hover:text-primary  "
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30"
          />
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default CategoryDialog;
