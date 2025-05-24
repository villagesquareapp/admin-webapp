"use client";

import CardBox from "@/app/components/shared/CardBox";
import { Button } from "flowbite-react";
import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { PiEmpty } from "react-icons/pi";
import SettingsCardList from "./SettingsCardList";
import { addNewSettings } from "@/app/api/setting";
import { toast } from "sonner";

interface IJsonSettingsValue {
  [key: string]: any;
}

interface ISettings {
  uuid?: string;
  name: string;
  value_type: "boolean" | "string" | "json";
  value: boolean | string | IJsonSettingsValue;
  created_at: string;
  updated_at: string;
}

const SettingsComp = ({ settings: initialSettings }: { settings: ISettings[] | null }) => {
  const [settings, setSettings] = useState<ISettings[]>(initialSettings || []);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState<
    Record<string, { isUpdating?: boolean; isDeleting?: boolean }>
  >({});

  const handleAddNew = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleSaveNew = async (
    newSetting: Omit<ISettings, "uuid" | "created_at" | "updated_at">
  ) => {
    try {
      setIsAddingNew(true);
      // Make an API call to save the new setting
      const response = await addNewSettings(newSetting);
      if (response?.status) {
        const now = new Date().toISOString();
        const settingWithMeta: ISettings = {
          ...newSetting,
          uuid: `temp-${Date.now()}`, // This would come from the server
          created_at: now,
          updated_at: now,
        };

        setSettings((prev) => [...prev, settingWithMeta]);
        setShowAddForm(false);
        toast.success("Settings added successfully!");
      } else {
        toast.error(response?.message || "Failed to save settings");
        throw new Error(response?.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error adding settings:", message);
      toast.error(`${message}`);
    } finally {
      setIsAddingNew(false);
    }
  };

  const handleUpdateSetting = (uuid: string, updatedSetting: Partial<ISettings>) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.uuid === uuid
          ? {
              ...setting,
              ...updatedSetting,
              updated_at: new Date().toISOString(),
            }
          : setting
      )
    );

    // Make an API call to update the setting
    console.log("Updating setting:", uuid, updatedSetting);
  };

  const handleDeleteSetting = (uuid: string) => {
    setSettings((prev) => prev.filter((setting) => setting.uuid !== uuid));

    // Make an API call to delete the setting
    console.log("Deleting setting:", uuid);
  };

  if (!initialSettings?.length && !showAddForm && settings.length === 0) {
    return (
      <div className="bg-lightgray dark:bg-gray-800/70 p-6 my-6 rounded-md">
        <div className="p-20 gap-2 items-center flex flex-col text-center">
          <PiEmpty className="size-20" />
          <p className="text-base font-semibold">No key settings available!</p>
          <Button
            color={"primary"}
            onClick={handleAddNew}
            className="mt-4 hover:bg-lightprimary hover:text-primary"
          >
            {isAddingNew ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <FaPlus /> Add New
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CardBox>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold mb-4">Settings Key</h2>

        {!showAddForm && (
          <Button
            color={"primary"}
            onClick={handleAddNew}
            className="hover:bg-lightprimary hover:text-primary"
          >
            <FaPlus /> Add New
          </Button>
        )}
      </div>
      <hr className="dark:border-white/20" />

      <SettingsCardList
        settings={settings}
        showAddForm={showAddForm}
        onCancelAdd={handleCancelAdd}
        onSaveNew={handleSaveNew}
        onUpdateSetting={handleUpdateSetting}
        onDeleteSetting={handleDeleteSetting}
        isAddingNew={isAddingNew}
        loadingStates={loadingStates}
      />
    </CardBox>
  );
};

export default SettingsComp;
