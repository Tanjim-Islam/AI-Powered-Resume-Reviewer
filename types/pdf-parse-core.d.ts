declare module "pdf-parse/lib/pdf-parse.js" {
  const pdfParse: (data: Buffer) => Promise<{ text?: string } | string>;
  export default pdfParse;
  export const pdf: typeof pdfParse;
}
