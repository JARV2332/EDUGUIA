import type { jsPDF } from "jspdf";

/** Dispara la descarga del PDF en el navegador (compatible tras generación síncrona). */
export function triggerBrowserPdfDownload(doc: jsPDF, filename: string): void {
  const safeFilename = filename.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_");
  const name = safeFilename.endsWith(".pdf") ? safeFilename : `${safeFilename}.pdf`;

  try {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch {
    doc.save(name);
  }
}
