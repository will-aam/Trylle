"use client";

import { useEditor, EditorContent, Editor, Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { useCallback, useState, useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";

// O componente EditorToolbar não precisa de alterações
const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    if (isLinkModalOpen && editor) {
      const previousUrl = editor.getAttributes("link").href;
      setLinkUrl(previousUrl || "");
    }
  }, [isLinkModalOpen, editor]);

  const handleSetLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setIsLinkModalOpen(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  const ToggleButton = ({
    onClick,
    disabled,
    isActive,
    children,
    tooltip,
  }: any) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "p-2 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            isActive ? "bg-muted text-foreground" : "text-muted-foreground"
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );

  const Separator = () => <div className="w-[1px] bg-border mx-1 my-1" />;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="border border-input bg-transparent rounded-t-md p-1 flex gap-0.5 flex-wrap">
        <ToggleButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          tooltip="Negrito (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          tooltip="Itálico (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          tooltip="Riscado (Ctrl+Shift+X)"
        >
          <Strikethrough className="w-4 h-4" />
        </ToggleButton>
        <Separator />
        <ToggleButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          tooltip="Título 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToggleButton>
        <ToggleButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          tooltip="Título 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToggleButton>
        <ToggleButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          tooltip="Título 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToggleButton>
        <Separator />
        <ToggleButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          tooltip="Lista com marcadores"
        >
          <List className="w-4 h-4" />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          tooltip="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </ToggleButton>
        <Separator />
        <ToggleButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          tooltip="Citação"
        >
          <Quote className="w-4 h-4" />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          tooltip="Bloco de código"
        >
          <Code className="w-4 h-4" />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          tooltip="Linha horizontal"
        >
          <Minus className="w-4 h-4" />
        </ToggleButton>
        <Separator />
        <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "p-2 rounded hover:bg-muted transition-colors",
                    editor.isActive("link")
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Adicionar Link (Ctrl+K)</p>
            </TooltipContent>
          </Tooltip>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Link</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input
                  id="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="https://exemplo.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSetLink();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleSetLink}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

interface RichTextEditorProps {
  content: Content;
  onChange: (markdown: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // AQUI ESTÁ A CORREÇÃO PRINCIPAL
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
        // Desabilitamos a extensão de link padrão do StarterKit...
        link: false,
      }),
      // ...e adicionamos a nossa própria versão configurada aqui.
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class:
            "text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-500 transition-colors cursor-pointer",
        },
      }),
      Markdown,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        onChange((editor.storage as any).markdown.getMarkdown());
      }, 300);
    },
    editorProps: {
      attributes: {
        class:
          "rounded-b-md border-x border-b border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[232px] prose dark:prose-invert prose-sm max-w-none prose-a:text-blue-600 prose-a:underline dark:prose-a:text-blue-400",
      },
    },
  });

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <div className="mt-1">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
