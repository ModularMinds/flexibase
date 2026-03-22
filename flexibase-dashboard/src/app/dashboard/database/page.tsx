"use client";

import { dbApi } from "@/api";
import { CreateTableButton } from "@/components/custom/CreateTableButton";

import ServiceUnavailableBanner from "@/components/custom/ServiceUnavailableBanner";
import TablesList from "@/components/custom/TablesList";
import FlexibaseDBProvider from "@/context/FlexibaseDBProvider";

import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Webhook } from "lucide-react";

const Page = () => {
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean>();

  useEffect(() => {
    dbApi
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
        <ServiceUnavailableBanner serviceName="Database" />
      ) : (
        <FlexibaseDBProvider>
          <div className="flex flex-col gap-6 p-10">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Database Management</h1>
              <div className="flex gap-2">
                <Link href="/dashboard/database/webhooks">
                  <Button variant="outline">
                    <Webhook className="mr-2 h-4 w-4" /> Webhooks
                  </Button>
                </Link>
                <Link href="/dashboard/database/audit-logs">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" /> Audit Logs
                  </Button>
                </Link>
                <CreateTableButton />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Tables</h2>
              <TablesList />
            </div>
          </div>
        </FlexibaseDBProvider>
      )}
    </div>
  );
};

export default Page;
