"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { DialogOverlay } from "@/src/components/ui/dialog-overlay";

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay />

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <pre className="mt-2 w-full overflow-auto rounded-lg bg-muted p-4 text-sm">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </DialogContent>
    </Dialog>
  );
}
