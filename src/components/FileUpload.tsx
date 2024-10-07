import { useDropzone } from "react-dropzone";
// import { useUploadThing } from "~/utils/uploadthing";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";

import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

export function FileUpload({ onUploadComplete }: { onUploadComplete: (files: string[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string, name: string }>>([]); // Changed type

  const { startUpload, isUploading } = useUploadThing("fileUploader", {
    onClientUploadComplete: (res) => {
      const uploadedInfo = res?.map((file) => ({ url: file.url, name: file.name })) || [];
      setUploadedFiles((prev) => [...prev, ...uploadedInfo]);
      onUploadComplete(uploadedInfo.map(file => file.url));
    },
    onUploadError: (error: Error) => {
      alert(`ERROR! ${error.message}`);
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
  });

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    await startUpload(files);
    setFiles([]);
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