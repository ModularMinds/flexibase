"use client";

import { dbApi } from "@/api";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useFlexibaseDB } from "@/context/FlexibaseDBProvider";
import { Eye, Trash2 } from "lucide-react";

const TablesList = () => {
  const [tables, setTables] = useState<string[]>([]);
  const { fetchKey, triggerFetch } = useFlexibaseDB();
  const router = useRouter();

  useEffect(() => {
    dbApi
      .get("/admin/get-tables")
      .then((res) => {
        setTables(res.data.tables);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [fetchKey]);

  const handleDelete = async (tableName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete table "${tableName}"? This action cannot be undone.`,
      )
    )
      return;

    try {
      await dbApi.delete("/admin/delete-table", {
        data: { tableName },
      });
      triggerFetch((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete table", error);
      alert("Failed to delete table");
    }
  };

  return (
    <div className="px-10 py-4 grid gap-4">
      {tables.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          No tables found. Create one to get started.
        </div>
      )}
      {tables.map((table) => {
        return (
          <div
            className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
            key={table}
          >
            <span className="font-medium text-lg">{table}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/database/view/${table}`)}
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(table)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TablesList;
