import { Button, Label, Select, TextInput } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FaSearch, FaUser } from "react-icons/fa";
import { getSearchUser } from "@/app/api/user";
import { toast } from "sonner";
import { createSubscription, getBillingPlans } from "@/app/api/billing";

interface AdminAddVerifiedUserProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminAddVerifiedUser = ({
  isOpen,
  onClose,
}: AdminAddVerifiedUserProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<IRandomUsers[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IRandomUsers | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [validityPeriod, setValidityPeriod] = useState("3_months");
  const [showDetailsView, setShowDetailsView] = useState(false);

  const [billingPlans, setBillingPlans] = useState<IBillingPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await getSearchUser(searchQuery);
        setSearchResults(response?.data || []);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await getSearchUser(searchQuery);
      setSearchResults(response?.data || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user: IRandomUsers) => {
    setSelectedUser(user);
    setShowDetailsView(true);
  };

    // Fetch billing plans when modal opens
  useEffect(() => {
    const fetchBillingPlans = async () => {
      if (!isOpen) return;
      
      setIsLoadingPlans(true);
      try {
        const response = await getBillingPlans();
        const plans = response?.data || [];
        setBillingPlans(plans.filter((plan: IBillingPlan) => plan.is_active));
        
        // Set first plan as default if available
        if (plans.length > 0 && plans[0].is_active) {
          setSelectedPlanId(plans[0].uuid);
        }
      } catch (error) {
        console.error('Failed to fetch billing plans:', error);
        toast.error('Failed to load billing plans');
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchBillingPlans();
  }, [isOpen]);

  const handleDone = async () => {
    if (!selectedUser || !selectedPlanId) {
      toast.error('Please select a user and verification plan');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createSubscription(
        selectedPlanId,
        selectedUser.uuid,
        validityPeriod
      );

      if (response?.status) {
        toast.success('User verified successfully!');
        onClose();
        resetModal();
      } else {
        toast.error(response?.message || 'Failed to verify user');
      }
    } catch (error: any) {
      console.error('Failed to create subscription:', error);
      toast.error(error?.message || 'Failed to verify user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

   const resetModal = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedPlanId('');
    setValidityPeriod('3_months');
    setShowDetailsView(false);
    setBillingPlans([]);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/30"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[500px] md:max-w-[600px] lg:max-w-[700px] flex flex-col p-6 lg:p-8 gap-6 lg:gap-8 rounded-lg bg-white dark:bg-darkgray shadow-md overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                Add a Verified User
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body with sliding animation */}
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!showDetailsView ? (
                  <motion.div
                    key="search-view"
                    initial={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full"
                  >
                    {/* Search Input */}
                    {/* <div className="flex gap-2 mb-4">
                      <div className="flex-1">
                        <TextInput
                          type="text"
                          placeholder="Search users by name, username, or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          icon={FaSearch}
                        />
                      </div>
                    </div> */}
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1">
                        <TextInput
                          type="text"
                          placeholder="Search users by name, username, or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSearch();
                            }
                          }}
                          icon={FaSearch}
                        />
                      </div>
                      <Button
                        color="blue"
                        onClick={handleSearch}
                        disabled={isSearching}
                      >
                        {isSearching ? "Searching..." : "Search"}
                      </Button>
                    </div>

                    {/* Search Results */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {isSearching ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((user) => (
                            <div
                              key={user.uuid}
                              onClick={() => handleUserSelect(user)}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            >
                              <div className="relative">
                                {user.profile_picture ? (
                                  <img
                                    src={user.profile_picture}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <FaUser className="text-gray-600 dark:text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : searchQuery.trim() ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No users found
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Start typing to search for users
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="details-view"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full"
                  >
                    {selectedUser && (
                      <div className="space-y-6">
                        {/* Selected User */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="relative">
                            {selectedUser.profile_picture ? (
                              <img
                                src={selectedUser.profile_picture}
                                alt={selectedUser.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <FaUser className="text-gray-600 dark:text-gray-300 text-xl" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">
                              {selectedUser.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              @{selectedUser.username}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {selectedUser.email}
                            </p>
                          </div>
                        </div>

                        {/* Verification Options */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor="verificationType"
                              className="mb-2 block"
                            >
                              Verification Type
                            </Label>
                            <Select
                              id="verificationType"
                              value={selectedPlanId}
                              onChange={(e) =>
                                setSelectedPlanId(e.target.value)
                              }
                            >
                              {isLoadingPlans ? (
                                <option value="">Loading plans...</option>
                              ) : billingPlans.length > 0 ? (
                                billingPlans.map((plan) => (
                                  <option key={plan.uuid} value={plan.uuid}>
                                    {plan.name}
                                  </option>
                                ))
                              ) : (
                                <option value="">No plans available</option>
                              )}
                            </Select>
                          </div>

                          <div>
                            <Label
                              htmlFor="validityPeriod"
                              className="mb-2 block"
                            >
                              Validity Period
                            </Label>
                            <Select
                              id="validityPeriod"
                              value={validityPeriod}
                              onChange={(e) =>
                                setValidityPeriod(e.target.value)
                              }
                            >
                              <option value="3_months">3 Months</option>
                              <option value="6_months">6 Months</option>
                              <option value="9_months">9 Months</option>
                              <option value="12_months">12 Months</option>
                              <option value="auto_renew">Auto Renew</option>
                            </Select>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end pt-4">
                          <Button color="gray" onClick={handleClose}>
                            Cancel
                          </Button>
                          <Button color="success" onClick={handleDone}>
                            {isSubmitting ? "Submitting..." : "Done"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminAddVerifiedUser;
