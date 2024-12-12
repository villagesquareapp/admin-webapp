"use client";
import Image from "next/image";
import Link from "next/link";
const Logo = () => {
  return (
    <Link href={"/"}>
      <Image
        src={"/vs-images/vs_logo.png"}
        width={100}
        height={100}
        alt="logo"
        className="block"
      />
    </Link>
  );
};

export default Logo;
