"use client";

import { authApi } from "@/api";
import { AddUserButton } from "@/components/custom/AddUserButton";
import AuthenticatedUsersList from "@/components/custom/AuthenticatedUsersList";

import ServiceUnavailableBanner from "@/components/custom/ServiceUnavailableBanner";
import FlexibaseAuthProvider from "@/context/FlexibaseAuthProvider";

import { useEffect, useState } from "react";

import { TailSpin } from "react-loader-spinner";

const Page = () => {
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean>();

  useEffect(() => {
    authApi
      .get("/service-check")
      .then(() => {
        setIsServiceAvailable(true);
      })
      .catch(() => {
        setIsServiceAvailable(false);
      });
  }, []);

  if (isServiceAvailable === undefined) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <TailSpin
          visible={true}
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  return (
    <div>
      {!isServiceAvailable ? (
        <ServiceUnavailableBanner serviceName="Authentication" />
      ) : (
        <FlexibaseAuthProvider>
          <div className="flex items-center justify-between px-10 py-4">
            <span></span>
            <AddUserButton />
          </div>
          <AuthenticatedUsersList />
        </FlexibaseAuthProvider>
      )}
    </div>
  );
};

export default Page;
