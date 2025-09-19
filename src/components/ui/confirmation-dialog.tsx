"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  children: (open: () => void) => React.ReactNode;
  onConfirm: () => Promise<void> | void;
  dialogTitle: string;
  dialogDescription: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export function ConfirmationDialog({
  children,
  onConfirm,
  dialogTitle,
  dialogDescription,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
}: ConfirmationDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      {children(() => setIsOpen(true))}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirming}>
              {cancelButtonText}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isConfirming}>
              {isConfirming ? "Confirming..." : confirmButtonText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
