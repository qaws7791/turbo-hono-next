import { useState } from "react";

import { validateFile } from "../utils/file-validation";

interface UseFileDropReturn {
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (
    e: React.DragEvent,
    onValidFile: (file: File) => Promise<void>,
    maxFiles?: number,
    currentFileCount?: number,
  ) => Promise<void>;
}

/**
 * 파일 드래그 앤드 드롭 상태를 관리하는 훅
 */
export const useFileDrop = (): UseFileDropReturn => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (
    e: React.DragEvent,
    onValidFile: (file: File) => Promise<void>,
    maxFiles: number = 1,
    currentFileCount: number = 0,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (currentFileCount >= maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file) return;

      const validation = validateFile(file);
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }

      await onValidFile(file);
    }
  };

  return {
    dragActive,
    handleDrag,
    handleDrop,
  };
};
