import { Zap, Shield, GraduationCap } from "lucide-react";

export function SolutionSection() {
  const solutions = [
    {
      icon: Zap,
      title: "Conteúdo Condensado",
      description:
        "Episódios de 10-20 minutos, diretos ao ponto. Cada minuto é valioso e focado no que realmente importa.",
    },
    {
      icon: Shield,
      title: "Credibilidade em Primeiro Lugar",
      description:
        "Pesquisa rigorosa com múltiplas fontes. Transparência total sobre de onde vem cada informação.",
    },
    {
      icon: GraduationCap,
      title: "De Ouvinte a Estudante",
      description:
        "Cada episódio vem com material de apoio em PDF. Transforme o tempo de escuta em aprendizado ativo.",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance mb-3 sm:mb-4 px-2 sm:px-0">
            <span className="text-primary">Trylle</span>: A revolução do
            áudio-learning
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-2 sm:px-4 md:px-0">
            Não é apenas mais um podcast. É uma nova forma de aprender,
            otimizada para sua vida corrida.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="text-center space-y-3 sm:space-y-4 p-4 sm:p-0"
            >
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <solution.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">
                {solution.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
