import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ResumeParser {
  private readonly logger = new Logger(ResumeParser.name);

  async parsePdfToText(buffer: Buffer): Promise<string> {
    try {
      // 1. Dynamic Import (Versi pdfjs-dist 3.11.174)
      // Menggunakan build 'legacy' agar kompatibel dengan Node.js
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
      const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.js');

      // 2. Set Worker Source
      // Ini wajib untuk menghindari warning/error di Node environment
      pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

      // 3. Konversi Buffer Node.js ke Uint8Array
      const data = new Uint8Array(buffer);

      // 4. Load Document
      const loadingTask = pdfjs.getDocument({
        data,
        // Disable font face agar lebih cepat (kita cuma butuh teks)
        disableFontFace: true,
      });

      const doc = await loadingTask.promise;
      let fullText = '';

      // 5. Loop setiap halaman
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();

        // Gabungkan item teks per halaman
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        // Tambahkan newline antar halaman agar rapi
        fullText += pageText + '\n';
      }

      this.logger.log(
        `Successfully parsed PDF. Pages: ${doc.numPages}, Length: ${fullText.length} chars.`,
      );
      return fullText;
    } catch (error) {
      this.logger.error(`Failed to parse PDF: ${error.message}`, error.stack);
      throw new Error('Gagal mengekstrak teks dari file PDF.');
    }
  }
}
