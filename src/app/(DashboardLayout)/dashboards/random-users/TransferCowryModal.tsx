"use client";

import { Modal, Button } from "flowbite-react";
import React from "react";

type Props = {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onConfirm: () => Promise<void>;
  selectedCount: number;
  isLoading: boolean
};

const TransferCowryModal = ({ isOpen, setIsOpen, onConfirm, selectedCount, isLoading }: Props) => {
  return (
    <Modal show={isOpen} size="md" onClose={() => setIsOpen(false)} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Confirm Transfer
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Are you sure you want to transfer NGN 5,000 to {selectedCount} user
            {selectedCount > 1 ? "s" : ""}?
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Button color="gray" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button color="success" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? "Loding..." : "Transfer"}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TransferCowryModal;