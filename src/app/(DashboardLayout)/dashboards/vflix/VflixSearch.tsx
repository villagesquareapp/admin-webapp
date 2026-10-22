"use client";

import { TextInput } from "flowbite-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { HiOutlineSearch } from "react-icons/hi";

const VflixSearch = ({ placeholder = "Search caption..." }: { placeholder?: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");

  const update = useDebouncedCallback((search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, 400);

  return (
    <div className="min-w-[220px]">
      <TextInput
        icon={HiOutlineSearch}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          update(e.target.value);
        }}
      />
    </div>
  );
};

export default VflixSearch;
