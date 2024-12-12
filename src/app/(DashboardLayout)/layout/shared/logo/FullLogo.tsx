"use client";
import Image from "next/image";
import Link from "next/link";
const FullLogo = () => {
  return (
    <Link href={"/"}>
      <Image
        src={"/vs_images/vs_logo.png"}
        width={60}
        height={60}
        alt="logo"
        className="block"
      />
    </Link>
  );
};

export default FullLogo;
