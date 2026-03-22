"use client";

import { dbApi } from "@/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Plus } from "lucide-react";

interface CreateWebhookDialogProps {
  onSuccess: () => void;
}

export function CreateWebhookDialog({ onSuccess }: CreateWebhookDialogProps) {
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState("INSERT");
  const [targetUrl, setTargetUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!targetUrl) return;

    setLoading(true);
    try {
      await dbApi.post("/admin/webhooks", {
        event,
        targetUrl,
        secret: secret || undefined,
      });
      setOpen(false);
      setTargetUrl("");
      setSecret("");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to create webhook", error);
      alert(
        "Failed to create webhook: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Webhook</DialogTitle>
          <DialogDescription>
            Trigger external services when database events occur.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event" className="text-right">
              Event
            </Label>
            <Select value={event} onValueChange={setEvent}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSERT">INSERT</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="CREATE_TABLE">CREATE_TABLE</SelectItem>
                <SelectItem value="ALTER_TABLE">ALTER_TABLE</SelectItem>
                <SelectItem value="DELETE_TABLE">DELETE_TABLE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetUrl" className="text-right">
              Target URL
            </Label>
            <Input
              id="targetUrl"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://api.example.com/callback"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="secret" className="text-right">
              Secret (Opt)
            </Label>
            <Input
              id="secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="col-span-3"
              type="password"
              placeholder="Signature secret"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading || !targetUrl}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
