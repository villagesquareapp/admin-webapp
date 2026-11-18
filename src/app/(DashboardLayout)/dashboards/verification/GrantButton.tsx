"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/app/components/shared/Button";
import { usePermissions } from "@/utils/permissions";
import GrantVerificationModal from "./GrantVerificationModal";

const GrantButton = () => {
  const [open, setOpen] = useState(false);
  const { can } = usePermissions();
  if (!can("verification.manage")) return null;
  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <Icon icon="solar:verified-check-linear" height={17} className="me-1.5" />
        Verify people
      </Button>
      <GrantVerificationModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default GrantButton;
