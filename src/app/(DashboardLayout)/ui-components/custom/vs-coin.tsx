import Image from "next/image";

const VSCoin = ({ size }: { size?: number }) => {
  return (
    <Image
      src="/images/vs-coin.png"
      alt="vs-coin"
      height={size ? size : 20}
      width={size ? size : 20}
    />
  );
};

export default VSCoin;
