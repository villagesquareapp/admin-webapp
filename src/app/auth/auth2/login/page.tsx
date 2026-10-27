import type { Metadata } from "next";
import AuthShell from "../../AuthShell";
import AuthLogin from "../../authforms/AuthLogin";

export const metadata: Metadata = {
  title: "Sign in · VillageSquare Admin",
  description: "Sign in to the VillageSquare staff console",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthLogin />
    </AuthShell>
  );
}
