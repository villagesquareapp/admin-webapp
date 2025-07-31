import CardBox from "@/app/components/shared/CardBox";
import React from "react";
import Logo from "../../layout/shared/logo/Logo";
import UpdatePasswordForm from "./UpdatePasswordForm";

const BoxedUpdatePassword = () => {
  return (
    <div>
      <div className="relative overflow-hidden bg-muted dark:bg-dark">
        <div className="flex h-full flex-col justify-center items-center px-4">
          <center className="mb-4">
            <p className="text-2xl font-bold">Update Password</p>
          </center>
          <CardBox className="md:w-[450px] w-full border-none">
            {/* <div className="mx-auto">
              <Logo />
            </div> */}
            {/* <SocialButtons title="or sign in with" /> */}
            <UpdatePasswordForm />

            {/* <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center">
              <p>New to MaterialM?</p>
              <Link
                href={"/auth/auth2/register"}
                className="text-primary text-sm font-medium"
              >
                Create an account
              </Link>
            </div> */}
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default BoxedUpdatePassword;
