// src/components/features/admin/episode-management/JsonViewDialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Copy, Check } from "lucide-react";

interface JsonViewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  data: object;
  title: string;
}

export function JsonViewDialog({
  isOpen,
  onOpenChange,
  data,
  title,
}: JsonViewDialogProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const jsonText = JSON.stringify(data, null, 2);
    navigator.clipboard
      .writeText(jsonText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reseta o ícone após 2s
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 overflow-auto p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-7 w-7 text-muted-foreground hover:bg-background"
            onClick={handleCopy}
            aria-label="Copiar JSON"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>

          <pre className="w-full rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
