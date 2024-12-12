import Image from "next/image";

const VsCustomLogo = () => {
  return (
    <div className="flex items-center gap-x-2 justify-center">
      <Image src="/images/vs_logo.png" alt="logo" width={32} height={32} />
      <p className="!font-[Ogonek Unicase] text-2xl">VillageSquare</p>
    </div>
  );
};

export default VsCustomLogo;
