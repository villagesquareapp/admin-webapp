"use client";
import Image from "next/image";
import Link from "next/link";
const Logo = ({ size }: { size?: number }) => {
  return (
    <Link href={"/"}>
      <Image
        src={"/vs_images/vs_logo.png"}
        width={size ? size : 100}
        height={size ? size : 100}
        alt="logo"
        className="block"
      />
    </Link>
  );
};

export default Logo;
