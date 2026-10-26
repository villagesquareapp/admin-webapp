"use client";

import { Checkbox, Label, Textarea } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { toast } from "sonner";
import { approvePayouts, declinePayouts, getPayoutQueue } from "../api/wallet";
import { batchFailureMessage, batchFailures } from "@/utils/payoutBatch";
import CardBox from "../components/shared/CardBox";
import useSetSearchParams from "../hooks/useSetSearchParams";
import PayoutDetailsDialog from "./PayoutDetailsDialog";
import PayoutConfirmDialog from "./PayoutConfirmDialog";
import { formatNumber } from "@/utils/formatNumber";

const PayoutQueue = ({
  selectedPayoutID,
  payouts,
  totalPages,
  currentPage,
  pageSize,
}: {
  selectedPayoutID: string;
  payouts: IPayoutQueueResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const { addParam } = useSetSearchParams();
  const [sizeForPage, setSizeForPage] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [localPayouts, setLocalPayouts] = useState<IQueuedPayout[]>([]);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [currentLocalPage, setCurrentLocalPage] = useState(1);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOpenApproval, setIsOpenApproval] = useState(false);
  const [isOpenDecline, setIsOpenDecline] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<string[]>([]);
  const [openPayoutDetails, setOpenPayoutDetails] = useState<string | null>(null);
  const [isDeclining, setIsDeclining] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<IQueuedPayout | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const router = useRouter();

  useEffect(() => {
    setSizeForPage(pageSize);
  }, [pageSize]);

  useEffect(() => {
    if (payouts?.data && !isInitialized) {
      const newData = payouts.data as unknown as IQueuedPayout[];
      setLocalPayouts(newData);
      setTotalPayouts(payouts.total || 0);
      setCurrentLocalPage(currentPage);
      setHasReachedEnd(currentPage >= totalPages);
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, [payouts, currentPage, totalPages, isInitialized]);

  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentLocalPage) return;

    setIsLoadingMore(true);
    try {
      const newPayouts = await getPayoutQueue(page, pageSize);
      if (newPayouts?.data?.data) {
        const newData = newPayouts.data.data as unknown as IQueuedPayout[];
        setLocalPayouts(newData);
        setTotalPayouts(newPayouts.data.total || 0);
        setCurrentLocalPage(page);
        setHasReachedEnd(page >= (newPayouts.data.last_page || totalPages));
      }
    } catch (error) {
      console.error("Error loading payouts:", error);
    } finally {
      setIsLoadingMore(false);
    }

    // Update URL for consistency
    const params = new URLSearchParams(window.location.search);
    params.set("pwPage", page.toString());
    params.set("pwLimit", pageSize.toString());
    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentLocalPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          color="gray"
          size="sm"
          onClick={() => handlePageChange(1)}
          className="!px-3"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          color={currentLocalPage === i ? "primary" : "gray"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="!px-3"
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          color="gray"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className="!px-3"
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  const handleApprovePayout = async () => {
    if (!selectedPayout?.uuid) return;

    try {
      setIsApproving(true);
      const response = await approvePayouts([selectedPayout.uuid]);
      if (response?.status) {
        // Refetch the current page data
        const newPayouts = await getPayoutQueue(currentLocalPage, pageSize);
        if (newPayouts?.data?.data) {
          const newData = newPayouts.data.data as unknown as IQueuedPayout[];
          setLocalPayouts(newData);
          setTotalPayouts(newPayouts.data.total || 0);
          setHasReachedEnd(currentLocalPage >= (newPayouts.data.last_page || totalPages));
        }
        const failures = batchFailures(response);
        if (failures.length) {
          toast.error(batchFailureMessage(failures, 1));
        } else {
          setIsOpenApproval(false);
          toast.success("Payout approved and sent");
        }
      } else {
        toast.error(response?.message || "Failed to approve the payout");
        console.error("Failed to approve payout:", response?.message);
      }
    } catch (error) {
      console.error("Error approving payout:", error);
      toast.error("An error occurred while approving the payout");
    } finally {
      setIsApproving(false);
    }
  };

  const handleBulkApprovePayouts = async () => {
    if (!selectedPayoutIds.length) return;

    try {
      setIsApproving(true);
      const response = await approvePayouts(selectedPayoutIds);
      if (response?.status) {
        // Refetch the current page data
        const newPayouts = await getPayoutQueue(currentLocalPage, pageSize);
        if (newPayouts?.data?.data) {
          const newData = newPayouts.data.data as unknown as IQueuedPayout[];
          setLocalPayouts(newData);
          setTotalPayouts(newPayouts.data.total || 0);
          setHasReachedEnd(currentLocalPage >= (newPayouts.data.last_page || totalPages));
        }
        const failures = batchFailures(response);
        setSelectedPayoutIds([]);
        if (failures.length) {
          toast.error(batchFailureMessage(failures, selectedPayoutIds.length));
        } else {
          toast.success("Payouts approved and sent");
        }
      } else {
        toast.error(response?.message || "Failed to approve the payouts");
        console.error("Failed to approve payouts:", response?.message);
      }
    } catch (error) {
      console.error("Error approving payouts:", error);
      toast.error("An error occurred while approving the payouts");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeclinePayout = async () => {
    if (!selectedPayout?.uuid || !declineReason.trim()) return;

    try {
      setIsDeclining(true);
      const response = await declinePayouts([selectedPayout.uuid], declineReason);
      if (response?.status) {
        // Refetch the current page data
        const newPayouts = await getPayoutQueue(currentLocalPage, pageSize);
        if (newPayouts?.data?.data) {
          const newData = newPayouts.data.data as unknown as IQueuedPayout[];
          setLocalPayouts(newData);
          setTotalPayouts(newPayouts.data.total || 0);
          setHasReachedEnd(currentLocalPage >= (newPayouts.data.last_page || totalPages));
        }
        const failures = batchFailures(response);
        if (failures.length) {
          toast.error(batchFailureMessage(failures, 1));
        } else {
          setIsOpenDecline(false);
          toast.success("Payout declined; the money is back in their earnings");
        }
      } else {
        toast.error(response?.message || "Failed to decline the payout");
        console.error("Failed to decline payout:", response?.message);
      }
    } catch (error) {
      console.error("Error declining payout:", error);
      toast.error("An error occurred while declining the payout");
    } finally {
      setIsDeclining(false);
      setDeclineReason("");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.delete("pwLimit");
    params.delete("pwPage");
    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  }, []);

  const handlePayoutSelection = (uuid: string, event?: React.MouseEvent) => {
    event?.stopPropagation(); // Stop event propagation if event exists
    setSelectedPayoutIds((prev) => {
      if (prev.includes(uuid)) {
        return prev.filter((id) => id !== uuid);
      }
      return [...prev, uuid];
    });
  };

  return (
    <>
      <CardBox>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-nowrap">
            {selectedPayoutIds.length > 0 && (
              <Checkbox
                className="!size-6"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPayoutIds(localPayouts.map((p) => p.uuid));
                  } else {
                    setSelectedPayoutIds([]);
                  }
                }}
                checked={selectedPayoutIds.length === localPayouts.length}
              />
            )}
            <h5 className="text-sm font-semibold text-dark dark:text-white whitespace-nowrap">Payout queue</h5>
          </div>

          <div className="flex items-center gap-4 flex-nowrap">
            {selectedPayoutIds.length > 0 && (
              <Button
                size="sm"
                color="success"
                className="h-8"
                onClick={handleBulkApprovePayouts}
                disabled={isApproving}
              >
                {isApproving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <>Approve and send ({selectedPayoutIds.length})</>
                )}
              </Button>
            )}
            <Link
              href={"/dashboards/wallets"}
              className="text-sm text-gray-500 hover:text-primary underline"
            >
              Go to wallet
            </Link>
          </div>
        </div>

        <div className="mt-3 flex flex-col relative min-h-[200px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-gray-500">Loading payouts...</p>
              </div>
            </div>
          ) : !localPayouts.length ? (
            <p className="text-center text-gray-500 font-semibold text-lg my-20">
              No payouts waiting
            </p>
          ) : (
            localPayouts.map((item) => (
              <div
                key={item.uuid}
                onMouseEnter={() => setIsHovering(item.uuid)}
                onMouseLeave={() => setIsHovering(null)}
                onClick={() => setOpenPayoutDetails(item.uuid)}
                className={`flex cursor-pointer border-b border-ld gap-3 items-center w-full relative transition-all duration-300 !p-2 !py-2
                  ${
                    isHovering === item.uuid || selectedPayoutIds.includes(item.uuid)
                      ? "!pl-10 bg-gray-200 dark:bg-gray-700"
                      : "!pl-2"
                  }`}
              >
                <div
                  className={`absolute left-2 transition-opacity duration-300 ${
                    isHovering === item.uuid || selectedPayoutIds.includes(item.uuid)
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    className="!size-6"
                    checked={selectedPayoutIds.includes(item.uuid)}
                    onChange={() => handlePayoutSelection(item.uuid)}
                  />
                </div>

                <div
                  className={`h-9 w-9 shrink-0 rounded-full overflow-hidden flex justify-center items-center relative bg-lightgray dark:bg-dark`}
                >
                  {item.user.profile_picture && (
                    <Image
                      src={item.user.profile_picture}
                      fill
                      alt="icon"
                      className="object-cover rounded-full"
                    />
                  )}
                </div>
                <div className="flex flex-col min-w-0 shrink">
                  <h5 className="text-sm font-medium truncate">{item.user.name}</h5>
                  <p className="text-xs text-darklink truncate">@{item.user.username}</p>
                  {item.metadata?.auto_payout ? (
                    <p className="text-[11px] text-warning truncate">
                      Automatic payout
                      {item.metadata.auto_payout_review ? ` · ${item.metadata.auto_payout_review}` : ""}
                    </p>
                  ) : (
                    <p className="text-[11px] text-darklink truncate">
                      Requested before automatic payouts
                    </p>
                  )}
                </div>

                <div className="flex gap-2 items-center ml-auto">
                  {/* <div className="font-medium truncate">
                    {item.wallet?.currency?.symbol}
                    {item.amount}
                  </div> */}
                  {!selectedPayoutIds?.length && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpenDecline(true);
                          setSelectedPayout(item);
                        }}
                        color={"red"}
                        className="!size-8 w-fit text-xs"
                      >
                        <LiaTimesSolid size={16} />
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpenApproval(true);
                          setSelectedPayout(item);
                        }}
                        color={"success"}
                        className="!size-8 w-fit text-xs"
                      >
                        <IoMdCheckmark size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-ld mt-6">
          {localPayouts.length > 0 && (
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => handlePageChange(currentLocalPage - 1)}
                  disabled={currentLocalPage === 1 || isLoadingMore}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-x-2">{renderPaginationNumbers()}</div>

                <Button
                  color="gray"
                  size="sm"
                  onClick={() => handlePageChange(currentLocalPage + 1)}
                  disabled={currentLocalPage === totalPages || isLoadingMore}
                >
                  Next
                </Button>
                <select
                  value={sizeForPage}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setIsLoading(true);
                    setSizeForPage(newSize);
                    addParam("pwLimit", e.target.value);
                    setIsInitialized(false);
                  }}
                  className="border w-20 rounded-md bg-gray-100 dark:bg-gray-800"
                >
                  {[10, 15, 20, 25, 50].map((size) => (
                    <option key={size} value={size} className="bg-gray-100 dark:bg-gray-800">
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-center text-gray-500 text-xs">
                Page {currentLocalPage} of {totalPages} ({localPayouts.length} of{" "}
                {totalPayouts} payouts)
              </p>
            </div>
          )}
        </div>
      </CardBox>

      {openPayoutDetails && (
        <PayoutDetailsDialog
          isOpen={openPayoutDetails ? true : false}
          setIsOpen={(isOpen) => setOpenPayoutDetails(isOpen ? openPayoutDetails : null)}
          payout={localPayouts?.find((p) => p.uuid === openPayoutDetails) || null}
          onPayoutAction={(uuid) => {
            setLocalPayouts((prevPayouts) => prevPayouts.filter((payout) => payout.uuid !== uuid));
          }}
        />
      )}

      {isOpenApproval && (
        <PayoutConfirmDialog
          isOpen={isOpenApproval}
          setIsOpen={setIsOpenApproval}
          payout={selectedPayout || null}
          content={
            <>
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-semibold">Approve payout</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Send the payout of{" "}
                  <span className="font-medium">
                    CWR {formatNumber(selectedPayout?.amount || 0)}
                  </span>{" "}
                  to <span className="font-medium">{selectedPayout?.user.name}</span>? It goes out
                  through Flutterwave right away.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setIsOpenApproval(false)}
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
            </>
          }
        />
      )}

      {isOpenDecline && (
        <PayoutConfirmDialog
          isOpen={isOpenDecline}
          setIsOpen={setIsOpenDecline}
          payout={selectedPayout || null}
          content={
            <>
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-semibold">Decline payout</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Decline the payout of{" "}
                  <span className="font-medium">
                    CWR {formatNumber(selectedPayout?.amount || 0)}
                  </span>{" "}
                  for <span className="font-medium">{selectedPayout?.user.name}</span>? The money goes
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

              <div className="flex justify-end ml-auto gap-3">
                <Button
                  onClick={() => {
                    setIsOpenDecline(false);
                    setDeclineReason("");
                  }}
                  color="gray"
                  className="w-fit"
                  disabled={isDeclining || !declineReason.trim()}
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
            </>
          }
        />
      )}
    </>
  );
};

export default PayoutQueue;
