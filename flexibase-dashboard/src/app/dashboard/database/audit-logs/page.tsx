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
import { RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  timestamp: string;
  details: any;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [tableName, setTableName] = useState("");
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [refreshKey]); // Fetch on refresh only for now, can debounce input changes later

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await dbApi.get("/admin/get-audit-logs", {
        params: {
          tableName: tableName || undefined,
          userId: userId || undefined,
          action: action && action !== "ALL" ? action : undefined,
          limit: 100,
        },
      });
      setLogs(res.data.logs);
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" /> Global Audit Logs
        </h1>
      </div>

      <div className="bg-muted/50 p-4 rounded-md">
        <form onSubmit={handleFilterSubmit} className="flex gap-4 items-end">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              type="text"
              placeholder="Filter by Table Name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              type="text"
              placeholder="Filter by User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div className="grid w-[200px] items-center gap-1.5">
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="INSERT">INSERT</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Filter"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setTableName("");
              setUserId("");
              setAction("");
              setRefreshKey((prev) => prev + 1);
            }}
          >
            Clear
          </Button>
        </form>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Record ID</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  {loading ? "Loading..." : "No logs found matching criteria."}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {log.user_id}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.action === "INSERT"
                          ? "default"
                          : log.action === "DELETE"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.table_name}
                  </TableCell>
                  <TableCell
                    className="font-mono text-xs max-w-[150px] truncate"
                    title={log.record_id}
                  >
                    {log.record_id || "-"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
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
