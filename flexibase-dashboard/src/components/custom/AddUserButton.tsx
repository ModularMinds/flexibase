import { authApi } from "@/api";
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
import { useFlexibaseAuth } from "@/context/FlexibaseAuthProvider";
import { ChangeEvent, useState } from "react";

export function AddUserButton() {
  const [state, setState] = useState({ email: "", password: "" });

  const { triggerFetch } = useFlexibaseAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const [isDialogOpen, setDialogOpen] = useState(false);

  const addUser = () => {
    authApi
      .post("/sign-up", state)
      .then(() => {
        triggerFetch((prev) => prev + 1);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setDialogOpen(false);
      });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setDialogOpen(true)}>
          Add User
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Add new users to your application here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              className="col-span-3"
              name="email"
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              className="col-span-3"
              type="password"
              name="password"
              onChange={handleChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={addUser}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
