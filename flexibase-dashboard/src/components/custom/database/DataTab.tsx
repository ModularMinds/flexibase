"use client";

import { dbApi } from "@/api";
import { Button } from "@/components/ui/button";
import { useEffect, useState, ChangeEvent } from "react";
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

interface DataTabProps {
  tableName: string;
}

export function DataTab({ tableName }: DataTabProps) {
  const [tableRows, setTableRows] = useState<object[] | undefined>(undefined);
  const [cols, setCols] = useState<string[]>([]);
  const [fields, setFields] = useState<{ [key: string]: string }>({});
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [fetchKey, triggerFetch] = useState(0);

  // Fetch data for table rows
  useEffect(() => {
    dbApi
      .post("/fetch-data", {
        tableName: tableName,
      })
      .then((res) => {
        setTableRows(res.data.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [tableName, fetchKey]);

  // Fetch columns for the table
  useEffect(() => {
    dbApi
      .get("/admin/get-columns", { params: { tableName: tableName } })
      .then((res) => {
        setCols(res.data.columns);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [tableName]);

  // Update the fields state when columns change
  useEffect(() => {
    setFields(
      cols.reduce(
        (obj, key) => {
          obj[key] = "";
          return obj;
        },
        {} as { [key: string]: string },
      ),
    );
  }, [cols]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await dbApi.post("/insert-data", {
        tableName: tableName,
        data: fields,
      });
      setDialogOpen(false);
      triggerFetch((prev) => prev + 1);
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  if (tableRows === undefined) {
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
        <h3 className="text-lg font-medium">Table Data</h3>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              Add Row
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Row</DialogTitle>
              <DialogDescription>
                Add a new record to the {tableName} table.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {cols.map((col) => (
                <div key={col} className="grid items-center gap-4">
                  <Label htmlFor={col} className="text-right">
                    {col}
                  </Label>
                  <Input
                    id={col}
                    className="col-span-3"
                    name={col}
                    value={fields[col] || ""}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              {cols.map((head) => (
                <th className="h-10 px-4 font-medium" key={head}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="h-24 text-center">
                  No data found.
                </td>
              </tr>
            ) : (
              tableRows.map((row, rid) => {
                const cells = Object.entries(row);
                return (
                  <tr key={rid} className="border-t hover:bg-muted/50">
                    {cells.map((cell, cid) => (
                      <td className="p-4 align-middle" key={cid}>
                        {cell[1]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
