"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { mailerApi } from "@/api";
import { Send } from "lucide-react";

export function SendTestEmailDialog() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !html) return;

    setSending(true);
    try {
      await mailerApi.post("/send", {
        to,
        subject,
        html,
        text: html.replace(/<[^>]*>?/gm, ""), // Simple text fallback
      });
      setIsOpen(false);
      setTo("");
      setSubject("");
      setHtml("");
      alert("Email queued successfully!");
    } catch (error: any) {
      console.error("Failed to send email", error);
      alert(
        "Failed to send email: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" /> Send Test Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send a transactional email to test your configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">
              To
            </Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="col-span-3"
              placeholder="recipient@example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3"
              placeholder="Test Email Subject"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="html" className="text-right">
              Body (HTML)
            </Label>
            <Textarea
              id="html"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="col-span-3 h-[150px]"
              placeholder="<h1>Hello World</h1>"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSend}
            disabled={!to || !subject || !html || sending}
          >
            {sending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
