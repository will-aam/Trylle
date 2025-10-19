import { Navbar } from "@/src/components/layout/navbar";
import { Footer } from "@/src/components/layout/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-8 text-balance">
            Política de Privacidade
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Trylle é uma plataforma de aprendizado em áudio que oferece
                podcasts curtos, focados e sem anúncios. Esta Política de
                Privacidade explica como coletamos, usamos, armazenamos e
                protegemos suas informações pessoais quando você utiliza nossos
                serviços.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ao utilizar a Trylle, você concorda com as práticas descritas
                nesta política. Recomendamos que leia este documento com
                atenção.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Dados que Coletamos
              </h2>

              <h3 className="text-xl font-medium mb-3">
                2.1 Dados de Cadastro
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Senha (armazenada de forma criptografada)</li>
                <li>
                  Informações do perfil do Google (quando utilizar &quot;Entrar
                  com Google&quot;)
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">
                2.2 Dados de Uso
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Playlists criadas por você</li>
                <li>Episódios marcados como favoritos</li>
                <li>Histórico de reprodução</li>
                <li>Tempo de escuta e progresso nos episódios</li>
                <li>Preferências de conteúdo</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">
                2.3 Dados Automáticos
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Endereço IP</li>
                <li>Tipo e versão do navegador</li>
                <li>Sistema operacional</li>
                <li>Cookies essenciais para funcionamento da plataforma</li>
                <li>Dados de analytics (quando aplicável)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Como Usamos Seus Dados
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Fornecer o serviço:</strong> Permitir acesso ao
                  catálogo de episódios e funcionalidades da plataforma
                </li>
                <li>
                  <strong>Personalizar a experiência:</strong> Recomendar
                  conteúdo baseado em seus interesses e histórico
                </li>
                <li>
                  <strong>Comunicação:</strong> Enviar atualizações sobre novos
                  episódios, recursos e informações importantes
                </li>
                <li>
                  <strong>Melhorias:</strong> Analisar o uso da plataforma para
                  implementar melhorias e novos recursos
                </li>
                <li>
                  <strong>Segurança:</strong> Proteger sua conta e prevenir
                  atividades fraudulentas
                </li>
                <li>
                  <strong>Suporte:</strong> Responder suas dúvidas e
                  solicitações de ajuda
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Compartilhamento de Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>
                  Não vendemos seus dados pessoais para terceiros.
                </strong>{" "}
                Compartilhamos informações apenas com:
              </p>

              <h3 className="text-xl font-medium mb-3">
                4.1 Prestadores de Serviços Essenciais
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Supabase:</strong> Para autenticação de usuários e
                  armazenamento seguro de dados
                </li>
                <li>
                  <strong>Vercel:</strong> Para hospedagem e entrega da
                  plataforma
                </li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mt-4">
                Todos os prestadores de serviços são cuidadosamente selecionados
                e comprometidos com a proteção de dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cookies</h2>

              <h3 className="text-xl font-medium mb-3">
                5.1 Cookies Essenciais
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies essenciais para manter você logado e garantir
                o funcionamento adequado da plataforma. Estes cookies são
                necessários e não podem ser desabilitados.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-4">
                5.2 Cookies de Analytics
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Podemos utilizar cookies de analytics (como Google Analytics)
                para entender como os usuários interagem com a plataforma e
                melhorar nossos serviços. Você pode optar por não participar
                através das configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Segurança dos Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas e organizacionais apropriadas
                para proteger suas informações pessoais contra acesso não
                autorizado, alteração, divulgação ou destruição. Isso inclui:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Criptografia de senhas e dados sensíveis</li>
                <li>Conexões seguras (HTTPS)</li>
                <li>Controle de acesso restrito aos dados</li>
                <li>Monitoramento regular de segurança</li>
                <li>Backups seguros e regulares</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Seus Direitos (LGPD)
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem
                os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Acesso:</strong> Solicitar informações sobre quais
                  dados pessoais processamos
                </li>
                <li>
                  <strong>Correção:</strong> Solicitar a correção de dados
                  incompletos, inexatos ou desatualizados
                </li>
                <li>
                  <strong>Exclusão:</strong> Solicitar a exclusão de seus dados
                  pessoais
                </li>
                <li>
                  <strong>Portabilidade:</strong> Solicitar a transferência de
                  seus dados para outro fornecedor
                </li>
                <li>
                  <strong>Oposição:</strong> Opor-se ao processamento de seus
                  dados em certas circunstâncias
                </li>
                <li>
                  <strong>Revogação do consentimento:</strong> Retirar seu
                  consentimento a qualquer momento
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Para exercer qualquer um destes direitos, entre em contato
                conosco através do e-mail:
                <strong> privacidade@trylle.com</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Alterações nesta Política
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente
                para refletir mudanças em nossos serviços ou na legislação
                aplicável. Notificaremos você sobre alterações significativas
                através do e-mail cadastrado ou por meio de aviso na plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver dúvidas sobre esta Política de Privacidade ou
                sobre como tratamos seus dados pessoais, entre em contato
                conosco:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">
                  E-mail para questões de privacidade:
                </p>
                <p className="text-primary">privacidade@trylle.com</p>
                <p className="font-medium mt-2">E-mail geral:</p>
                <p className="text-primary">contato@trylle.com</p>
              </div>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Última atualização:</strong>{" "}
                {new Date().toLocaleDateString("pt-BR")}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
