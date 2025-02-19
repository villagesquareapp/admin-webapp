"use client";

import { Button, Checkbox, Label, Textarea } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { toast } from "sonner";
import { approveWithdrawal, declineWithdrawal, getPendingWithdrawals } from "../api/wallet";
import CardBox from "../components/shared/CardBox";
import useSetSearchParams from "../hooks/useSetSearchParams";
import UserPendingWithdrawalInfo from "./UserPendingWithdrawalInfo";
import WithdrawalDialog from "./WithdrawalDialog";
import { formatNumber } from "@/utils/formatNumber";

const Withdrawals = ({
  selectedWithdrawalID,
  withdrawals,
  totalPages,
  currentPage,
  pageSize,
}: {
  selectedWithdrawalID: string;
  withdrawals: IPendingWithdrawalsResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const { addParam } = useSetSearchParams();
  const [sizeForPage, setSizeForPage] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [localWithdrawals, setLocalWithdrawals] = useState<IPendingWithdrawals[]>([]);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [currentLocalPage, setCurrentLocalPage] = useState(1);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOpenApproval, setIsOpenApproval] = useState(false);
  const [isOpenDecline, setIsOpenDecline] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [selectedPendingWithdrawals, setSelectedPendingWithdrawals] = useState<string[]>([]);
  const [openUserPendingWithdrawalInfo, setOpenUserPendingWithdrawalInfo] = useState<string | null>(null);
  const [isDeclining, setIsDeclining] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<IPendingWithdrawals | null>(
    null
  );
  const [declineReason, setDeclineReason] = useState("");
  const router = useRouter();

  useEffect(() => {
    setSizeForPage(pageSize);
  }, [pageSize]);

  useEffect(() => {
    if (withdrawals?.data && !isInitialized) {
      const newData = withdrawals.data as unknown as IPendingWithdrawals[];
      setLocalWithdrawals(newData);
      setTotalWithdrawals(withdrawals.total || 0);
      setCurrentLocalPage(currentPage);
      setHasReachedEnd(currentPage >= totalPages);
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, [withdrawals, currentPage, totalPages, isInitialized]);

  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentLocalPage) return;

    setIsLoadingMore(true);
    try {
      const newWithdrawals = await getPendingWithdrawals(page, pageSize);
      if (newWithdrawals?.data?.data) {
        const newData = newWithdrawals.data.data as unknown as IPendingWithdrawals[];
        setLocalWithdrawals(newData);
        setTotalWithdrawals(newWithdrawals.data.total || 0);
        setCurrentLocalPage(page);
        setHasReachedEnd(page >= (newWithdrawals.data.last_page || totalPages));
      }
    } catch (error) {
      console.error("Error loading withdrawals:", error);
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

  const handleApproveWithdrawal = async () => {
    if (!selectedWithdrawal?.uuid) return;

    try {
      setIsApproving(true);
      const response = await approveWithdrawal([selectedWithdrawal.uuid]);
      if (response?.status) {
        // Refetch the current page data
        const newWithdrawals = await getPendingWithdrawals(currentLocalPage, pageSize);
        if (newWithdrawals?.data?.data) {
          const newData = newWithdrawals.data.data as unknown as IPendingWithdrawals[];
          setLocalWithdrawals(newData);
          setTotalWithdrawals(newWithdrawals.data.total || 0);
          setHasReachedEnd(currentLocalPage >= (newWithdrawals.data.last_page || totalPages));
        }
        setIsOpenApproval(false);
        toast.success("Withdrawal request approved successfully");
      } else {
        toast.error(response?.message || "Failed to approve withdrawal");
        console.error("Failed to approve withdrawal:", response?.message);
      }
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      toast.error("An error occurred while approving withdrawal");
    } finally {
      setIsApproving(false);
    }
  };

  const handleBulkApproveWithdrawals = async () => {
    if (!selectedPendingWithdrawals.length) return;

    try {
      setIsApproving(true);
      const response = await approveWithdrawal(selectedPendingWithdrawals);
      if (response?.status) {
        // Refetch the current page data
        const newWithdrawals = await getPendingWithdrawals(currentLocalPage, pageSize);
        if (newWithdrawals?.data?.data) {
          const newData = newWithdrawals.data.data as unknown as IPendingWithdrawals[];
          setLocalWithdrawals(newData);
          setTotalWithdrawals(newWithdrawals.data.total || 0);
          setHasReachedEnd(currentLocalPage >= (newWithdrawals.data.last_page || totalPages));
        }
        setSelectedPendingWithdrawals([]);
        toast.success("Withdrawal requests approved successfully");
      } else {
        toast.error(response?.message || "Failed to approve withdrawals");
        console.error("Failed to approve withdrawals:", response?.message);
      }
    } catch (error) {
      console.error("Error approving withdrawals:", error);
      toast.error("An error occurred while approving withdrawals");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeclineWithdrawal = async () => {
    if (!selectedWithdrawal?.uuid || !declineReason.trim()) return;

    try {
      setIsDeclining(true);
      const response = await declineWithdrawal([selectedWithdrawal.uuid], declineReason);
      if (response?.status) {
        // Refetch the current page data
        const newWithdrawals = await getPendingWithdrawals(currentLocalPage, pageSize);
        if (newWithdrawals?.data?.data) {
          const newData = newWithdrawals.data.data as unknown as IPendingWithdrawals[];
          setLocalWithdrawals(newData);
          setTotalWithdrawals(newWithdrawals.data.total || 0);
          setHasReachedEnd(currentLocalPage >= (newWithdrawals.data.last_page || totalPages));
        }
        setIsOpenDecline(false);
        toast.success("Withdrawal request declined successfully");
      } else {
        toast.error(response?.message || "Failed to decline withdrawal");
        console.error("Failed to decline withdrawal:", response?.message);
      }
    } catch (error) {
      console.error("Error declining withdrawal:", error);
      toast.error("An error occurred while declining withdrawal");
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

  const handleWithdrawalSelection = (uuid: string, event?: React.MouseEvent) => {
    event?.stopPropagation(); // Stop event propagation if event exists
    setSelectedPendingWithdrawals(prev => {
      if (prev.includes(uuid)) {
        return prev.filter(id => id !== uuid);
      }
      return [...prev, uuid];
    });
  };

  return (
    <>
      <CardBox>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-nowrap">
            {selectedPendingWithdrawals.length > 0 && (
              <Checkbox
                className="!size-6"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPendingWithdrawals(localWithdrawals.map(w => w.uuid));
                  } else {
                    setSelectedPendingWithdrawals([]);
                  }
                }}
                checked={selectedPendingWithdrawals.length === localWithdrawals.length}
              />
            )}
            <h5 className="card-title whitespace-nowrap">Pending Withdrawals</h5>
          </div>

          <div className="flex items-center gap-4 flex-nowrap">
            {selectedPendingWithdrawals.length > 0 && (
              <Button
                size="sm"
                color="success"
                className="h-8"
                onClick={handleBulkApproveWithdrawals}
                disabled={isApproving}
              >
                {isApproving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Approving...</span>
                  </div>
                ) : (
                  <>Approve ({selectedPendingWithdrawals.length})</>
                )}
              </Button>
            )}
            <Link href={'/dashboards/wallets'} className="text-sm text-gray-500 hover:text-primary underline">Go to wallet</Link>
          </div>
        </div>

        <div className="mt-5 flex flex-col relative min-h-[200px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-gray-500">Loading withdrawals...</p>
              </div>
            </div>
          ) : !localWithdrawals.length ? (
            <p className="text-center text-gray-500 font-semibold text-lg my-20">
              No Pending Withdrawals!
            </p>
          ) : (
            localWithdrawals.map((item) => (
              <div
                key={item.uuid}
                onMouseEnter={() => setIsHovering(item.uuid)}
                onMouseLeave={() => setIsHovering(null)}
                onClick={() => setOpenUserPendingWithdrawalInfo(item.uuid)}
                className={`flex cursor-pointer border-b border-gray-300 dark:border-gray-600 gap-3 items-center w-full relative transition-all duration-300 !p-2 !py-3 
                  ${(isHovering === item.uuid || selectedPendingWithdrawals.includes(item.uuid)) ? '!pl-10 bg-gray-200 dark:bg-gray-700' : '!pl-2'}`}
              >
                <div
                  className={`absolute left-2 transition-opacity duration-300 ${isHovering === item.uuid || selectedPendingWithdrawals.includes(item.uuid) ? 'opacity-100' : 'opacity-0'
                    }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    className="!size-6"
                    checked={selectedPendingWithdrawals.includes(item.uuid)}
                    onChange={() => handleWithdrawalSelection(item.uuid)}
                  />
                </div>

                <div
                  className={`h-10 w-10 shrink-0 rounded-full flex justify-center items-center relative`}
                >
                  {item.user.profile_picture && (
                    <Image
                      src={item.user.profile_picture}
                      fill
                      alt="icon"
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-shrink">

                  <h5 className="text-base truncate">{item.user.name}</h5>
                  <p className="text-sm text-gray-500 truncate">@{item.user.username}</p>
                </div>

                <div className="flex gap-2 items-center ml-auto">
                  <div className="font-medium truncate">
                    {item.wallet?.currency?.symbol}
                    {item.amount}
                  </div>
                  {
                    !selectedPendingWithdrawals?.length &&
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpenDecline(true);
                          setSelectedWithdrawal(item);
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
                          setSelectedWithdrawal(item);
                        }}
                        color={"success"}
                        className="!size-8 w-fit text-xs"
                      >
                        <IoMdCheckmark size={16} />
                      </Button>
                    </div>
                  }
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-ld mt-6">
          {localWithdrawals.length > 0 && (
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

                <div className="flex items-center gap-x-2">
                  {renderPaginationNumbers()}
                </div>

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
                  {[10, 15, 20, 25].map((size) => (
                    <option key={size} value={size} className="bg-gray-100 dark:bg-gray-800">
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-center text-gray-500 text-xs">
                Page {currentLocalPage} of {totalPages} ({localWithdrawals.length} of {totalWithdrawals} withdrawals)
              </p>
            </div>
          )}
        </div>


      </CardBox >

      {openUserPendingWithdrawalInfo && (
        <UserPendingWithdrawalInfo
          isOpen={openUserPendingWithdrawalInfo ? true : false}
          setIsOpen={(isOpen) => setOpenUserPendingWithdrawalInfo(isOpen ? openUserPendingWithdrawalInfo : null)}
          withdrawal={localWithdrawals?.find(w => w.uuid === openUserPendingWithdrawalInfo) || null}
          onWithdrawalAction={(uuid) => {
            setLocalWithdrawals((prevWithdrawals) =>
              prevWithdrawals.filter((withdrawal) => withdrawal.uuid !== uuid)
            );
          }}
        />
      )}

      {
        isOpenApproval && (
          <WithdrawalDialog
            isOpen={isOpenApproval}
            setIsOpen={setIsOpenApproval}
            selectedWithdrawal={selectedWithdrawal || null}
            content={
              <>
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-semibold">Approve Withdrawal</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Are you sure you want to approve withdrawal request of{" "}
                    <span className="font-medium">
                      {selectedWithdrawal?.wallet?.currency?.symbol}
                      {formatNumber(selectedWithdrawal?.amount || 0)}
                    </span>{" "}
                    for <span className="font-medium">{selectedWithdrawal?.user.name}</span>?
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
              </>
            }
          />
        )
      }

      {
        isOpenDecline && (
          <WithdrawalDialog
            isOpen={isOpenDecline}
            setIsOpen={setIsOpenDecline}
            selectedWithdrawal={selectedWithdrawal || null}
            content={
              <>
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-semibold">Decline Withdrawal</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Are you sure you want to decline withdrawal request of{" "}
                    <span className="font-medium">{selectedWithdrawal?.wallet?.currency?.symbol}
                      {selectedWithdrawal?.amount}</span> for{" "}
                    <span className="font-medium">{selectedWithdrawal?.user.name}</span>?
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
              </>
            }
          />
        )
      }
    </>
  );
};

export default Withdrawals;
