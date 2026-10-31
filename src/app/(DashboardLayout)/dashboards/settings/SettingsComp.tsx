"use client";

import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import SettingsTable, { NewSetting, SettingRow } from "./SettingsTable";
import ReviewTestPurchasesCard from "./ReviewTestPurchasesCard";
import SuiteHeader from "../business-suite/SuiteHeader";
import { addNewSettings, updateSettings, deleteSettings } from "@/app/api/setting";
import { toast } from "sonner";

type ISettings = SettingRow;

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

  // Each handler says whether it worked, so a dialog only closes on success.
  const handleSaveNew = async (newSetting: NewSetting) => {
    try {
      setIsAddingNew(true);
      const response = await addNewSettings(newSetting);
      if (response?.status) {
        const now = new Date().toISOString();
        const saved = response.data as Partial<ISettings> | undefined;
        setSettings((prev) => [
          ...prev,
          { ...newSetting, created_at: now, updated_at: now, ...saved, uuid: saved?.uuid ?? `temp-${Date.now()}` },
        ]);
        setShowAddForm(false);
        toast.success("Setting added");
        return true;
      }
      toast.error(response?.message || "Failed to save setting");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error adding settings:", message);
      toast.error(message);
    } finally {
      setIsAddingNew(false);
    }
    return false;
  };

  const handleUpdateSetting = async (uuid: string, value: ISettings["value"]) => {
    setLoadingStates((prev) => ({
      ...prev,
      [uuid]: { ...prev[uuid], isUpdating: true },
    }));

    try {
      const response = await updateSettings(uuid, { value });

      if (response?.status) {
        setSettings((prev) =>
          prev.map((setting) =>
            setting.uuid === uuid ? { ...setting, value, updated_at: new Date().toISOString() } : setting
          )
        );
        toast.success("Setting updated");
        return true;
      }
      toast.error(response?.message || "Failed to update setting");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error updating setting:", message);
      toast.error(message);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [uuid]: { ...prev[uuid], isUpdating: false },
      }));
    }
    return false;
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
        toast.success("Setting deleted");
        return true;
      }
      toast.error(response?.message || "Failed to delete setting");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error deleting setting:", message);
      toast.error(message);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [uuid]: { ...prev[uuid], isDeleting: false },
      }));
    }
    return false;
  };

  const handleCardSaved = (saved: Pick<ISettings, "uuid" | "name" | "value_type" | "value">) => {
    const now = new Date().toISOString();
    setSettings((prev) =>
      prev.some((s) => s.name === saved.name)
        ? prev.map((s) => (s.name === saved.name ? { ...s, ...saved, updated_at: now } : s))
        : [...prev, { ...saved, created_at: now, updated_at: now }]
    );
  };

  const reviewCard = <ReviewTestPurchasesCard settings={settings} onSaved={handleCardSaved} />;

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

  return (
    <div className="flex flex-col gap-5">
      {header}
      {reviewCard}
      <CardBox>
        <SettingsTable
          settings={settings}
          showAddForm={showAddForm}
          onAdd={handleAddNew}
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
