import { Button } from "@repo/ui/button";
import { useState } from "react";
import { FileTrigger } from "react-aria-components";

import type { Document } from "@/features/learning-plan/model/types";

interface FileUploadProps {
  documents: Array<Document>;
  onUpload: (file: File) => Promise<void>;
  onDelete: (documentId: string) => void;
  maxFiles?: number;
  isUploading?: boolean;
}

export function FileUpload({
  documents,
  onUpload,
  onDelete,
  maxFiles = 3,
  isUploading = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (documents.length >= maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    const file = fileList[0];

    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      alert("PDF 파일만 업로드할 수 있습니다.");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    await onUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canUpload = documents.length < maxFiles && !isUploading;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUpload && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-colors duration-200
            ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <p className="text-sm text-gray-600 mb-2">
              PDF 파일을 드래그하거나 클릭하여 업로드하세요
            </p>
            <p className="text-xs text-gray-500 mb-4">
              최대 10MB{maxFiles > 1 ? `, ${maxFiles}개까지 업로드 가능` : ""}
            </p>

            <FileTrigger
              acceptedFileTypes={["application/pdf"]}
              onSelect={handleFiles}
            >
              <Button variant="secondary">파일 선택</Button>
            </FileTrigger>
          </div>
        </div>
      )}

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            업로드된 문서
            {maxFiles > 1 ? ` (${documents.length}/${maxFiles})` : ""}
          </h3>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <svg
                  className="w-8 h-8 text-red-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.fileName}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(doc.fileSize)}</span>
                  </div>
                </div>
              </div>

              <Button
                onPress={() => onDelete(doc.id)}
                className="ml-3 p-2 text-gray-400 hover:text-red-600 transition-colors"
                aria-label={`${doc.fileName} 삭제`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Limit Message */}
      {documents.length >= maxFiles && (
        <p className="text-sm text-gray-500 text-center">
          {documents.length}개의 파일이 업로드되었습니다.
        </p>
      )}
    </div>
  );
}
