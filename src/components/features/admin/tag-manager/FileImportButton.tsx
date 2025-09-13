"use client";
import { Button } from "@/src/components/ui/button";
import { Upload } from "lucide-react";
import { useRef } from "react";

interface FileImportButtonProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  children: React.ReactNode;
}

export function FileImportButton({
  onFileChange,
  accept = ".csv,.txt",
  children,
}: FileImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button variant="outline" onClick={handleClick}>
        {children}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={onFileChange}
      />
    </>
  );
}
