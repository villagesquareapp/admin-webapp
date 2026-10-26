import Link from "next/link";
import CardBox from "@/app/components/shared/CardBox";
import { getTrybeTypes } from "@/app/api/trybes";
import TrybeForm from "../TrybeForm";

const Page = async () => {
  const res = await getTrybeTypes();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/dashboards/trybes/list" className="text-sm text-darklink">
          ← Trybes
        </Link>
        <h4 className="text-lg font-bold mt-1">New Trybe</h4>
        <p className="text-sm text-darklink">
          You can add the avatar, cover and Trybe admins once it is created.
        </p>
      </div>
      <CardBox>
        <TrybeForm types={res?.data || []} />
      </CardBox>
    </div>
  );
};

export default Page;
