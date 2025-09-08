"use client";

import { useEditor, EditorContent, Editor, Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
} from "lucide-react";
// 1. Importando o useState e useEffect para controlar o modal
import { useCallback, useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
// 2. Importando os componentes do Modal que vamos usar
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  // 3. Estados para controlar o modal e o valor da URL
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    if (isLinkModalOpen && editor) {
      // Quando o modal abre, preenche o input com a URL existente, se houver
      const previousUrl = editor.getAttributes("link").href;
      setLinkUrl(previousUrl || "");
    }
  }, [isLinkModalOpen, editor]);

  const handleSetLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      // Se o input estiver vazio, remove o link
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      // Caso contrário, adiciona ou atualiza o link
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    // Fecha o modal
    setIsLinkModalOpen(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  const ToggleButton = ({ onClick, disabled, isActive, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2 rounded hover:bg-muted transition-colors",
        isActive ? "bg-muted text-foreground" : "text-muted-foreground"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-input bg-transparent rounded-t-md p-1 flex gap-1 flex-wrap">
      {/* Botões existentes... */}
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
      >
        <Bold className="w-4 h-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
      >
        <Italic className="w-4 h-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
      >
        <span className="font-bold text-sm">H2</span>
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
      >
        <List className="w-4 h-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
      >
        <ListOrdered className="w-4 h-4" />
      </ToggleButton>

      {/* 4. Lógica do Modal de Link */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogTrigger asChild>
          <ToggleButton isActive={editor.isActive("link")}>
            <LinkIcon className="w-4 h-4" />
          </ToggleButton>
        </DialogTrigger>
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
  );
};

// O restante do componente permanece o mesmo
interface RichTextEditorProps {
  content: Content;
  onChange: (markdown: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
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
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class:
            "text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-500 transition-colors cursor-pointer",
        },
      }),
      Markdown,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange((editor.storage as any).markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class:
          "rounded-b-md border-x border-b border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[232px] prose dark:prose-invert prose-sm max-w-none prose-a:text-blue-600 prose-a:underline dark:prose-a:text-blue-400",
      },
    },
  });

  return (
    <div className="mt-1">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
