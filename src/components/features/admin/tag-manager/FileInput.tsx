import { ChangeEvent } from "react";
import { Button } from "@/src/components/ui/button";

export interface FileInputProps {
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  disabled?: boolean; // ADICIONADO
}

export function FileInput({ onFileChange, disabled = false }: FileInputProps) {
  return (
    <div className="w-full">
      <label className="w-full">
        <input
          type="file"
          accept=".csv,text/csv,text/plain"
          className="hidden"
          onChange={onFileChange}
          disabled={disabled}
        />
        <Button
          variant="outline"
          type="button"
          className="w-full"
          disabled={disabled}
        >
          Importar CSV
        </Button>
      </label>
    </div>
  );
}
