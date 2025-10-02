// src/components/ui/confirmation-dialog.tsx
"use client";

import React, { useState } from "react";
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

// Props base que são sempre necessárias
interface ConfirmationDialogBaseProps {
  title: string;
  description: string;
  onConfirm: () => void;
}

// Props para a versão "não controlada" que gerencia seu próprio estado
interface UncontrolledProps extends ConfirmationDialogBaseProps {
  children: (open: () => void) => React.ReactNode;
  isOpen?: never;
  onOpenChange?: never;
}

// Props para a versão "controlada" pelo componente pai
interface ControlledProps extends ConfirmationDialogBaseProps {
  children?: never;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// O componente aceitará um ou outro conjunto de props
type ConfirmationDialogProps = UncontrolledProps | ControlledProps;

export function ConfirmationDialog({
  children,
  isOpen: controlledIsOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
}: ConfirmationDialogProps) {
  // Estado interno para a versão não controlada
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Determina se o componente é controlado externamente
  const isControlled = typeof controlledIsOpen === "boolean";
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  // Função para lidar com a mudança de estado (abrir/fechar)
  const handleOpenChange = (open: boolean) => {
    if (isControlled) {
      // Se for controlado, chama a função do pai
      onOpenChange(open);
    } else {
      // Se não, usa o estado interno
      setInternalIsOpen(open);
    }
  };

  const handleConfirm = () => {
    onConfirm();
    handleOpenChange(false); // Fecha o diálogo após a confirmação
  };

  return (
    <>
      {/* Renderiza o elemento gatilho, se for a versão não controlada */}
      {children && children(() => handleOpenChange(true))}

      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleOpenChange(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
