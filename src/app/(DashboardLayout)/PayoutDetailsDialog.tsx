import { formatNumber } from "@/utils/formatNumber";
import { formatDate } from "@/utils/dateUtils";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Label, Textarea } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import Image from "next/image";
import { IoMdCheckmark } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { useState } from "react";
import { approvePayouts, declinePayouts } from "../api/wallet";
import { batchFailureMessage, batchFailures, payoutBlock } from "@/utils/payoutBatch";
import { toast } from "sonner";

const PayoutDetailsDialog = ({
    isOpen,
    setIsOpen,
    payout,
    onPayoutAction
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    payout: IQueuedPayout | null;
    onPayoutAction?: (uuid: string, action: 'approved' | 'declined') => void;
}) => {
    const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [isDeclining, setIsDeclining] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    if (!payout) return null;

    const handleDeclinePayout = async () => {
        if (!payout?.uuid || !declineReason.trim()) return;

        try {
            setIsDeclining(true);
            const response = await declinePayouts([payout.uuid], declineReason);
            const failures = batchFailures(response);
            if (response?.status && failures.length) {
                toast.error(batchFailureMessage(failures, 1));
            } else if (response?.status) {
                setIsDeclineDialogOpen(false);
                setIsOpen(false);
                onPayoutAction?.(payout.uuid, 'declined');
                toast.success("Payout declined; the money is back in their earnings");
            } else {
                toast.error(response?.message || "Failed to decline the payout");
            }
        } catch (error) {
            console.error("Error declining payout:", error);
            toast.error("An error occurred while declining the payout");
        } finally {
            setIsDeclining(false);
            setDeclineReason("");
        }
    };

    const handleApprovePayout = async () => {
        if (!payout?.uuid) return;

        try {
            setIsApproving(true);
            const response = await approvePayouts([payout.uuid]);
            const failures = batchFailures(response);
            if (response?.status && failures.length) {
                toast.error(batchFailureMessage(failures, 1));
            } else if (response?.status) {
                setIsApproveDialogOpen(false);
                setIsOpen(false);
                onPayoutAction?.(payout.uuid, 'approved');
                toast.success("Payout approved and sent");
            } else {
                toast.error(response?.message || "Failed to approve the payout");
            }
        } catch (error) {
            console.error("Error approving payout:", error);
            toast.error("An error occurred while approving the payout");
        } finally {
            setIsApproving(false);
        }
    };

    return (
        <AnimatePresence>
            <Dialog
                key="details"
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
                                Payout details
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
                                    {payout.user.profile_picture ? (
                                        <Image
                                            src={payout.user.profile_picture}
                                            alt={payout.user.name}
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
                                    <h3 className="text-lg lg:text-xl font-semibold">{payout.user.name}</h3>
                                    <p className="text-gray-500 lg:text-lg">@{payout.user.username}</p>
                                    <p className="text-sm lg:text-base text-gray-500">{payout.user.email}</p>
                                </div>
                            </div>

                            {/* Payout details */}
                            <div className="grid grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                    <p className="text-sm lg:text-base text-gray-500">Current Balance</p>
                                    <p className="text-lg lg:text-xl font-semibold">
                                        CWR {formatNumber(payout.cowry_balance)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm lg:text-base text-gray-500">Payout Amount</p>
                                    <p className="text-lg lg:text-xl font-semibold text-primary">
                                        CWR {formatNumber(payout.amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm lg:text-base text-gray-500">Last Payout</p>
                                    <p className="text-lg lg:text-xl font-semibold">
                                        {payout.last_payout === null ? 'N/A' : `CWR ${formatNumber(payout.last_payout.amount)}`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm lg:text-base text-gray-500">Queued On</p>
                                    <p className="text-lg lg:text-xl font-semibold">
                                        {formatDate(payout.created_at)}
                                    </p>
                                </div>
                            </div>

                            {payoutBlock(payout) && (
                                <p className="text-sm font-semibold text-error bg-lighterror rounded-lg px-4 py-2.5">
                                    {payoutBlock(payout)}. It can&apos;t be sent until that is cleared.
                                </p>
                            )}

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
                                    disabled={!!payoutBlock(payout)}
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
                key="decline"
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
                            <h3 className="text-xl font-semibold">Decline payout</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Decline the payout of{" "}
                                <span className="font-medium">
                                    CWR {formatNumber(payout.amount)}
                                </span>{" "}
                                for <span className="font-medium">{payout.user.name}</span>? The money goes
                                back to their earnings.
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
                                onClick={handleDeclinePayout}
                                disabled={isDeclining || !declineReason.trim()}
                            >
                                {isDeclining ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Declining...
                                    </div>
                                ) : (
                                    "Decline and return the money"
                                )}
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog
                key="approve"
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
                            <h3 className="text-xl font-semibold">Approve payout</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Send the payout of{" "}
                                <span className="font-medium">
                                    CWR {formatNumber(payout.amount)}
                                </span>{" "}
                                to <span className="font-medium">{payout.user.name}</span>? It goes out
                                through Flutterwave right away.
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
                                onClick={handleApprovePayout}
                                disabled={isApproving}
                            >
                                {isApproving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Sending...
                                    </div>
                                ) : (
                                    "Approve and send"
                                )}
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </AnimatePresence>
    );
};

export default PayoutDetailsDialog;
