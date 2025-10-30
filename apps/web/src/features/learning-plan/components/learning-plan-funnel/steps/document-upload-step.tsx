import { Button } from "@repo/ui/button";
import { ChevronRight, FileText } from "lucide-react";
import React from "react";

import type { Document } from "@/features/learning-plan/model/types";

import { useDocumentUpload } from "@/features/learning-plan/hooks/use-document-upload";
import { FileUpload } from "@/shared/components/file-upload";

interface DocumentUploadStepProps {
  documentId?: string;
  onNext: (data: { documentId?: string }) => void;
}

export const DocumentUploadStep = (props: DocumentUploadStepProps) => {
  const [document, setDocument] = React.useState<Document | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { uploadDocument, isUploading, errorMessage } = useDocumentUpload();

  React.useEffect(() => {
    if (!errorMessage) {
      return;
    }

    setError(errorMessage);
  }, [errorMessage]);

  const handleUpload = async (file: File) => {
    setError(null);

    try {
      const uploadedDocument = await uploadDocument(file);
      setDocument(uploadedDocument);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "파일 업로드에 실패했습니다.";
      setError(errorMessage);
      console.error("Upload failed:", err);
    }
  };

  const handleDelete = (_documentId: string) => {
    console.log("handleDelete", _documentId);
    setDocument(null);
  };

  const handleNext = () => {
    props.onNext({
      documentId: document?.id,
    });
  };

  const handleSkip = () => {
    props.onNext({ documentId: undefined });
  };

  return (
    <>
      <div className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">학습 문서 업로드</h2>
            <p className="text-gray-600">
              학습하고자 하는 PDF 문서를 업로드해주세요. <br />
              문서 내용을 기반으로 맞춤형 학습 계획을 생성해드립니다.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <FileUpload
            documents={document ? [document] : []}
            onUpload={handleUpload}
            onDelete={handleDelete}
            maxFiles={1}
            isUploading={isUploading}
          />

          {!document && (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                문서 없이도 학습 계획을 생성할 수 있습니다
              </p>
              <p className="text-xs text-gray-500">
                건너뛰기를 누르면 일반적인 학습 학습 계획이 생성됩니다
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 flex justify-between">
        <Button
          onClick={handleSkip}
          variant="ghost"
        >
          건너뛰기
        </Button>

        <Button
          onClick={handleNext}
          isDisabled={isUploading}
        >
          다음
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
};
