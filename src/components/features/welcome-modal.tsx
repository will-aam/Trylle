"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Gift } from "lucide-react";
import { DialogOverlay } from "@/src/components/ui/dialog-overlay";

export function WelcomeModal() {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="sm:max-w-[600px] overflow-hidden border shadow-2xl shadow-black/50">
          <DialogHeader className="text-center">
            {/* Ícone */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-xl">
              <Gift className="h-10 w-10 text-white drop-shadow-lg" />
            </div>
            {/* Título com gradiente vibrante */}
            <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Bem-vindo ao Trylle!
            </DialogTitle>
            <DialogDescription>
              Estamos muito felizes em ter você como um dos primeiros usuários
              da nossa plataforma!
            </DialogDescription>
          </DialogHeader>
          <div>
            {/* Box de destaque com fundo escuro e borda sutil */}
            <div className="flex items-start gap-4 p-5 mb-6 bg-slate-900/50 rounded-xl border border-slate-700 shadow-inner">
              <div>
                <p className="font-medium text-slate-200">
                  Aproveite o acesso{" "}
                  <strong className="text-indigo-300">100% gratuito</strong> a
                  todo o nosso catálogo.
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Estamos em fase de lançamento e seu feedback é muito
                  importante para nós.
                </p>
              </div>
            </div>
            <div className="text-sm text-slate-200">
              Em breve, o Trylle se tornará um serviço por assinatura para nos
              ajudar a cobrir os custos e trazer ainda mais conteúdos de
              qualidade. Mas não se preocupe, avisaremos com antecedência!
            </div>
          </div>
          <DialogFooter className="sm:justify-center mt-8">
            <Button onClick={() => setOpen(false)} size="lg">
              Entendi, quero explorar!
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
