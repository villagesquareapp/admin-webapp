"use client";

import { useState } from "react";
import {
  IconDotsVertical,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Dropdown } from "flowbite-react";
import { motion } from "framer-motion";
import { formatDate } from "@/utils/dateUtils";

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

interface JsonKeyValue {
  key: string;
  value: string;
}

export default function SettingsCardList({
  settings,
  showAddForm,
  onCancelAdd,
  onSaveNew,
  onUpdateSetting,
  onDeleteSetting,
  isAddingNew = false,
  loadingStates = {},
}: {
  settings?: ISettings[];
  showAddForm: boolean;
  onCancelAdd: () => void;
  onSaveNew: (newSetting: Omit<ISettings, "uuid" | "created_at" | "updated_at">) => void;
  onUpdateSetting: (uuid: string, updatedSetting: Partial<ISettings>) => void;
  onDeleteSetting: (uuid: string) => void;
  isAddingNew?: boolean;
  loadingStates?: Record<string, { isUpdating?: boolean; isDeleting?: boolean }>;
}) {
  return (
    <div className="my-6 rounded-md columns-1 md:columns-2 gap-4">
      {/* Add New Form Card */}
      {showAddForm && (
        <AddNewSettingCard onCancel={onCancelAdd} onSave={onSaveNew} isLoading={isAddingNew} />
      )}

      {/* Existing Settings Cards */}
      {settings?.map((eachSettings: ISettings, index: number) => {
        const settingLoadingState = loadingStates[eachSettings.uuid || ""] || {};
        return (
          <SettingsCard
            key={eachSettings.uuid || eachSettings.name}
            settings={eachSettings}
            index={showAddForm ? index + 1 : index}
            onUpdate={onUpdateSetting}
            onDelete={onDeleteSetting}
            isUpdating={settingLoadingState.isUpdating}
            isDeleting={settingLoadingState.isDeleting}
          />
        );
      })}
    </div>
  );
}

function AddNewSettingCard({
  onCancel,
  onSave,
  isLoading = false,
}: {
  onCancel: () => void;
  onSave: (newSetting: Omit<ISettings, "uuid" | "created_at" | "updated_at">) => void;
  isLoading?: boolean;
}) {
  const [name, setName] = useState("");
  const [valueType, setValueType] = useState<"string" | "boolean" | "json">("string");
  const [stringValue, setStringValue] = useState("");
  const [booleanValue, setBooleanValue] = useState(false);
  const [jsonKeyValues, setJsonKeyValues] = useState<JsonKeyValue[]>([{ key: "", value: "" }]);

  const handleAddJsonField = () => {
    setJsonKeyValues([...jsonKeyValues, { key: "", value: "" }]);
  };

  const handleRemoveJsonField = (index: number) => {
    setJsonKeyValues(jsonKeyValues.filter((_, i) => i !== index));
  };

  const handleJsonFieldChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...jsonKeyValues];
    updated[index][field] = value;
    setJsonKeyValues(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    console.log("Saving...");

    let value: any;
    switch (valueType) {
      case "string":
        value = stringValue;
        break;
      case "boolean":
        value = booleanValue;
        break;
      case "json":
        value = jsonKeyValues.reduce((acc, { key, value }) => {
          if (key.trim()) {
            acc[key.trim()] = value;
          }
          return acc;
        }, {} as IJsonSettingsValue);
        break;
    }

    try {
      await onSave({
        name: name.trim(),
        value_type: valueType,
        value,
      });

      // Reset form
      setName("");
      setStringValue("");
      setBooleanValue(false);
      setJsonKeyValues([{ key: "", value: "" }]);
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm border-2 border-blue-200 dark:border-blue-700 overflow-hidden my-4"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-200 dark:border-blue-700">
        <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-200">
          Add New Setting
        </h3>
        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full">
          New
        </span>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Setting Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter setting name"
          />
        </div>

        {/* Value Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Value Type
          </label>
          <select
            value={valueType}
            onChange={(e) => setValueType(e.target.value as "string" | "boolean" | "json")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="string">String</option>
            <option value="boolean">Boolean</option>
            <option value="json">JSON</option>
          </select>
        </div>

        {/* Value Input based on type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Value
          </label>

          {valueType === "string" && (
            <input
              type="text"
              value={stringValue}
              onChange={(e) => setStringValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter string value"
            />
          )}

          {valueType === "boolean" && (
            <select
              value={booleanValue.toString()}
              onChange={(e) => setBooleanValue(e.target.value === "true")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="false">False</option>
              <option value="true">True</option>
            </select>
          )}

          {valueType === "json" && (
            <div className="space-y-2">
              {jsonKeyValues.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.key}
                    onChange={(e) => handleJsonFieldChange(index, "key", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Key"
                  />
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleJsonFieldChange(index, "value", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Value"
                  />
                  {jsonKeyValues.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveJsonField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                    >
                      <IconTrash size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddJsonField}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
              >
                <IconPlus size={16} />
                Add Field
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={!name.trim() || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsCard({
  settings,
  index,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: {
  settings: ISettings;
  index: number;
  onUpdate: (uuid: string, updatedSetting: Partial<ISettings>) => void;
  onDelete: (uuid: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}) {
  const { value_type, value } = settings;
  const [isEditing, setIsEditing] = useState(false);

  // For non-JSON values, use a single visibility state
  const [isValueVisible, setIsValueVisible] = useState(false);

  // For JSON values, track visibility for each key separately
  const [visibleJsonKeys, setVisibleJsonKeys] = useState<Record<string, boolean>>({});

  // Edit form state
  const [editName, setEditName] = useState(settings.name);
  const [editStringValue, setEditStringValue] = useState(
    value_type === "string" ? String(value) : ""
  );
  const [editBooleanValue, setEditBooleanValue] = useState(
    value_type === "boolean" ? Boolean(value) : false
  );
  const [editJsonKeyValues, setEditJsonKeyValues] = useState<JsonKeyValue[]>(() => {
    if (value_type === "json" && typeof value === "object" && value !== null) {
      return Object.entries(value).map(([key, val]) => ({ key, value: String(val) }));
    }
    return [{ key: "", value: "" }];
  });

  // Toggle visibility for a specific JSON key
  const toggleJsonKeyVisibility = (key: string) => {
    setVisibleJsonKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Reset edit values
    setEditName(settings.name);
    if (value_type === "string") {
      setEditStringValue(String(value));
    } else if (value_type === "boolean") {
      setEditBooleanValue(Boolean(value));
    } else if (value_type === "json" && typeof value === "object" && value !== null) {
      setEditJsonKeyValues(
        Object.entries(value).map(([key, val]) => ({ key, value: String(val) }))
      );
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !settings.uuid) return;

    let updatedValue: any;
    switch (value_type) {
      case "string":
        updatedValue = editStringValue;
        break;
      case "boolean":
        updatedValue = editBooleanValue;
        break;
      case "json":
        updatedValue = editJsonKeyValues.reduce((acc, { key, value }) => {
          if (key.trim()) {
            acc[key.trim()] = value;
          }
          return acc;
        }, {} as IJsonSettingsValue);
        break;
    }

    onUpdate(settings.uuid, {
      name: editName.trim(),
      value: updatedValue,
    });

    setIsEditing(false);
  };

  const handleAddJsonField = () => {
    setEditJsonKeyValues([...editJsonKeyValues, { key: "", value: "" }]);
  };

  const handleRemoveJsonField = (index: number) => {
    setEditJsonKeyValues(editJsonKeyValues.filter((_, i) => i !== index));
  };

  const handleJsonFieldChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...editJsonKeyValues];
    updated[index][field] = value;
    setEditJsonKeyValues(updated);
  };

  const handleDelete = () => {
    if (settings.uuid && confirm("Are you sure you want to delete this setting?")) {
      onDelete(settings.uuid);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border overflow-hidden my-4 w-full grid ${
        isEditing
          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Card Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${
          isEditing
            ? "border-yellow-200 dark:border-yellow-700"
            : "border-gray-100 dark:border-gray-700"
        }`}
      >
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="font-semibold text-lg bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-800 dark:text-white"
          />
        ) : (
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
            {settings?.name}
          </h3>
        )}

        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isEditing
                ? "bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            {isEditing ? "Editing" : settings.value_type}
          </span>

          {!isEditing && (
            <Dropdown
              label=""
              dismissOnClick={true}
              renderTrigger={() => (
                <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <IconDotsVertical size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              )}
            >
              <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>
              <Dropdown.Item onClick={handleDelete}>Delete</Dropdown.Item>
            </Dropdown>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4 w-full grid">
        {/* Values Section */}
        <div className="w-full grid">
          <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
            Values:
          </h4>

          {isEditing ? (
            <div className="space-y-3 grid w-full">
              {/* Edit form based on value type */}
              {value_type === "string" && (
                <input
                  type="text"
                  value={editStringValue}
                  onChange={(e) => setEditStringValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter string value"
                />
              )}

              {value_type === "boolean" && (
                <select
                  value={editBooleanValue.toString()}
                  onChange={(e) => setEditBooleanValue(e.target.value === "true")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="false">False</option>
                  <option value="true">True</option>
                </select>
              )}

              {value_type === "json" && (
                <div className="space-y-2 w-full grid">
                  {editJsonKeyValues.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center p-0 w-full">
                      <input
                        type="text"
                        value={item.key}
                        onChange={(e) => handleJsonFieldChange(index, "key", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Key"
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => handleJsonFieldChange(index, "value", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Value"
                      />
                      {editJsonKeyValues.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveJsonField(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        >
                          <IconTrash size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddJsonField}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                  >
                    <IconPlus size={16} />
                    Add Field
                  </button>
                </div>
              )}

              {/* Edit Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3 w-full">
              {value_type === "json" && typeof value === "object" && value !== null && (
                <div className="space-y-2 w-full">
                  {Object.entries(value).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-600 dark:text-gray-300 min-w-[100px]">
                        {key.split("_").join(" ")}:
                      </span>
                      <div className="flex-1 flex items-center gap-2 w-full">
                        <span className="font-mono w-[20px] overflow-x-auto whitespace-nowrap text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 flex-1">
                          {visibleJsonKeys[key] ? String(val) : "•••••••••••"}
                        </span>
                        <button
                          onClick={() => toggleJsonKeyVisibility(key)}
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {visibleJsonKeys[key] ? (
                            <IconEyeOff
                              size={16}
                              className="text-gray-500 dark:text-gray-400"
                            />
                          ) : (
                            <IconEye size={16} className="text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(value_type === "string" || (value_type === "boolean" && value !== null)) && (
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm text-gray-700 dark:text-gray-300 flex-1 bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                    {isValueVisible ? String(value) || "N/A" : "•••••••••••"}
                  </div>
                  <button
                    onClick={() => setIsValueVisible(!isValueVisible)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {isValueVisible ? (
                      <IconEyeOff size={16} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <IconEye size={16} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <>
            {/* Divider */}
            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Metadata Section */}
            <div className="flex item-center justify-between gap-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Date created</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {formatDate(settings.created_at)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Last updated</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {formatDate(settings.updated_at)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
