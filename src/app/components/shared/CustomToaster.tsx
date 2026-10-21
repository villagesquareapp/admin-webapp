import { Toaster } from "sonner";

const CustomToaster = () => {
  // 32px was sonner 1's default; sonner 2 moved toasts to 24px from the edge.
  return <Toaster richColors position="top-center" offset={32} />;
};

export default CustomToaster;
