import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "O acesso será gratuito para sempre?",
      answer:
        "Durante a fase de lançamento, sim! Estamos oferecendo acesso 100% gratuito para os primeiros usuários. No futuro, poderemos introduzir planos premium com recursos adicionais.",
    },
    {
      question: "Posso sugerir temas?",
      answer:
        "Claro! Valorizamos muito o feedback da nossa comunidade. Você pode <a href='/suggest-topic' class='underline font-semibold text-blue-500 hover:text-white'>sugerir temas</a>, fazer perguntas específicas ou até mesmo indicar fontes interessantes que gostaria de ver abordadas.",
    },
    {
      question: "Preciso cadastrar um cartão de crédito?",
      answer:
        "Não! O acesso gratuito é realmente gratuito. Você só precisa do seu e-mail para receber as atualizações e ter acesso ao conteúdo. Sem pegadinhas ou cobranças ocultas.",
    },
    {
      question: "Como funciona o documento PDF?",
      answer:
        "Cada episódio vem acompanhado de um PDF exclusivo que contém um resumo da pesquisa, as principais fontes utilizadas, links para aprofundamento e às vezes exercícios ou reflexões sobre o tema abordado.",
    },
    {
      question: "Quando será o lançamento oficial?",
      answer:
        "Estamos trabalhando para lançar oficialmente nos próximos meses. Os usuários que se cadastrarem agora terão acesso antecipado ao conteúdo e serão os primeiros a saber sobre todas as novidades.",
    },
  ];

  return (
    <section id="faq" className="px-4 sm:px-6 lg:px-8 bg-muted/30 scroll-mt-14">
      <div className="max-w-3xl mx-auto py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance mb-3 sm:mb-4 px-2 sm:px-0">
            Perguntas Frequentes
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2 sm:px-0">
            Tudo o que você precisa saber sobre o Trylle
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-background rounded-lg border px-4 sm:px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4 sm:py-6 text-sm sm:text-base">
                <span className="font-semibold pr-2">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 sm:pb-6 text-muted-foreground leading-relaxed text-sm sm:text-base">
                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
