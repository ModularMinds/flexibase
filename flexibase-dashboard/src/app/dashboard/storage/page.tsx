"use client";

import { storageApi } from "@/api";
import ServiceUnavailableBanner from "@/components/custom/ServiceUnavailableBanner";
import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileIcon, Download, Trash2, RefreshCw } from "lucide-react";
import { FileUploadDialog } from "@/components/custom/FileUploadDialog";

interface FileMeta {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  bucket: string;
  createdAt: string;
  path: string;
}

const Page = () => {
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean>();
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    storageApi
      .get("/service-check")
      .then(() => {
        setIsServiceAvailable(true);
        fetchFiles();
      })
      .catch(() => {
        setIsServiceAvailable(false);
      });
  }, [refreshKey]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await storageApi.get("/files");
      setFiles(res.data.data.files);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const res = await storageApi.get(`/files/${fileId}/url`);
      const url = res.data.data.url;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to get download URL", error);
      alert("Failed to download file");
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await storageApi.delete(`/files/${fileId}`);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete file", error);
      alert("Failed to delete file");
    }
  };

  if (isServiceAvailable === undefined) {
    return (
      <div className="flex items-center justify-center h-[500px]">
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
    <div>
      {!isServiceAvailable ? (
        <ServiceUnavailableBanner serviceName="Storage" />
      ) : (
        <div className="p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Storage Explorer</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRefreshKey((prev) => prev + 1)}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
              <FileUploadDialog
                onUploadSuccess={() => setRefreshKey((prev) => prev + 1)}
              />
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      {loading ? "Loading..." : "No files found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-blue-500" />
                        {file.originalName}
                      </TableCell>
                      <TableCell>{file.mimeType}</TableCell>
                      <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                      <TableCell>
                        {new Date(file.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDownload(file.id, file.originalName)
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
