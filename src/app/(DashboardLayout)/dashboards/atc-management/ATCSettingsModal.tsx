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
    const [settings, setSettings] = useState({
        status: "active",
        phase: "audition",
    });

    useEffect(() => {
        if (isOpen) {
            fetchStats();
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
        setIsOpen(false);
    };

    const statCards = [
        {
            label: "Total Votes",
            value: stats?.engagement?.total_votes || 0,
            icon: "solar:ranking-bold-duotone",
            bgcolor: "primary",
        },
        {
            label: "Total Likes",
            value: stats?.engagement?.total_likes || 0,
            icon: "solar:heart-bold-duotone",
            bgcolor: "secondary",
        },
        {
            label: "Total Comments",
            value: stats?.engagement?.total_comments || 0,
            icon: "solar:chat-round-dots-bold-duotone",
            bgcolor: "success",
        },
        {
            label: "Total Gifts",
            value: stats?.engagement?.total_comments || 0, // Placeholder: using comments as proxy if gifts not in stats
            icon: "solar:gift-bold-duotone",
            bgcolor: "warning",
        },
        {
            label: "Total Applications",
            value: stats?.applications?.period?.total || 0,
            icon: "solar:user-plus-bold-duotone",
            bgcolor: "info",
        },
        {
            label: "Total Approved",
            value: stats?.applications?.period?.approved || 0,
            icon: "solar:check-circle-bold-duotone",
            bgcolor: "success",
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
                                <div className="flex justify-between items-center mb-8">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-2xl font-bold text-gray-900 dark:text-white"
                                    >
                                        ATC Episode Settings
                                    </Dialog.Title>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <Icon icon="mdi:close" width={24} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-8">
                                    {/* Top Section: Options/Settings */}
                                    <div className="flex flex-col bg-gray-50 dark:bg-gray-800/30 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                                        <div className="flex flex-wrap items-end justify-between gap-6">
                                            <div className="flex-1 min-w-[200px]">
                                                <Label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1 block">
                                                    Current Month
                                                </Label>
                                                <h4 className="text-xl font-bold text-primary">
                                                    {period || "Select Episode"}
                                                </h4>
                                            </div>

                                            <div className="flex-[2] min-w-[300px]">
                                                <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                                                    Options of ATC Episode
                                                </h5>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Select
                                                            id="status"
                                                            value={settings.status}
                                                            onChange={(e) => setSettings({ ...settings, status: e.target.value })}
                                                            className="bg-white dark:bg-darkgray"
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="upcoming">Upcoming</option>
                                                            <option value="completed">Completed</option>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Select
                                                            id="phase"
                                                            value={settings.phase}
                                                            onChange={(e) => setSettings({ ...settings, phase: e.target.value })}
                                                        >
                                                            <option value="audition">Audition</option>
                                                            <option value="voting">Voting</option>
                                                            <option value="judging">Judging</option>
                                                            <option value="finals">Finals</option>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-[150px]">
                                                <Button
                                                    color="primary"
                                                    size="md"
                                                    className="w-full rounded-xl shadow-lg shadow-primary/30"
                                                    onClick={handleSave}
                                                >
                                                    Accept
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section: Stats Grid */}
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                                            Episode Statistics
                                        </h5>
                                        {loading ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                                {statCards.map((card, index) => (
                                                    <CardBox
                                                        key={index}
                                                        className={`p-5 border-none rounded-2xl bg-light${card.bgcolor} dark:bg-dark${card.bgcolor}/10 transition-transform hover:scale-105`}
                                                    >
                                                        <div className="flex flex-col gap-3">
                                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-${card.bgcolor}`}>
                                                                <Icon icon={card.icon} width={20} />
                                                            </span>
                                                            <div>
                                                                <h4 className="text-darklink dark:text-bodytext text-[10px] uppercase tracking-wider font-bold opacity-60">
                                                                    {card.label}
                                                                </h4>
                                                                <p className="text-xl font-extrabold mt-1 text-gray-900 dark:text-white">
                                                                    {card.value.toLocaleString()}
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
