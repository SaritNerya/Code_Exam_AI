/**
 * Helper to process images and multi-page PDF documents into base64 data URLs
 */

export async function processFileToImages(file: File): Promise<string[]> {
  if (file.type.startsWith("image/")) {
    return [await readFileAsDataUrl(file)];
  }

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    try {
      // Dynamic import of pdfjs-dist
      const pdfjsLib = await import("pdfjs-dist");
      
      // Set worker source to CDN or local fallback
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.10.38"}/pdf.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const pages: string[] = [];

      // Render each page to an image canvas
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.8 }); // sharp resolution for OCR
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (ctx) {
          // @ts-ignore
          await page.render({ canvasContext: ctx, viewport }).promise;
          pages.push(canvas.toDataURL("image/jpeg", 0.9));
        }
      }

      if (pages.length > 0) {
        return pages;
      }
    } catch (err) {
      console.warn("PDF extraction error, falling back to direct base64 data:", err);
    }

    // Fallback: direct base64 of the PDF file
    return [await readFileAsDataUrl(file)];
  }

  throw new Error("פורמט קובץ לא נתמך. אנא העלה קובץ תמונה (PNG, JPG, WEBP) או PDF.");
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
