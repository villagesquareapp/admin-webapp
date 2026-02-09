"use client";

import { Button, Card, Table } from "flowbite-react";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import ATCSettingsModal from "./ATCSettingsModal";

interface MatchListProps {
    periods: { value: string; label: string }[];
}

const MatchList: React.FC<MatchListProps> = ({ periods }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleSettingsClick = (periodValue: string) => {
        setSelectedPeriod(periodValue);
        setIsSettingsOpen(true);
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    ATC Episodes
                </h3>
            </div>

            <div className="overflow-x-auto">
                <Table hoverable>
                    <Table.Head>
                        <Table.HeadCell>Episode Name</Table.HeadCell>
                        <Table.HeadCell>Status</Table.HeadCell>
                        <Table.HeadCell>Actions</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {periods.map((period) => (
                            <Table.Row key={period.value} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                    {period.label}
                                </Table.Cell>
                                <Table.Cell>
                                    {/* Placeholder status logic */}
                                    <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                                        Active
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <Button
                                        size="xs"
                                        color="light"
                                        onClick={() => handleSettingsClick(period.value)}
                                        className="flex items-center gap-2"
                                    >
                                        <Icon icon="solar:settings-bold" className="mr-2" />
                                        Settings
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                        {periods.length === 0 && (
                            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <Table.Cell colSpan={3} className="text-center py-4">
                                    No episodes found.
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </div>

            {selectedPeriod && (
                <ATCSettingsModal
                    isOpen={isSettingsOpen}
                    setIsOpen={setIsSettingsOpen}
                    period={selectedPeriod}
                />
            )}
        </div>
    );
};

export default MatchList;
