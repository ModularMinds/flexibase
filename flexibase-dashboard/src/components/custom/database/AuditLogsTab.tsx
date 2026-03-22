"use client";

import { dbApi } from "@/api";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditLogsTabProps {
  tableName: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  timestamp: string;
  details: any;
}

export function AuditLogsTab({ tableName }: AuditLogsTabProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [tableName, refreshKey]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await dbApi.get("/admin/get-audit-logs", {
        params: { tableName: tableName, limit: 50 },
      });
      setLogs(res.data.logs);
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Audit Logs for {tableName}</h3>
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
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Record ID</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  {loading ? "Loading..." : "No logs found for this table."}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {log.user_id}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        log.action === "INSERT"
                          ? "bg-green-100 text-green-800"
                          : log.action === "UPDATE"
                            ? "bg-blue-100 text-blue-800"
                            : log.action === "DELETE"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.record_id || "-"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
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
