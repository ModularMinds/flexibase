"use client";

import { mailerApi } from "@/api";
import ServiceUnavailableBanner from "@/components/custom/ServiceUnavailableBanner";
import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/custom/mailer/OverviewTab";
import { TemplatesTab } from "@/components/custom/mailer/TemplatesTab";
import { LogsTab } from "@/components/custom/mailer/LogsTab";

const Page = () => {
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean>();

  useEffect(() => {
    mailerApi
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
        />
      </div>
    );
  }

  if (!isServiceAvailable) {
    return <ServiceUnavailableBanner serviceName="Mailer" />;
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mailer Service</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="templates" className="space-y-4">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value="logs" className="space-y-4">
          <LogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
