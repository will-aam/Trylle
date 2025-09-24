import { Navbar } from "@/src/components/layout/navbar";
import { Footer } from "@/src/components/layout/footer";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-8 text-balance">
            Política de Acessibilidade
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Nosso Compromisso
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Trylle está comprometida em ser uma plataforma inclusiva e
                acessível para todas as pessoas, incluindo aquelas com
                deficiências. Acreditamos que o conhecimento deve ser acessível
                a todos, independentemente de suas capacidades físicas,
                sensoriais ou cognitivas.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nosso objetivo é garantir que nossa plataforma de aprendizado em
                áudio seja utilizável por pessoas com diferentes necessidades e
                que utilize tecnologias assistivas de forma eficaz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Padrões de Acessibilidade
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nos esforçamos para seguir as diretrizes de acessibilidade
                reconhecidas internacionalmente, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>
                  <strong>
                    WCAG 2.1 (Web Content Accessibility Guidelines):
                  </strong>{" "}
                  Seguimos as diretrizes de nível AA
                </li>
                <li>
                  <strong>Lei Brasileira de Inclusão (LBI):</strong> Cumprimos a
                  legislação nacional sobre acessibilidade
                </li>
                <li>
                  <strong>Decreto nº 9.522/2018:</strong> Seguimos as normas
                  sobre acessibilidade em websites
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Medidas Implementadas
              </h2>

              <h3 className="text-xl font-medium mb-3">
                3.1 Estrutura e Navegação
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>HTML Semântico:</strong> Utilizamos elementos HTML
                  apropriados para estruturar o conteúdo
                </li>
                <li>
                  <strong>Navegação por teclado:</strong> Toda a interface pode
                  ser navegada usando apenas o teclado
                </li>
                <li>
                  <strong>Ordem lógica de foco:</strong> Os elementos recebem
                  foco em uma sequência lógica e previsível
                </li>
                <li>
                  <strong>Indicadores visuais de foco:</strong> Elementos
                  focados são claramente destacados
                </li>
                <li>
                  <strong>Títulos hierárquicos:</strong> Utilizamos uma
                  estrutura clara de cabeçalhos (H1, H2, H3, etc.)
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">
                3.2 Compatibilidade com Leitores de Tela
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Textos alternativos:</strong> Todas as imagens possuem
                  descrições apropriadas
                </li>
                <li>
                  <strong>Labels descritivos:</strong> Formulários e controles
                  têm rótulos claros e descritivos
                </li>
                <li>
                  <strong>ARIA (Accessible Rich Internet Applications):</strong>{" "}
                  Utilizamos atributos ARIA quando necessário
                </li>
                <li>
                  <strong>Anúncios de estado:</strong> Mudanças importantes são
                  comunicadas aos leitores de tela
                </li>
                <li>
                  <strong>Conteúdo oculto apropriado:</strong> Informações
                  importantes não ficam ocultas para tecnologias assistivas
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">
                3.3 Design Visual e Contraste
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Alto contraste:</strong> Mantemos uma relação de
                  contraste adequada entre texto e fundo
                </li>
                <li>
                  <strong>Tamanhos de fonte flexíveis:</strong> O texto pode ser
                  ampliado até 200% sem perda de funcionalidade
                </li>
                <li>
                  <strong>Design responsivo:</strong> A interface se adapta a
                  diferentes tamanhos de tela e dispositivos
                </li>
                <li>
                  <strong>Não dependência apenas de cor:</strong> Informações
                  importantes não são transmitidas apenas por cores
                </li>
                <li>
                  <strong>Modo escuro:</strong> Oferecemos alternativa de tema
                  escuro para reduzir fadiga visual
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">
                3.4 Controles de Áudio
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Controles acessíveis:</strong> Botões de play, pause e
                  navegação são acessíveis por teclado
                </li>
                <li>
                  <strong>Controle de velocidade:</strong> Permitimos ajustar a
                  velocidade de reprodução
                </li>
                <li>
                  <strong>Controle de volume:</strong> Volume pode ser ajustado
                  independentemente do sistema
                </li>
                <li>
                  <strong>Atalhos de teclado:</strong> Fornecemos atalhos para
                  funções principais do player
                </li>
                <li>
                  <strong>Indicadores visuais:</strong> Status de reprodução é
                  indicado visualmente
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Recursos de Apoio
              </h2>

              <h3 className="text-xl font-medium mb-3">
                4.1 Documentos PDF Acessíveis
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Os documentos de apoio que acompanham cada episódio são
                estruturados para serem acessíveis:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Estrutura de cabeçalhos clara e hierárquica</li>
                <li>Texto selecionável e pesquisável</li>
                <li>Descrições alternativas para imagens e gráficos</li>
                <li>Ordem de leitura lógica</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">
                4.2 Funcionalidades Futuras
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Estamos trabalhando para implementar recursos adicionais de
                acessibilidade:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Transcrições completas dos episódios de áudio</li>
                <li>Legendas sincronizadas (quando aplicável)</li>
                <li>Resumos em texto dos principais pontos de cada episódio</li>
                <li>Opções de personalização visual avançadas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Tecnologias Assistivas Suportadas
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nossa plataforma foi testada e é compatível com as seguintes
                tecnologias assistivas:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>
                  <strong>Leitores de tela:</strong> NVDA, JAWS, VoiceOver,
                  TalkBack
                </li>
                <li>
                  <strong>Navegação por teclado:</strong> Suporte completo para
                  navegação sem mouse
                </li>
                <li>
                  <strong>Software de ampliação:</strong> ZoomText, MAGic, lupas
                  do sistema
                </li>
                <li>
                  <strong>Reconhecimento de voz:</strong> Dragon
                  NaturallySpeaking e similares
                </li>
                <li>
                  <strong>Dispositivos de entrada alternativos:</strong>{" "}
                  Switches, trackballs, joysticks
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Melhoria Contínua
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A acessibilidade é um processo contínuo de melhoria. Nossos
                compromissos incluem:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>
                  <strong>Testes regulares:</strong> Realizamos auditorias de
                  acessibilidade periodicamente
                </li>
                <li>
                  <strong>Treinamento da equipe:</strong> Nossa equipe de
                  desenvolvimento recebe treinamento em acessibilidade
                </li>
                <li>
                  <strong>Atualizações constantes:</strong> Implementamos
                  melhorias baseadas em feedback e novas diretrizes
                </li>
                <li>
                  <strong>Monitoramento de tecnologias:</strong> Acompanhamos o
                  desenvolvimento de novas tecnologias assistivas
                </li>
                <li>
                  <strong>Testes com usuários:</strong> Incluímos pessoas com
                  deficiência em nossos processos de teste
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Limitações Conhecidas
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Reconhecemos que ainda existem áreas onde podemos melhorar:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>
                  Nem todos os episódios possuem transcrições completas ainda
                </li>
                <li>
                  Alguns recursos avançados de personalização ainda estão em
                  desenvolvimento
                </li>
                <li>
                  A compatibilidade com tecnologias assistivas mais antigas pode
                  ser limitada
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Estamos trabalhando ativamente para resolver essas limitações e
                expandir nossa acessibilidade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Como Usar a Plataforma com Tecnologias Assistivas
              </h2>

              <h3 className="text-xl font-medium mb-3">
                8.1 Atalhos de Teclado Principais
              </h3>
              <div className="bg-muted p-4 rounded-lg">
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Espaço:</strong> Play/Pause do episódio atual
                  </li>
                  <li>
                    <strong>Seta esquerda/direita:</strong> Retroceder/avançar
                    10 segundos
                  </li>
                  <li>
                    <strong>Seta para cima/baixo:</strong> Aumentar/diminuir
                    volume
                  </li>
                  <li>
                    <strong>Tab:</strong> Navegar entre elementos interativos
                  </li>
                  <li>
                    <strong>Enter:</strong> Ativar botões e links
                  </li>
                  <li>
                    <strong>Esc:</strong> Fechar modais e menus
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-medium mb-3 mt-6">
                8.2 Navegação por Regiões
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A plataforma está estruturada em regiões claras que podem ser
                navegadas rapidamente com leitores de tela:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>
                  <strong>Cabeçalho:</strong> Logo, navegação principal e
                  controles de usuário
                </li>
                <li>
                  <strong>Conteúdo principal:</strong> Lista de episódios,
                  player de áudio, detalhes
                </li>
                <li>
                  <strong>Barra lateral:</strong> Filtros, categorias e
                  navegação secundária
                </li>
                <li>
                  <strong>Rodapé:</strong> Links institucionais e informações de
                  contato
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                9. Feedback e Suporte
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Valorizamos muito o feedback de nossos usuários sobre
                acessibilidade. Se você encontrar barreiras de acessibilidade ou
                tiver sugestões de melhoria, entre em contato conosco:
              </p>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">
                  E-mail específico para questões de acessibilidade:
                </p>
                <p className="text-primary">acessibilidade@trylle.com</p>
                <p className="font-medium mt-2">E-mail geral de suporte:</p>
                <p className="text-primary">suporte@trylle.com</p>
              </div>

              <p className="text-muted-foreground leading-relaxed mt-4">
                Ao entrar em contato, por favor inclua:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Descrição detalhada do problema encontrado</li>
                <li>
                  Tecnologia assistiva que você está utilizando (se aplicável)
                </li>
                <li>Navegador e sistema operacional</li>
                <li>Passos para reproduzir o problema</li>
                <li>Sugestões de melhoria (se houver)</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mt-4">
                Nos comprometemos a responder todas as questões de
                acessibilidade em até 48 horas úteis e a trabalhar para resolver
                os problemas identificados o mais rapidamente possível.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                10. Recursos Externos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Para mais informações sobre acessibilidade digital e tecnologias
                assistivas, recomendamos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>
                  <strong>W3C Web Accessibility Initiative (WAI):</strong>{" "}
                  Diretrizes e recursos sobre acessibilidade web
                </li>
                <li>
                  <strong>Governo Federal - Acessibilidade:</strong> Informações
                  sobre legislação brasileira
                </li>
                <li>
                  <strong>NVDA:</strong> Leitor de tela gratuito e de código
                  aberto
                </li>
                <li>
                  <strong>WebAIM:</strong> Recursos e ferramentas para teste de
                  acessibilidade
                </li>
              </ul>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Última atualização:</strong>{" "}
                {new Date().toLocaleDateString("pt-BR")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Esta política de acessibilidade é revisada e atualizada
                regularmente para refletir melhorias em nossos serviços e
                mudanças nas diretrizes de acessibilidade.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
