"use client";
import { useRef } from "react";
import { Button } from "../../../ui/button";
import { Upload } from "lucide-react";

interface FileInputProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
}

export function FileInput({
  onFileChange,
  accept = ".csv,.txt",
}: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={onFileChange}
      />
      <Button onClick={handleClick} variant="outline" className="w-full">
        <Upload className="mr-2 h-4 w-4" /> Importar
      </Button>
    </>
  );
}
