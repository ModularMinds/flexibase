import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlexibaseDB } from "@/context/FlexibaseDBProvider";
import { dbApi } from "@/api";

export function CreateTableButton() {
  const { triggerFetch, setTableDetail, tableDetail } = useFlexibaseDB();

  const [modalNo, setModalNo] = useState(0);

  const [cols, setCols] = useState<
    { name: string; type: string; constraints: string }[]
  >([]);

  const handleColumnChange = (index: number, field: string, value: string) => {
    setCols((prevCols) =>
      prevCols.map((col, idx) =>
        idx === index ? { ...col, [field]: value } : col
      )
    );
  };

  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setCols(
      Array.from({ length: tableDetail.noc }, () => ({
        name: "",
        type: "",
        constraints: "",
      }))
    );
  }, [tableDetail.noc]);

  const saveData = () => {
    dbApi
      .post("/admin/create-table", {
        tableName: tableDetail.name,
        tableColumns: cols,
      })
      .then(() => {
        triggerFetch((prev) => prev + 1);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setDialogOpen(false);
        setModalNo(0);
        setTableDetail({
          name: "",
          noc: 0,
        });
      });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setDialogOpen(true)}>
          Create Table
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[865px]">
        {modalNo === 0 && (
          <>
            <DialogHeader>
              <DialogTitle>Create Table</DialogTitle>
              <DialogDescription>
                Create new table for your application here. Click save when
                you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Table Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  name="name"
                  onChange={(e) =>
                    setTableDetail((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  value={tableDetail.name}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="noc" className="text-right">
                  Enter No. of Columns
                </Label>
                <Input
                  id="noc"
                  className="col-span-3"
                  type="number"
                  name="noc"
                  onChange={(e) =>
                    setTableDetail((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  value={tableDetail.noc}
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setModalNo(1)}>Next</Button>
            </DialogFooter>
          </>
        )}

        {modalNo === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Add Data</DialogTitle>
              <DialogDescription>
                Create new table for your application here. Click save when
                you're done.
              </DialogDescription>
            </DialogHeader>

            <div>
              {cols.map((col, id) => {
                return (
                  <div className="grid grid-cols-3 gap-4 py-4" key={id}>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Column Name
                      </Label>
                      <Input
                        id="name"
                        className="col-span-3"
                        name="name"
                        onChange={(e) =>
                          handleColumnChange(id, "name", e.target.value)
                        }
                        value={col.name}
                      />
                    </div>

                    <Select
                      onValueChange={(value) =>
                        handleColumnChange(id, "type", value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="INT">INT</SelectItem>
                          <SelectItem value="VARCHAR">VARCHAR</SelectItem>
                          <SelectItem value="TEXT">TEXT</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="constraints" className="text-right">
                        Constraint
                      </Label>
                      <Input
                        id="constraints"
                        className="col-span-3"
                        type="text"
                        name="constraints"
                        value={col.constraints}
                        onChange={(e) =>
                          handleColumnChange(id, "constraints", e.target.value)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button onClick={() => setModalNo(0)}>Back</Button>
              <Button onClick={saveData}>Save</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
