"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { mailerApi } from "@/api";
import { Loader2 } from "lucide-react";

interface TemplatePreviewDialogProps {
  templateId: string | null;
  onClose: () => void;
}

export function TemplatePreviewDialog({
  templateId,
  onClose,
}: TemplatePreviewDialogProps) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (templateId) {
      fetchPreview();
    } else {
      setHtml("");
    }
  }, [templateId]);

  const fetchPreview = async () => {
    if (!templateId) return;
    setLoading(true);
    try {
      // Mock context for preview - in a real app, we might ask user for JSON context
      const context = JSON.stringify({ name: "John Doe", otp: "123456" });
      const res = await mailerApi.get(
        `/tools/preview/${templateId}?context=${context}`,
      );
      setHtml(res.data);
    } catch (error) {
      console.error("Failed to fetch preview", error);
      setHtml("<div class='p-4 text-red-500'>Failed to load preview</div>");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!templateId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Template Preview: {templateId}</DialogTitle>
          <DialogDescription>Previewing with sample data.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 border rounded-md overflow-hidden bg-white relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <iframe
              srcDoc={html}
              className="w-full h-full border-0"
              title="Email Preview"
            />
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
