import { formatNumber } from "@/utils/formatNumber";
import { formatDate } from "@/utils/dateUtils";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { Button, Label, Textarea } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { IoMdCheckmark } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { useState } from "react";
import { approveWithdrawal, declineWithdrawal } from "../api/wallet";
import { toast } from "sonner";

const UserPendingWithdrawalInfo = ({
    isOpen,
    setIsOpen,
    withdrawal
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    withdrawal: IPendingWithdrawals | null;
}) => {
    const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [isDeclining, setIsDeclining] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    if (!withdrawal) return null;

    const handleDeclineWithdrawal = async () => {
        if (!withdrawal?.transaction_id) return;

        try {
            setIsDeclining(true);
            const response = await declineWithdrawal(withdrawal.transaction_id);
            if (response?.status) {
                setIsDeclineDialogOpen(false);
                setIsOpen(false);
                toast.success("Withdrawal request declined successfully");
            } else {
                toast.error(response?.message || "Failed to decline withdrawal");
            }
        } catch (error) {
            console.error("Error declining withdrawal:", error);
            toast.error("An error occurred while declining withdrawal");
        } finally {
            setIsDeclining(false);
            setDeclineReason("");
        }
    };

    const handleApproveWithdrawal = async () => {
        if (!withdrawal?.transaction_id) return;

        try {
            setIsApproving(true);
            const response = await approveWithdrawal(withdrawal.transaction_id);
            if (response?.status) {
                setIsApproveDialogOpen(false);
                setIsOpen(false);
                toast.success("Withdrawal request approved successfully");
            } else {
                toast.error(response?.message || "Failed to approve withdrawal");
            }
        } catch (error) {
            console.error("Error approving withdrawal:", error);
            toast.error("An error occurred while approving withdrawal");
        } finally {
            setIsApproving(false);
        }
    };

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
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl lg:text-2xl font-semibold">
                                Withdrawal Request Details
                            </DialogTitle>

                            <Icon
                                onClick={() => setIsOpen(false)}
                                icon="solar:close-circle-bold"
                                className="size-7 lg:size-8 cursor-pointer"
                            />
                        </div>

                        {/* User Info Section */}
                        <div className="flex flex-col gap-6 lg:gap-8">
                            {/* Profile Section */}
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="relative h-16 w-16 lg:h-20 lg:w-20 rounded-full overflow-hidden">
                                    {withdrawal.user.profile_picture ? (
                                        <Image
                                            src={withdrawal.user.profile_picture}
                                            alt={withdrawal.user.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <Icon icon="mdi:user" className="w-10 h-10 lg:w-12 lg:h-12 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg lg:text-xl font-semibold">{withdrawal.user.name}</h3>
                                    <p className="text-gray-500 lg:text-lg">@{withdrawal.user.username}</p>
                                    <p className="text-sm lg:text-base text-gray-500">{withdrawal.user.email}</p>
                                </div>
                            </div>

                            {/* Withdrawal Details */}
                            <div className="grid grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                    <p className="text-sm lg:text-base text-gray-500">Current Balance</p>
                                    <p className="text-lg lg:text-xl font-semibold">
                                        {withdrawal.wallet?.currency?.symbol}
                                        {formatNumber(withdrawal.wallet?.balance)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm lg:text-base text-gray-500">Withdrawal Amount</p>
                                    <p className="text-lg lg:text-xl font-semibold text-primary">
                                        {withdrawal.wallet?.currency?.symbol}
                                        {formatNumber(withdrawal.amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm lg:text-base text-gray-500">Last Withdrawal</p>
                                    <p className="text-lg lg:text-xl font-semibold">
                                        {withdrawal.wallet?.currency?.symbol}
                                        {formatNumber(withdrawal.last_withdrawal || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm lg:text-base text-gray-500">Request Date</p>
                                    <p className="text-lg lg:text-xl font-semibold">
                                        {formatDate(withdrawal.created_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-4">
                                <Button
                                    color="failure"
                                    size="sm"
                                    className="w-32 lg:w-36 lg:h-10 lg:text-base"
                                    onClick={() => setIsDeclineDialogOpen(true)}
                                >
                                    <LiaTimesSolid size={16} className="mr-2" />
                                    Decline
                                </Button>
                                <Button
                                    color="success"
                                    size="sm"
                                    className="w-32 lg:w-36 lg:h-10 lg:text-base"
                                    onClick={() => setIsApproveDialogOpen(true)}
                                >
                                    <IoMdCheckmark size={16} className="mr-2" />
                                    Approve
                                </Button>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Decline Dialog */}
            <Dialog
                open={isDeclineDialogOpen}
                onClose={() => setIsDeclineDialogOpen(false)}
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
                        className="w-full max-w-[500px] flex flex-col p-6 gap-6 rounded-lg bg-white dark:bg-darkgray shadow-md"
                    >
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xl font-semibold">Decline Withdrawal</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Are you sure you want to decline withdrawal request of{" "}
                                <span className="font-medium">
                                    {withdrawal.wallet?.currency?.symbol}
                                    {formatNumber(withdrawal.amount)}
                                </span>{" "}
                                for <span className="font-medium">{withdrawal.user.name}</span>?
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                                rows={4}
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                id="reason"
                                className="w-full form-control-textarea"
                                placeholder="Enter reason for declining..."
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => {
                                    setIsDeclineDialogOpen(false);
                                    setDeclineReason("");
                                }}
                                color="gray"
                                className="w-fit"
                                disabled={isDeclining}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="failure"
                                className="w-fit min-w-[100px]"
                                onClick={handleDeclineWithdrawal}
                                disabled={isDeclining || !declineReason.trim()}
                            >
                                {isDeclining ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Declining...
                                    </div>
                                ) : (
                                    "Decline"
                                )}
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog
                open={isApproveDialogOpen}
                onClose={() => setIsApproveDialogOpen(false)}
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
                        className="w-full max-w-[500px] flex flex-col p-6 gap-6 rounded-lg bg-white dark:bg-darkgray shadow-md"
                    >
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xl font-semibold">Approve Withdrawal</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Are you sure you want to approve withdrawal request of{" "}
                                <span className="font-medium">
                                    {withdrawal.wallet?.currency?.symbol}
                                    {formatNumber(withdrawal.amount)}
                                </span>{" "}
                                for <span className="font-medium">{withdrawal.user.name}</span>?
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => setIsApproveDialogOpen(false)}
                                color="gray"
                                className="w-fit"
                                disabled={isApproving}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="success"
                                className="w-fit min-w-[100px]"
                                onClick={handleApproveWithdrawal}
                                disabled={isApproving}
                            >
                                {isApproving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Approving...
                                    </div>
                                ) : (
                                    "Approve"
                                )}
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </AnimatePresence>
    );
};

export default UserPendingWithdrawalInfo;
