import { Navbar } from "@/src/components/layout/navbar";
import { Footer } from "@/src/components/layout/footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-8 text-balance">
            Termos de Serviço
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao se cadastrar e utilizar a plataforma Trylle, você concorda em
                cumprir e estar vinculado a estes Termos de Serviço. Se você não
                concorda com qualquer parte destes termos, não deve utilizar
                nossos serviços.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Estes termos constituem um acordo legal entre você e a Trylle, e
                são aplicáveis a todos os usuários da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Descrição do Serviço
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Trylle é uma plataforma de assinatura que oferece:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>
                  Acesso a um catálogo de podcasts curtos, focados e sem
                  anúncios
                </li>
                <li>
                  Documentos de apoio em PDF com as fontes de pesquisa de cada
                  episódio
                </li>
                <li>
                  Funcionalidades de personalização como playlists e favoritos
                </li>
                <li>
                  Histórico de reprodução e sincronização entre dispositivos
                </li>
                <li>
                  Recomendações personalizadas baseadas em seus interesses
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                O serviço é destinado a estudantes, profissionais ocupados e
                entusiastas do aprendizado contínuo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Uso da Conta</h2>

              <h3 className="text-xl font-medium mb-3">
                3.1 Responsabilidades do Usuário
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Manter a confidencialidade de sua senha e informações de login
                </li>
                <li>
                  Notificar imediatamente sobre qualquer uso não autorizado de
                  sua conta
                </li>
                <li>
                  Fornecer informações precisas e atualizadas durante o cadastro
                </li>
                <li>
                  Ser responsável por todas as atividades que ocorrem em sua
                  conta
                </li>
                <li>Não compartilhar sua conta com terceiros</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">
                3.2 Elegibilidade
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Você deve ter pelo menos 18 anos de idade para criar uma conta
                na Trylle. Menores de 18 anos podem utilizar o serviço apenas
                com supervisão e consentimento dos pais ou responsáveis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Assinaturas e Pagamentos
              </h2>

              <h3 className="text-xl font-medium mb-3">
                4.1 Período de Teste Gratuito
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Oferecemos um período de teste gratuito para novos usuários.
                Durante este período, você terá acesso completo aos recursos da
                plataforma sem cobrança.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">
                4.2 Assinatura Paga
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Após o período de teste, a assinatura será cobrada mensalmente
                  no valor de R$ 9,90
                </li>
                <li>
                  O pagamento é processado automaticamente no mesmo dia de cada
                  mês
                </li>
                <li>Você será notificado antes de qualquer cobrança</li>
                <li>
                  Os preços podem ser alterados mediante aviso prévio de 30 dias
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">
                4.3 Cancelamento
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Você pode cancelar sua assinatura a qualquer momento através das
                configurações da sua conta. O cancelamento será efetivo no final
                do período de cobrança atual, e você manterá acesso aos
                conteúdos até essa data.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Após o cancelamento, você perderá acesso ao conteúdo premium,
                mas seus dados pessoais e preferências serão mantidos caso
                deseje reativar a assinatura no futuro.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Propriedade Intelectual
              </h2>

              <h3 className="text-xl font-medium mb-3">
                5.1 Conteúdo da Trylle
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo disponível na plataforma, incluindo mas não
                limitado a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Episódios de áudio e podcasts</li>
                <li>Documentos PDF e materiais de apoio</li>
                <li>Textos, imagens e elementos visuais</li>
                <li>Marca Trylle e identidade visual</li>
                <li>Software e código da plataforma</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                São de propriedade exclusiva da Trylle ou licenciados por
                terceiros. Todos os direitos são reservados.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">
                5.2 Licença de Uso
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Concedemos a você uma licença limitada, não exclusiva e não
                transferível para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>
                  Acessar e utilizar o conteúdo para fins pessoais e não
                  comerciais
                </li>
                <li>
                  Fazer download de episódios para escuta offline (quando
                  disponível)
                </li>
                <li>Compartilhar links para episódios específicos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Conduta do Usuário
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ao utilizar a Trylle, você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Redistribuir, vender ou comercializar qualquer conteúdo da
                  plataforma
                </li>
                <li>
                  Fazer engenharia reversa, descompilar ou tentar extrair o
                  código-fonte
                </li>
                <li>
                  Utilizar bots, scripts ou ferramentas automatizadas para
                  acessar o serviço
                </li>
                <li>
                  Tentar contornar medidas de segurança ou controle de acesso
                </li>
                <li>Interferir no funcionamento normal da plataforma</li>
                <li>Criar múltiplas contas para contornar limitações</li>
                <li>Compartilhar credenciais de acesso com terceiros</li>
                <li>
                  Utilizar o serviço para atividades ilegais ou não autorizadas
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Limitação de Responsabilidade
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Trylle fornece o serviço &quot;como está&quot; e não garante
                que:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>O serviço será ininterrupto ou livre de erros</li>
                <li>Todos os conteúdos estarão sempre disponíveis</li>
                <li>
                  O serviço atenderá a todas as suas expectativas específicas
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Nossa responsabilidade é limitada ao valor pago pela assinatura
                no período em que ocorreu o problema. Não seremos responsáveis
                por danos indiretos, incidentais ou consequenciais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Suspensão e Encerramento
              </h2>

              <h3 className="text-xl font-medium mb-3">
                8.1 Suspensão pela Trylle
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Podemos suspender ou encerrar sua conta nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Violação destes Termos de Serviço</li>
                <li>Atividade fraudulenta ou suspeita</li>
                <li>Falta de pagamento da assinatura</li>
                <li>Uso inadequado que prejudique outros usuários</li>
                <li>Solicitação de autoridades competentes</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">
                8.2 Encerramento pelo Usuário
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Você pode encerrar sua conta a qualquer momento através das
                configurações da plataforma ou entrando em contato com nosso
                suporte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                9. Alterações nos Termos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos modificar estes Termos de Serviço periodicamente.
                Alterações significativas serão comunicadas com pelo menos 30
                dias de antecedência através do e-mail cadastrado ou por meio de
                aviso na plataforma.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                O uso continuado da plataforma após as alterações constitui
                aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Lei Aplicável</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos de Serviço são regidos pelas leis brasileiras.
                Qualquer disputa será resolvida nos tribunais competentes do
                Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para dúvidas sobre estes Termos de Serviço ou questões
                relacionadas ao suporte, entre em contato:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">E-mail de suporte:</p>
                <p className="text-primary">suporte@trylle.com</p>
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
