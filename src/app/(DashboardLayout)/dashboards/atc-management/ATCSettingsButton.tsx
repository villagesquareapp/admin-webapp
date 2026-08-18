"use client";

import { Button } from "flowbite-react";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";

const ATCSettingsModal = dynamic(() => import("./ATCSettingsModal"), {
    loading: () => <div className="sr-only">Loading Modal...</div>,
});

interface ATCSettingsButtonProps {
    activePeriod: string;
}

const ATCSettingsButton: React.FC<ATCSettingsButtonProps> = ({ activePeriod }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <Button
                color="primary"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2"
            >
                <Icon icon="solar:settings-bold" className="mr-2" width={20} />
                ATC Settings
            </Button>

            {activePeriod && isSettingsOpen && (
                <ATCSettingsModal
                    isOpen={isSettingsOpen}
                    setIsOpen={setIsSettingsOpen}
                    period={activePeriod}
                />
            )}
        </>
    );
};

export default ATCSettingsButton;
