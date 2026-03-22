"use client";

import { dbApi } from "@/api";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateWebhookDialog } from "@/components/custom/database/CreateWebhookDialog";
import { RefreshCw, Trash2, Webhook } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Webhook {
  id: string;
  event: string;
  target_url: string; // The API returns snake_case due to raw query
  secret?: string;
  is_active: boolean;
  created_at: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchWebhooks();
  }, [refreshKey]);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await dbApi.get("/admin/webhooks");
      // Adjust based on controller response structure
      // controller: res.status(200).json({ isSuccess: true, data: result })
      setWebhooks(res.data.data);
    } catch (error) {
      console.error("Failed to fetch webhooks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCallback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;
    try {
      await dbApi.delete(`/admin/webhooks/${id}`);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete webhook", error);
    }
  };

  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Webhook className="h-6 w-6" /> Webhooks
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey((prev) => prev + 1)}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <CreateWebhookDialog
            onSuccess={() => setRefreshKey((prev) => prev + 1)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Target URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  {loading ? "Loading..." : "No webhooks found."}
                </TableCell>
              </TableRow>
            ) : (
              webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>
                    <Badge variant="outline">{webhook.event}</Badge>
                  </TableCell>
                  <TableCell
                    className="font-mono text-xs max-w-[300px] truncate"
                    title={webhook.target_url}
                  >
                    {webhook.target_url}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        webhook.is_active ? "bg-green-500" : "bg-gray-500"
                      }
                    >
                      {webhook.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCallback(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
