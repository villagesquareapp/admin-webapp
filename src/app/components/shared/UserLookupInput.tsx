"use client";

import { useState } from "react";
import { TextInput } from "flowbite-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/app/components/shared/Button";

// Looks a person up by username, email or id: sets `param` in the URL on
// Enter (not as you type, since each lookup is a query).
const UserLookupInput = ({
  param = "user",
  placeholder = "Username, email or user id",
  label = "Look up",
}: {
  param?: string;
  placeholder?: string;
  label?: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(param) || "");

  const go = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) params.set(param, next.trim());
    else params.delete(param);
    params.set("page", "1");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <form
      className="flex items-center gap-2 min-w-[260px]"
      onSubmit={(e) => {
        e.preventDefault();
        go(value);
      }}
    >
      <TextInput
        className="flex-1"
        icon={() => <Icon icon="solar:user-id-linear" height={16} className="text-darklink" />}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button type="submit" color="primary" className="h-10 whitespace-nowrap">
        {label}
      </Button>
      {searchParams.get(param) && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            go("");
          }}
          className="p-2 rounded-full text-darklink hover:bg-lightgray dark:hover:bg-white/5"
          aria-label="Clear"
        >
          <Icon icon="solar:close-circle-linear" height={18} />
        </button>
      )}
    </form>
  );
};

export default UserLookupInput;
