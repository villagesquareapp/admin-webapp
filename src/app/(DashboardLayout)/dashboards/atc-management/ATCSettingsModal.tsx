"use client";

import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button, Label, Select, Spinner } from "flowbite-react";
import {
  getATCStats,
  getATCSuggestions,
  approveATCSuggestion,
  getATCChallengeInfo,
} from "@/app/api/atc";
import CardBox from "@/app/components/shared/CardBox";

interface ATCSettingsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  period: string;
}

const ATCSettingsModal: React.FC<ATCSettingsModalProps> = ({
  isOpen,
  setIsOpen,
  period,
}) => {
  const [stats, setStats] = useState<IAtcStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState<ISuggestion | null>(null);
  const [challengeInfo, setChallengeInfo] = useState<IATCChallengeInfo | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [approving, setApproving] = useState(false);
  const [currentMonthLabel, setCurrentMonthLabel] = useState("");
  const [settings, setSettings] = useState({
    status: "",
    phase: "audition",
  });

  // Helper to format "jan-2026" to "Jan 2026"
  const formatPeriod = (val: string) => {
    if (!val) return "";
    const parts = val.split("-");
    if (parts.length === 2) {
      const month =
        parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
      return `${month} ${parts[1]}`;
    }
    return val;
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      fetchSuggestion();
      fetchChallengeInfo();
    }
  }, [isOpen, period]);

  const fetchChallengeInfo = async () => {
    try {
      const response = await getATCChallengeInfo();
      console.log("ATC Challenge Info Response:", response);
      const data = response?.data;
      if (data) {
        setChallengeInfo(data);
      } else {
        console.warn("ATC Challenge Info: No data found in response");
      }
    } catch (error) {
      console.error("Failed to fetch challenge info", error);
    }
  };

  const fetchSuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const response = await getATCSuggestions();
      const data = response?.data;
      if (data) {
        setSuggestion(data.suggestion);
        if (data.current_month?.label) {
          setCurrentMonthLabel(data.current_month.label);
        }
        if (data.approved) {
          setIsLocked(true);
          setSettings((prev) => ({
            ...prev,
            status: data.suggestion.name,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch suggestion", error);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getATCStats(period);
      const data = response?.data;
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!suggestion) return;
    setApproving(true);
    try {
      const response = await approveATCSuggestion(suggestion.uuid);
      if (response && response.status) {
        setIsLocked(true);
        console.log("Suggestion approved:", response);
      }
    } catch (error) {
      console.error("Failed to approve suggestion", error);
    } finally {
      setApproving(false);
    }
  };

  const getIcon = (iconName: string) => {
    const mapping: { [key: string]: string } = {
      document: "solar:notes-bold-duotone",
      video: "solar:videocamera-record-bold-duotone",
      bell: "solar:bell-bing-bold-duotone",
      play: "solar:videocamera-bold-duotone",
      calendar: "solar:calendar-bold-duotone",
      check: "solar:check-circle-bold",
    };
    return mapping[iconName] || "solar:info-circle-bold-duotone";
  };

  const getTimelineColor = (index: number) => {
    const colors = ["primary", "secondary", "success", "warning"];
    return colors[index % colors.length];
  };

  const getTimelineIcon = (index: number) => {
    const icons = [
      "solar:calendar-date-bold-duotone",
      "solar:checklist-minimalistic-bold-duotone",
      "solar:ranking-bold-duotone",
      "solar:flag-bold-duotone"
    ];
    return icons[index % icons.length];
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white dark:bg-darkgray p-8 text-left align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-[20px] font-bold text-gray-900 dark:text-white"
                    >
                      ATC Episode Settings
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Icon
                      icon="mdi:close"
                      width={24}
                      className="text-gray-500"
                    />
                  </button>
                </div>

                {!isLocked && (
                  <span className="text-yellow-500 text-xs italic">
                    You are yet to select an option for this month episode
                  </span>
                )}
                <div className="flex flex-col gap-8">
                  {/* Top Section: Options/Settings */}
                  <div className="flex flex-col bg-gray-50 dark:bg-gray-800/30 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-wrap items-end justify-between gap-6">
                      <div className="flex-1 min-w-[150px]">
                        <Label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1 block">
                          Current Month
                        </Label>
                        {loadingSuggestion ? (
                          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded md:mt-1"></div>
                        ) : (
                          <h4 className="text-xl font-bold text-primary">
                            {currentMonthLabel ||
                              formatPeriod(period) ||
                              "Select Episode"}
                          </h4>
                        )}
                      </div>

                      <div className="flex-[4] min-w-[400px]">
                        <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                          {isLocked
                            ? "Selected ATC Episode"
                            : "Suggested ATC Episode"}
                        </h5>
                        {loadingSuggestion ? (
                          <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                        ) : (
                          <div className="flex items-center gap-4">
                            {isLocked ? (
                              <div className="px-4 py-2.5 bg-white dark:bg-darkgray border border-gray-200 dark:border-gray-700 rounded-lg w-full">
                                <span className="text-gray-900 dark:text-white font-semibold">
                                  {settings.status}
                                </span>
                              </div>
                            ) : suggestion ? (
                              <div className="w-full p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                <h4 className="font-bold text-primary text-lg">
                                  {suggestion.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {suggestion.description}
                                </p>
                              </div>
                            ) : (
                              <div className="w-full py-2 text-gray-500 italic text-sm">
                                No suggestion available for this month.
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {!isLocked && (
                        <div className="flex-1 min-w-[150px]">
                          <Button
                            color="primary"
                            size="md"
                            disabled={!settings.status}
                            className="w-full rounded-xl shadow-lg shadow-primary/30"
                            onClick={handleSave}
                          >
                            {approving ? "Accepting..." : "Accept"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Key Informations */}
                    <div>
                      <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                        Key Informations
                      </h5>
                      <ul className="space-y-4">
                        {challengeInfo?.key_information.map((info, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Icon
                              icon={getIcon(info.icon)}
                              className="text-gray-400 mt-1"
                              width={20}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {info.text}
                            </span>
                          </li>
                        ))}
                        {!challengeInfo && (
                          <div className="flex flex-col gap-2 animate-pulse">
                            {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>)}
                          </div>
                        )}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                        Requirements
                      </h5>
                      <ul className="space-y-4">
                        {challengeInfo?.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Icon
                              icon={getIcon(req.icon)}
                              className="text-primary mt-1"
                              width={18}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {req.text}
                            </span>
                          </li>
                        ))}
                        {!challengeInfo && (
                          <div className="flex flex-col gap-2 animate-pulse">
                            {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>)}
                          </div>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Section: Stats Grid */}
                  <div>
                    <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                      Timeline and Key Dates
                    </h5>
                    {loading || !challengeInfo ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl"
                          ></div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {challengeInfo?.timelines.map((card, index) => {
                          const bgcolor = getTimelineColor(index);
                          const icon = getTimelineIcon(index);
                          return (
                            <CardBox
                              key={index}
                              className={`p-5 border-none rounded-2xl bg-light${bgcolor} dark:bg-dark${bgcolor}/10 transition-transform hover:scale-105`}
                            >
                              <div className="flex flex-col gap-3">
                                <span
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-${bgcolor}`}
                                >
                                  <Icon icon={icon} width={20} />
                                </span>
                                <div>
                                  <h4 className="text-darklink dark:text-bodytext text-[12px] uppercase tracking-wider font-bold opacity-60">
                                    {card.title}
                                  </h4>
                                  <p className="text-sm font-extrabold mt-1 text-gray-900 dark:text-white">
                                    {card.date}
                                  </p>
                                </div>
                              </div>
                            </CardBox>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ATCSettingsModal;
