import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { FileText, Download, ExternalLink, Shield, Zap } from "lucide-react"

export function PdfInfoSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Muito mais que só podcasts</h2>
            <p className="text-xl text-muted-foreground">Conteúdo confiável com documentação completa</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Features */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Confiança nas informações</h3>
                    <p className="text-muted-foreground">
                      Todo conteúdo é baseado em fontes confiáveis e pesquisas científicas, garantindo a qualidade das
                      informações.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Documentos de apoio em PDF</h3>
                    <p className="text-muted-foreground">
                      Baixe o documento completo usado na produção do episódio, com resumos elaborados e referências
                      organizadas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Links das fontes incluídos</h3>
                    <p className="text-muted-foreground">
                      Acesse diretamente todas as fontes utilizadas através de links organizados no documento PDF.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Arquivo leve e compacto</h3>
                    <p className="text-muted-foreground">
                      PDFs otimizados para download rápido e fácil armazenamento, sem comprometer a qualidade do
                      conteúdo.
                    </p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="gap-2">
                <Download className="w-5 h-5" />
                Explorar
              </Button>
            </div>

            {/* Right Column - Visual Card */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-xl border-primary/20">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                      <FileText className="w-10 h-10 text-primary" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold">Documento de Apoio</h3>
                      <p className="text-sm text-muted-foreground">Ep. 1 - Biotipo e Nutrição</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Páginas:</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tamanho:</span>
                        <span className="font-medium">2.3 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fontes:</span>
                        <span className="font-medium">15 referências</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Baixar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
