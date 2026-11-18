import { redirect } from "next/navigation";

// Replaced by the Verification page.
export default function Page() {
  redirect("/dashboards/verification?tab=verified");
}
