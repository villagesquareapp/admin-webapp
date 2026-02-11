"use client";

import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button, Label, Select } from "flowbite-react";
import { getATCStats } from "@/app/api/atc";
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
  const [isLocked, setIsLocked] = useState(false);
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
      // Reset isLocked when modal opens if needed, or keep it persistent for the session.
      // Usually, it's safer to keep it false until "Accept" is clicked in the session.
      // setIsLocked(false);
    }
  }, [isOpen, period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getATCStats(period);
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Stub for saving settings
    console.log("Saving settings:", { period, settings });
    setIsLocked(true);
    // Optionally close modal after some delay or keep it open to show the "locked" state
  };

  const timelineCards = [
    {
      label: "Application Timeline",
      value: "Feb 7 - Feb 14 (11:59 PM)",
      icon: "solar:calendar-date-bold-duotone",
      bgcolor: "primary",
    },
    {
      label: "Selection Timeline",
      value: "Feb 14 - Feb 18",
      icon: "solar:checklist-minimalistic-bold-duotone",
      bgcolor: "secondary",
    },
    {
      label: "Voting Timeline",
      value: "Feb 19 - Feb 27 (11:59 PM)",
      icon: "solar:ranking-bold-duotone",
      bgcolor: "success",
    },
    {
      label: "Challenge Ends",
      value: "Feb 28 (8:00 PM)",
      icon: "solar:flag-bold-duotone",
      bgcolor: "warning",
    },
  ];

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
                    <div className="flex flex-wrap items-center justify-between gap-6">
                      <div className="flex-1 min-w-[150px]">
                        <Label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1 block">
                          Current Month
                        </Label>
                        <h4 className="text-xl font-bold text-primary">
                          {formatPeriod(period) || "Select Episode"}
                        </h4>
                      </div>

                      <div className="flex-[4] min-w-[400px]">
                        <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                          {isLocked
                            ? "Selected ATC Episode"
                            : "Select your preferred ATC Episode"}
                        </h5>
                        <div className="flex items-center gap-4">
                          {isLocked ? (
                            <div className="px-4 py-2.5 bg-white dark:bg-darkgray border border-gray-200 dark:border-gray-700 rounded-lg w-full">
                              <span className="text-gray-900 dark:text-white font-semibold">
                                {settings.status.charAt(0).toUpperCase() +
                                  settings.status.slice(1)}
                              </span>
                            </div>
                          ) : (
                            <div className="w-full">
                              <Select
                                id="status"
                                value={settings.status}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    setSettings({ ...settings, status: val });
                                    console.log("Saving settings:", {
                                      period,
                                      status: val,
                                    });
                                  }
                                }}
                                className="bg-white dark:bg-darkgray"
                              >
                                <option value="">Select Option</option>
                                <option value="elixir">The Elixir</option>
                                <option value="breakthrough">
                                  The Breakthrough
                                </option>
                                <option value="showdown">The Showdown</option>
                                <option value="spotlight">
                                  Spotlight Africa
                                </option>
                              </Select>
                            </div>
                          )}
                        </div>
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
                            Accept
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
                        <li className="flex items-start gap-3">
                          <Icon
                            icon="solar:notes-bold-duotone"
                            className="text-gray-400 mt-1"
                            width={20}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Application is Free.
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Icon
                            icon="solar:videocamera-record-bold-duotone"
                            className="text-gray-400 mt-1"
                            width={20}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Uploading a 15-60 seconds video showcasing your
                            talent will be required of you, as part of your
                            application process.
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Icon
                            icon="solar:bell-bing-bold-duotone"
                            className="text-gray-400 mt-1"
                            width={20}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            If selected, you'll be notified by email or in-app
                            notification.
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Icon
                            icon="solar:videocamera-bold-duotone"
                            className="text-gray-400 mt-1"
                            width={20}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            The winner will be announced on VillageSquare Live
                            (Every 28 of each month by 8:00 PM)
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Icon
                            icon="solar:calendar-bold-duotone"
                            className="text-gray-400 mt-1"
                            width={20}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Candidates can only apply once in 6 months.
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                        Requirements
                      </h5>
                      <ul className="space-y-4">
                        {[
                          "Full name, what you do, and for how long",
                          "Current address",
                          "Solo or group application",
                          "Proof of ID (Driver's License or Passport)",
                          "Talent video upload",
                        ].map((requirement, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Icon
                              icon="solar:check-circle-bold"
                              className="text-primary mt-1"
                              width={18}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {requirement}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Section: Stats Grid */}
                  <div>
                    <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                      Timeline and Key Dates
                    </h5>
                    {loading ? (
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
                        {timelineCards.map((card, index) => (
                          <CardBox
                            key={index}
                            className={`p-5 border-none rounded-2xl bg-light${card.bgcolor} dark:bg-dark${card.bgcolor}/10 transition-transform hover:scale-105`}
                          >
                            <div className="flex flex-col gap-3">
                              <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-${card.bgcolor}`}
                              >
                                <Icon icon={card.icon} width={20} />
                              </span>
                              <div>
                                <h4 className="text-darklink dark:text-bodytext text-[12px] uppercase tracking-wider font-bold opacity-60">
                                  {card.label}
                                </h4>
                                <p className="text-sm font-extrabold mt-1 text-gray-900 dark:text-white">
                                  {card.value}
                                </p>
                              </div>
                            </div>
                          </CardBox>
                        ))}
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
