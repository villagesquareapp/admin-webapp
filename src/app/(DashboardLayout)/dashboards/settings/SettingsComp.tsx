"use client";

import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { PiEmpty } from "react-icons/pi";
import SettingsCardList from "./SettingsCardList";
import SuiteHeader from "../business-suite/SuiteHeader";
import { addNewSettings, updateSettings, deleteSettings } from "@/app/api/setting";
import { toast } from "sonner";

interface IJsonSettingsValue {
  [key: string]: any;
}

interface ISettings {
  uuid: string;
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

  const handleUpdateSetting = async (uuid: string, updatedSetting: Partial<ISettings>) => {
    setLoadingStates((prev) => ({
      ...prev,
      [uuid]: { ...prev[uuid], isUpdating: true },
    }));

    try {
      const body: { value: any } = { value: updatedSetting.value };

      const response = await updateSettings(uuid, body);

      if (response?.status) {
        setSettings((prev) =>
          prev.map((setting) =>
            setting.uuid === uuid
              ? { ...setting, ...updatedSetting, updated_at: new Date().toISOString() }
              : setting
          )
        );
        toast.success("Setting updated successfully!");
      } else {
        toast.error(response?.message || "Failed to update setting");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error updating setting:", message);
      toast.error(`${message}`);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [uuid]: { ...prev[uuid], isUpdating: false },
      }));
    }
  };

  const handleDeleteSetting = async (uuid: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [uuid]: { ...prev[uuid], isDeleting: true },
    }));

    try {
      const response = await deleteSettings(uuid);

      if (response?.status) {
        setSettings((prev) => prev.filter((setting) => setting.uuid !== uuid));
        toast.success("Setting deleted successfully!");
      } else {
        toast.error(response?.message || "Failed to delete setting");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error deleting setting:", message);
      toast.error(`${message}`);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [uuid]: { ...prev[uuid], isDeleting: false },
      }));
    }
  };

  const header = (
    <SuiteHeader
      title="Settings"
      subtitle={`Platform configuration keys and feature flags${settings.length ? ` · ${settings.length} ${settings.length === 1 ? "key" : "keys"}` : ""}`}
      back="/dashboards/business-suite"
      actions={
        settings.length > 0 && !showAddForm ? (
          <Button color={"primary"} className="h-10" onClick={handleAddNew}>
            <FaPlus /> Add New
          </Button>
        ) : null
      }
    />
  );

  if (!initialSettings?.length && !showAddForm && settings.length === 0) {
    return (
      <div className="flex flex-col gap-5">
      {header}
      <CardBox>
        <div className="py-16 px-6 flex flex-col items-center text-center gap-4">
          <span className="w-16 h-16 rounded-full bg-lightprimary text-primary flex items-center justify-center">
            <PiEmpty className="size-8" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">No settings yet</h3>
            <p className="text-sm text-darklink mt-1 max-w-sm mx-auto">
              Configuration keys and feature flags you add will show up here.
            </p>
          </div>
          <Button
            color={"primary"}
            onClick={handleAddNew}
            className="mt-1"
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
      </CardBox>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
    {header}
    <CardBox>
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
    </div>
  );
};

export default SettingsComp;
