"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTab } from "@/components/custom/database/DataTab";
import { StructureTab } from "@/components/custom/database/StructureTab";
import { AuditLogsTab } from "@/components/custom/database/AuditLogsTab";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page({ params }: { params: { tableName: string } }) {
  return (
    <div className="p-10 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/database">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{params.tableName}</h1>
      </div>

      <Tabs defaultValue="data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="data" className="space-y-4">
          <DataTab tableName={params.tableName} />
        </TabsContent>
        <TabsContent value="structure" className="space-y-4">
          <StructureTab tableName={params.tableName} />
        </TabsContent>
        <TabsContent value="logs" className="space-y-4">
          <AuditLogsTab tableName={params.tableName} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
