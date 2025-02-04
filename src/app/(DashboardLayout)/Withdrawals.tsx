"use client";

import { Button, Dropdown } from "flowbite-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoMdCheckmark } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import CardBox from "../components/shared/CardBox";
import WithdrawalDialog from "./WithdrawalDialog";
import { approveWithdrawal, declineWithdrawal, getPendingWithdrawals } from "../api/wallet";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(false);
  const [localWithdrawals, setLocalWithdrawals] = useState<IPendingWithdrawals[]>([]);
  const [currentLocalPage, setCurrentLocalPage] = useState(1);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOpenApproval, setIsOpenApproval] = useState(false);
  const [isOpenDecline, setIsOpenDecline] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<IPendingWithdrawals | null>(
    null
  );
  const dropdownItems = ["Action", "Another action", "Something else"];
  const router = useRouter();

  useEffect(() => {
    if (withdrawals?.data && !isInitialized) {
      const newData = withdrawals.data as unknown as IPendingWithdrawals[];
      setLocalWithdrawals(newData);
      setCurrentLocalPage(currentPage);
      setHasReachedEnd(currentPage >= totalPages);
      setIsInitialized(true);
    }
  }, [withdrawals, currentPage, totalPages, isInitialized]);

  const loadMore = async () => {
    if (isLoading || hasReachedEnd) return;

    setIsLoading(true);
    const nextPage = currentLocalPage + 1;

    try {
      const newWithdrawals = await getPendingWithdrawals(nextPage, pageSize);
      if (newWithdrawals?.data?.data) {
        const newData = newWithdrawals.data.data as unknown as IPendingWithdrawals[];
        if (newData.length === 0) {
          setHasReachedEnd(true);
        } else {
          setLocalWithdrawals((prevData) => [...prevData, ...newData]);
          setCurrentLocalPage(nextPage);
          setHasReachedEnd(nextPage >= (newWithdrawals.data.last_page || totalPages));
        }
      } else {
        setHasReachedEnd(true);
      }
    } catch (error) {
      console.error("Error loading more withdrawals:", error);
      setHasReachedEnd(true);
    } finally {
      setIsLoading(false);
    }

    // Update URL for consistency, but don't rely on it for data fetching
    const params = new URLSearchParams(window.location.search);
    params.set("pwPage", nextPage.toString());
    params.set("pwLimit", pageSize.toString());
    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleApproveWithdrawal = async () => {
    if (!selectedWithdrawal?.transaction_id) return;

    try {
      setIsApproving(true);
      const response = await approveWithdrawal(selectedWithdrawal.transaction_id);
      if (response?.status) {
        // Update the local state to reflect the change
        setLocalWithdrawals((prevWithdrawals) =>
          prevWithdrawals.map((withdrawal) =>
            withdrawal.transaction_id === selectedWithdrawal.transaction_id
              ? { ...withdrawal, transaction_status: "success" }
              : withdrawal
          )
        );
        setIsOpenApproval(false);
        toast.success("Withdrawal request approved successfully");
      } else {
        // Handle error case
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

  const handleDeclineWithdrawal = async () => {
    if (!selectedWithdrawal?.transaction_id) return;

    try {
      setIsDeclining(true);
      const response = await declineWithdrawal(selectedWithdrawal.transaction_id);
      if (response?.status) {
        // Update the local state to reflect the change
        setLocalWithdrawals((prevWithdrawals) =>
          prevWithdrawals.map((withdrawal) =>
            withdrawal.transaction_id === selectedWithdrawal.transaction_id
              ? { ...withdrawal, transaction_status: "declined" }
              : withdrawal
          )
        );
        setIsOpenDecline(false);
        toast.success("Withdrawal request declined successfully");
      } else {
        // Handle error case
        toast.error(response?.message || "Failed to decline withdrawal");
        console.error("Failed to decline withdrawal:", response?.message);
      }
    } catch (error) {
      console.error("Error declining withdrawal:", error);
      toast.error("An error occurred while declining withdrawal");
    } finally {
      setIsDeclining(false);
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

  return (
    <>
      <CardBox>
        <div className="flex items-center justify-between">
          <h5 className="card-title">Withdrawals</h5>
          <div>
            <Dropdown
              label=""
              dismissOnClick={false}
              renderTrigger={() => (
                <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                  <HiOutlineDotsVertical size={22} />
                </span>
              )}
            >
              {dropdownItems.map((items, index) => {
                return <Dropdown.Item key={index}>{items}</Dropdown.Item>;
              })}
            </Dropdown>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {!!localWithdrawals.length &&
            localWithdrawals.map((item) => (
              <div className="flex gap-3 items-center" key={item.uuid}>
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
                <div className="flex flex-col gap-1 max-w-[200px]">
                  <h5 className="text-base truncate">{item.user.name}</h5>
                  <p className="text-sm text-gray-500 truncate">{item.user.username}</p>
                </div>
                <div className={`ms-auto font-medium text-ld`}>${item.amount}</div>
                {item.transaction_status === "success" && (
                  <div className="bg-lightsuccess dark:bg-success rounded-full px-2 py-1 text-xs">
                    <p>Approved</p>
                  </div>
                )}
                {item.transaction_status === "declined" && (
                  <div className="bg-lightwarning dark:bg-warning rounded-full px-2 py-1 text-xs">
                    <p>Declined</p>
                  </div>
                )}

                {item.transaction_status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        setIsOpenDecline(true);
                        setSelectedWithdrawal(item);
                      }}
                      color={"red"}
                      className="!size-8 w-fit text-xs"
                    >
                      <LiaTimesSolid size={16} />
                    </Button>

                    <Button
                      onClick={() => {
                        setIsOpenApproval(true);
                        setSelectedWithdrawal(item);
                      }}
                      color={"success"}
                      className=" !size-8 w-fit text-xs"
                    >
                      <IoMdCheckmark size={16} />
                    </Button>
                  </>
                )}
                <hr />
              </div>
            ))}
        </div>
        {!localWithdrawals.length && (
          <p className="text-center text-gray-500 font-semibold text-lg my-20">
            No Pending Withdrawals!
          </p>
        )}
        <div className="border-t border-ld mt-6">
          {hasReachedEnd ? (
            <div className="text-center mt-4">
              {localWithdrawals.length > 0 ? (
                <p className="text-gray-500 text-sm">No more withdrawals to display</p>
              ) : (
                <p className="text-gray-500 text-sm">No withdrawals found</p>
              )}
            </div>
          ) : (
            <>
              <Button
                color="primary"
                className="w-full mt-7"
                onClick={loadMore}
                disabled={isLoading || hasReachedEnd || !localWithdrawals.length}
              >
                {isLoading ? "Loading..." : "View More"}
              </Button>
              <p className="text-center text-gray-500 text-xs mt-2">
                Showing {localWithdrawals.length} withdrawals
              </p>
            </>
          )}
        </div>
      </CardBox>

      {isOpenApproval && (
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
                  <span className="font-medium">${selectedWithdrawal?.amount}</span> for{" "}
                  <span className="font-medium">{selectedWithdrawal?.user.name}</span>?
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
      )}

      {isOpenDecline && (
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
                  <span className="font-medium">${selectedWithdrawal?.amount}</span> for{" "}
                  <span className="font-medium">{selectedWithdrawal?.user.name}</span>?
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setIsOpenDecline(false)}
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
                  disabled={isDeclining}
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
      )}
    </>
  );
};

export default Withdrawals;
