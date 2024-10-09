import { useDropzone } from "react-dropzone";
// import { useUploadThing } from "~/utils/uploadthing";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";

import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

export function FileUpload({ onUploadComplete }: { onUploadComplete: (files: File[], urls: string[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string, name: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing("fileUploader", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        const uploadedInfo = res.map((file) => ({ url: file.url, name: file.name }));
        setUploadedFiles((prev) => [...prev, ...uploadedInfo]);
        onUploadComplete(files, uploadedInfo.map(file => file.url));
        setFiles([]);
      } else {
        setError("Upload completed, but no file information was returned.");
      }
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      setError(`Upload failed: ${error.message}`);
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
      setError(null);
    },
    multiple: true, // Allow multiple file selection
  });

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    try {
      if (files.length === 0) {
        setError("Please select files to upload.");
        return;
      }
      await startUpload(files);
    } catch (error) {
      console.error("Error during upload:", error);
      setError(`An unexpected error occurred during upload. Please try again.`);
    }
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-6 rounded-lg cursor-pointer">
        <input {...getInputProps()} />
        <p className="text-center">Drag & drop files here, or click to select files</p>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span>{file.name}</span>
              <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      )}
      {error && (
        <div className="text-red-500 mt-2">
          {error}
        </div>
      )}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Uploaded Files:</h3>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="bg-green-100 p-2 rounded">
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {file.name}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}