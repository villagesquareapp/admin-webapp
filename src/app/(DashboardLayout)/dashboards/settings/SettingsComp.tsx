"use client";
import CardBox from "@/app/components/shared/CardBox";
import { Button, Label, TextInput } from "flowbite-react";
import { PiEmpty } from "react-icons/pi";
import { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";

interface ISettingsKey {
  title: string;
  name: string;
  value: string;
}

const SettingsComp = () => {
  const [settingsData, setSettingsData] = useState<ISettingsKey[]>([]);

  const handleAddNew = () => {
    setSettingsData([...settingsData, { title: "", name: "", value: "" }]);
  };

  const handleInputChange = (index: number, field: keyof ISettingsKey, value: string) => {
    const newData = [...settingsData];
    newData[index] = { ...newData[index], [field]: value };
    setSettingsData(newData);
  };

  const handleDelete = (indexToDelete: number) => {
    setSettingsData(settingsData.filter((_, index) => index !== indexToDelete));
  };

  return (
    <CardBox>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold mb-4">Settings Key</h2>

        <Button
          color={"primary"}
          onClick={handleAddNew}
          className=" hover:bg-lightprimary hover:text-primary  "
        >
          <FaPlus /> Add New
        </Button>
      </div>
      {!settingsData?.length && (
        <div className="bg-lightgray dark:bg-gray-800/70 p-6 my-6 rounded-md">
          <div className="p-20 gap-2 items-center flex flex-col text-center">
            <PiEmpty className="size-20" />
            <p className="text-base font-semibold">No key settings available!</p>
          </div>
        </div>
      )}
      {!!settingsData?.length &&
        settingsData?.map((eachItem: ISettingsKey, index: number) => (
          <div key={index} className="bg-lightgray dark:bg-gray-800/70 p-6 my-2 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="col-span-2">
                <div className="mb-2 justify-between items-center flex">
                  <Label htmlFor={`settingsTitle-${index}`} value="Title" />
                  <Button
                    color="failure"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="!p-1"
                  >
                    <FaTrash className="size-4" />
                  </Button>
                </div>
                <TextInput
                  id={`settingsTitle-${index}`}
                  value={eachItem.title}
                  onChange={(e) => handleInputChange(index, "title", e.target.value)}
                  placeholder="Setting key Title"
                  className="w-full form-control"
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor={`settingsName-${index}`} value="Name" />
                </div>
                <TextInput
                  id={`settingsName-${index}`}
                  value={eachItem.name}
                  onChange={(e) => handleInputChange(index, "name", e.target.value)}
                  placeholder="Setting key Name"
                  className="w-full form-control"
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor={`settingsValue-${index}`} value="Value" />
                </div>
                <TextInput
                  id={`settingsValue-${index}`}
                  value={eachItem.value}
                  onChange={(e) => handleInputChange(index, "value", e.target.value)}
                  placeholder="Setting key Value"
                  className="w-full form-control"
                />
              </div>
            </div>
          </div>
        ))}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex gap-3 ">
          <Button
            color={"error"}
            className=""
            // onClick={() => {
            //   router.push("/apps/settingss");
            // }}
          >
            Cancel
          </Button>
          <Button
            color={"primary"}
            // onClick={handleSubmit}
            className=" hover:bg-lightprimary hover:text-primary  "
          >
            Save
          </Button>
        </div>
      </div>
    </CardBox>
  );
};
export default SettingsComp;
