import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { Button } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";

const WithdrawalDialog = ({
  isOpen,
  setIsOpen,
  selectedWithdrawal,
  content,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedWithdrawal: IPendingWithdrawals | null;
  content: React.ReactNode;
}) => {
  if (!selectedWithdrawal) return null;

  return (
    <AnimatePresence>
      <Dialog
        onClose={() => {
          setIsOpen(false);
        }}
        static
        open={isOpen}
        className="relative z-50"
      >
        <div className="sticky top-0 bg-background border-b dark:border-gray-600 z-50 m-0 h-16 p-0">
          <div className="flex items-center justify-between px-6 py-3">
            <DialogTitle className="text-center flex-1 m-0">
              {selectedWithdrawal?.user.name}
            </DialogTitle>
            <Button
              onClick={() => setIsOpen(false)}
              className="p-1 px-2.5 rounded-full transition-colors"
            >
              <Icon icon="solar:close-circle-bold" height={30} />
            </Button>
          </div>
        </div>

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
            className="w-full max-w-[500px] flex flex-col p-6 gap-6 rounded-lg bg-white dark:bg-darkgray shadow-md dark:dark-shadow-md"
          >
            {content}
          </DialogPanel>
        </div>
      </Dialog>
    </AnimatePresence>
  );
};

export default WithdrawalDialog;
