"use client";

import { dbApi } from "@/api";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface StructureTabProps {
  tableName: string;
}

interface Column {
  name: string;
  type: string;
  constraints?: string;
}

export function StructureTab({ tableName }: StructureTabProps) {
  const [cols, setCols] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [colName, setColName] = useState("");
  const [colType, setColType] = useState("VARCHAR(255)");
  const [colConstraints, setColConstraints] = useState("");

  useEffect(() => {
    fetchColumns();
  }, [tableName, refreshKey]);

  const fetchColumns = async () => {
    setLoading(true);
    try {
      const res = await dbApi.get("/admin/get-columns", {
        params: { tableName: tableName },
      });
      setCols(res.data.columns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async () => {
    try {
      await dbApi.patch("/admin/alter-table", {
        tableName,
        action: "ADD",
        column: {
          name: colName,
          type: colType,
          constraints: colConstraints,
        },
      });
      setDialogOpen(false);
      setColName("");
      setColType("VARCHAR(255)");
      setColConstraints("");
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      console.error("Failed to add column", error);
      alert(
        "Failed to add column: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleDropColumn = async (colName: string) => {
    if (
      !confirm(
        `Are you sure you want to drop column "${colName}"? This action cannot be undone.`,
      )
    )
      return;

    try {
      await dbApi.patch("/admin/alter-table", {
        tableName,
        action: "DROP",
        column: {
          name: colName,
        },
      });
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      console.error("Failed to drop column", error);
      alert(
        "Failed to drop column: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  if (loading && cols.length === 0) {
    return (
      <div className="flex items-center justify-center p-10">
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Table Structure</h3>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              Add Column
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Column</DialogTitle>
              <DialogDescription>
                Add a new column to the {tableName} table.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., status"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select value={colType} onValueChange={setColType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VARCHAR(255)">VARCHAR(255)</SelectItem>
                    <SelectItem value="TEXT">TEXT</SelectItem>
                    <SelectItem value="INTEGER">INTEGER</SelectItem>
                    <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                    <SelectItem value="TIMESTAMP">TIMESTAMP</SelectItem>
                    <SelectItem value="JSONB">JSONB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="constraints" className="text-right">
                  Constraints
                </Label>
                <Input
                  id="constraints"
                  value={colConstraints}
                  onChange={(e) => setColConstraints(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., NOT NULL DEFAULT 'active'"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddColumn} disabled={!colName}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cols.map((col: any) => (
              // The API currently returns plain strings for columns often, need to handle that or object
              // Checking previous page implementation: `setCols(res.data.columns)` where columns is `string[]`.
              // So we only have names for now unless backend updated.
              <TableRow key={typeof col === "string" ? col : col.name}>
                <TableCell className="font-medium">
                  {typeof col === "string" ? col : col.name}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDropColumn(typeof col === "string" ? col : col.name)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
