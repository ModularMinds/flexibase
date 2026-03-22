"use client";

import { SendTestEmailDialog } from "./SendTestEmailDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Mail, Server } from "lucide-react";

export function OverviewTab() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Service Status
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" /> Online
            </div>
            <p className="text-xs text-muted-foreground">
              Mailer service is healthy
            </p>
          </CardContent>
        </Card>

        {/* Placeholder for other stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Emails sent this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for managing your mailer service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <SendTestEmailDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
