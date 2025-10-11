import { Instagram, Mail, Github, AudioLines } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Informações da Empresa */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span>
                  <AudioLines className="w-5 h-5" />
                </span>
              </div>
              <span className="font-bold text-lg">Trylle</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conhecimento em áudio para quem não tem tempo a perder!
              Transformamos pesquisa em aprendizado para mentes curiosas e vidas
              ocupadas.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/will-aam"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="sr-only">Github</span>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Links Rápidos</h3>
            <ul className="space-y-2">
              {/* <li>
                <a
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Explorar Podcasts
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Categorias
                </a>
              </li>
              <li>
                <a
                  href="/signup"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cadastre-se
                </a>
              </li>
              <li>
                <a
                  href="/premium"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Premium
                </a>
              </li> */}
              <li>
                <a
                  href="/technologies"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Tecnologias
                </a>
              </li>
              <li>
                <a
                  href="/suggest-topic"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sugerir Tema
                </a>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/help"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </a>
              </li>
              <li>
                <a
                  href="/community"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Comunidade
                </a>
              </li>
              <li>
                <a
                  href="/feedback"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Feedback
                </a>
              </li>
              {/* <li>
                <a
                  href="/status"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Status do Sistema
                </a>
              </li> */}
            </ul>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  contato@trylle.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Inferior: Direitos Autorais e Links Legais */}
        <div className="border-t border-border mt-8 pt-8 lg:mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Trylle. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
              <a
                href="/privacy-policy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Política de Privacidade
              </a>
              <a
                href="/terms-of-service"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Termos de Serviço
              </a>
              <a
                href="/accessibility"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Acessibilidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
