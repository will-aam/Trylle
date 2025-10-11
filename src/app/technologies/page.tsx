import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tecnologias | Trylle",
  description:
    "As tecnologias e ferramentas que impulsionam a plataforma Trylle.",
};

const technologies = [
  {
    category: "Desenvolvimento Frontend",
    description: "A interface que você vê e interage.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "ShadCN/UI"],
  },
  {
    category: "Infraestrutura e Backend",
    description: "A base que armazena e entrega nosso conteúdo.",
    stack: ["Supabase (PostgreSQL, Auth)", "Cloudflare R2", "Vercel"],
  },
  {
    category: "Inteligência Artificial e Produtividade (Google)",
    description:
      "Ferramentas que aceleram a criação de conteúdo e o desenvolvimento.",
    stack: ["Google Gemini", "Google NotebookLM"],
  },
  {
    category: "Ferramentas de Desenvolvimento",
    description:
      "Ecossistema que garante a qualidade e a manutenção do código.",
    stack: ["pnpm", "ESLint", "Prettier", "Zod"],
  },
];

export default function TechnologiesPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Tecnologias</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Acreditamos em transparência e em usar as melhores ferramentas para
          construir uma plataforma de alta qualidade.
        </p>
      </header>

      <div className="grid gap-8">
        {technologies.map((tech) => (
          <Card key={tech.category} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{tech.category}</CardTitle>
              <CardDescription>{tech.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tech.stack.map((item) => (
                  <Badge key={item} variant="secondary" className="text-sm">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
