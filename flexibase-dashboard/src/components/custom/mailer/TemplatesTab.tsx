"use client";

import { mailerApi } from "@/api";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileCode, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplatePreviewDialog } from "@/components/custom/mailer/TemplatePreviewDialog";

interface Template {
  id: string;
  name: string;
  type: string;
}

export function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchTemplates();
  }, [refreshKey]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await mailerApi.get("/templates");
      // Adjust based on actual API response structure
      // Controller returns: { isSuccess: true, data: { templates: [] } }
      setTemplates(res.data.data.templates);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Email Templates</h3>
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
              <TableHead>Template Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  {loading ? "Loading..." : "No templates found."}
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-orange-500" />
                    {template.name}
                  </TableCell>
                  <TableCell>{template.type}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewTemplateId(template.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <TemplatePreviewDialog
        templateId={previewTemplateId}
        onClose={() => setPreviewTemplateId(null)}
      />
    </div>
  );
}
