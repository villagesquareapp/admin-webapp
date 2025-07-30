'use client';

import { Button } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import UserTable from "../users/UserTable";
import { useSearchParams } from "next/navigation";
import AdminUserTable from "./AdminUserTable";
import AdminAddAdminModal from "./AdminAddAdminModal";
import { getRandomUsers, getUsers } from "@/app/api/user";

const AdminUsersComp = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;

  const userId = searchParams.get("userId") || "";

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<IUsersResponse | null>();

  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getUsers(page, limit);
      setUsers(response?.data || undefined);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, [page, limit]);

  return (
    <div>
      {/* Top bar with button aligned to the right */}
      <div className="flex justify-end mb-4">
        <Button
          color="success"
          size="sm"
          className="w-32 lg:w-40 lg:h-10 lg:text-base"
          onClick={() => setIsOpen(true)}
        >
          <FaPlus size={16} className="mr-2" />
          Add Admin
        </Button>
      </div>

      {/* Table section */}
      <div className="col-span-12">
        <AdminUserTable
          users={users?.data || []}
          totalPages={users?.last_page || 1}
          currentPage={page}
          pageSize={limit}
        />
      </div>

      {/* Modal */}
      {isOpen && <AdminAddAdminModal onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default AdminUsersComp;
