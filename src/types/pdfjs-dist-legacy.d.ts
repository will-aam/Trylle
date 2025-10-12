// Shim de tipos para o build legacy do pdfjs-dist (não exporta .d.ts)
declare module "pdfjs-dist/legacy/build/pdf" {
  const pdfjs: any;
  export = pdfjs;
  export default pdfjs;
}
