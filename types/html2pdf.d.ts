declare module "html2pdf.js" {
  export interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: object;
    jsPDF?: object;
  }

  export default function (
    element: HTMLElement,
    options?: Html2PdfOptions
  ): {
    from: (element: HTMLElement) => any;
    set: (options: Html2PdfOptions) => any;
    save: (filename?: string) => Promise<void>;
  };
}
