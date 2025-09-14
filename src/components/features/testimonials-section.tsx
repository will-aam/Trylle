import { Card, CardContent } from "../ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Maria Silva",
    role: "Desenvolvedora",
    content:
      "O PlayPath transformou minha rotina de aprendizado. Escuto enquanto caminho para o trabalho e já aprendi tanto sobre tecnologia!",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Maria",
  },
  {
    id: 2,
    name: "João Santos",
    role: "Empreendedor",
    content:
      "Conteúdo de qualidade excepcional. Os episódios sobre negócios me ajudaram a expandir minha startup.",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Joao",
  },
  {
    id: 3,
    name: "Ana Costa",
    role: "Estudante",
    content:
      "Perfeito para quem tem pouco tempo. Consigo absorver conhecimento de forma prática e eficiente.",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Kimberly",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-br from-card via-card to-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            O que nossos ouvintes dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Mais de 100 mil pessoas já transformaram sua rotina de aprendizado
            com conteúdo de qualidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm"
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>

                <div className="relative mb-6">
                  <Quote className="h-10 w-10 text-primary/10 absolute -top-2 -left-2" />
                  <p className="text-base leading-relaxed text-pretty relative z-10 pl-6">
                    {testimonial.content}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <div className="relative">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-base text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
