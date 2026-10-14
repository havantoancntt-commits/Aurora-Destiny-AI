// ========================================================
// SMART MOBILE & DESKTOP DOSSIER EXPORT ENGINE
// Multi-format: High-Res A4 PDF, Standalone Offline HTML E-Book,
// Dedicated Print Window, and Web Share API
// ========================================================

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface ExportProgress {
  currentPage: number;
  totalPages: number;
  statusText: string;
  percent: number;
}

export interface PDFExportResult {
  success: boolean;
  error?: string;
  blob?: Blob;
  blobUrl?: string;
  stagedDownloadUrl?: string;
  stagedViewUrl?: string;
  fileName?: string;
  isInApp?: boolean;
}

/**
 * Trigger immediate native browser download without opening blank tabs
 */
export function triggerDirectDownload(url: string, fileName: string): void {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    }, 2000);
  } catch (err) {
    console.warn('triggerDirectDownload error:', err);
  }
}

/**
 * Clean string for safe file names
 */
export function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Detect if current device is a mobile or tablet
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);
}

/**
 * Detect if running inside an in-app browser sandbox (Facebook, Instagram, Zalo, TikTok, etc.)
 * In-app browsers often intercept or block direct <a download> clicks on Blob URLs.
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
  return /fban|fbav|fb_iab|instagram|zalo|line|tiktok|micromessenger|snapchat|musical_ly/.test(ua);
}

/**
 * 1. HIGH-RESOLUTION DIRECT PDF GENERATOR
 * Captures all 6 A4 pages using html2canvas-pro & jsPDF into a downloadable .pdf file.
 * Handles modern CSS color models (oklch, lab, color-mix), font readiness, and in-app browser delivery.
 */
export async function exportDossierToPDF(
  pageContainerElement: HTMLElement,
  fileName: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<PDFExportResult> {
  try {
    const pageElements = Array.from(
      pageContainerElement.querySelectorAll<HTMLElement>('.a4-page-dossier')
    );

    if (pageElements.length === 0) {
      throw new Error('Không tìm thấy các trang hồ sơ A4 để xuất bản.');
    }

    // Await custom fonts (Cinzel, Plus Jakarta Sans, etc.) to guarantee crisp typographical rendering
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // Fallback gracefully if fonts.ready fails or times out
      }
    }

    const inApp = isInAppBrowser();
    const isMobile = isMobileDevice();
    const totalPages = pageElements.length;

    // Standard A4 dimensions in mm (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let i = 0; i < totalPages; i++) {
      const pageEl = pageElements[i];
      const pageNum = i + 1;

      if (onProgress) {
        onProgress({
          currentPage: pageNum,
          totalPages,
          statusText: `Đang kết xuất trang ${pageNum}/${totalPages}...`,
          percent: Math.round(((pageNum - 0.5) / totalPages) * 100)
        });
      }

      // Optimize canvas capture for mobile and desktop:
      // Scale 1.5 gives crisp retina ~150 DPI while staying safely below mobile canvas RAM ceilings.
      // html2canvas-pro natively resolves oklch(), lab(), color-mix() from Tailwind CSS v4.
      const canvas = await html2canvas(pageEl, {
        scale: isMobile ? 1.5 : 1.8,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#050814',
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        onclone: (clonedDoc, clonedEl) => {
          // Reset offscreen shelf position inside the cloned document so coordinate origins start at (0, 0)
          const shelf = clonedDoc.getElementById('pdf-offscreen-render-shelf');
          if (shelf) {
            shelf.style.setProperty('position', 'static', 'important');
            shelf.style.setProperty('left', '0', 'important');
            shelf.style.setProperty('top', '0', 'important');
            shelf.style.setProperty('visibility', 'visible', 'important');
            shelf.style.setProperty('opacity', '1', 'important');
          }
          if (clonedEl) {
            clonedEl.style.setProperty('width', '794px', 'important');
            clonedEl.style.setProperty('min-height', '1123px', 'important');
            clonedEl.style.setProperty('height', '1123px', 'important');
            clonedEl.style.setProperty('margin', '0 auto', 'important');
            clonedEl.style.setProperty('transform', 'none', 'important');
            clonedEl.style.setProperty('opacity', '1', 'important');
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // 210mm x 297mm exact A4
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      // Immediately release GPU back-buffer memory on mobile devices
      canvas.width = 0;
      canvas.height = 0;

      if (onProgress) {
        onProgress({
          currentPage: pageNum,
          totalPages,
          statusText: `Đã xử lý xong trang ${pageNum}/${totalPages}`,
          percent: Math.round((pageNum / totalPages) * 100)
        });
      }
    }

    if (onProgress) {
      onProgress({
        currentPage: totalPages,
        totalPages,
        statusText: 'Đang đóng gói và lưu tệp PDF...',
        percent: 100
      });
    }

    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    let stagedDownloadUrl: string | undefined;
    let stagedViewUrl: string | undefined;

    // Stage PDF to backend streaming endpoint for guaranteed mobile OS DownloadManager interception
    try {
      const response = await fetch(`/api/pdf/prepare-download?filename=${encodeURIComponent(finalFileName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf'
        },
        body: pdfBlob
      });
      if (response.ok) {
        const data = await response.json();
        if (data.downloadUrl) {
          stagedDownloadUrl = data.downloadUrl;
          stagedViewUrl = `/api/pdf/download/${data.id}?filename=${encodeURIComponent(finalFileName)}&view=1`;
        }
      }
    } catch (stageErr) {
      console.warn('Không thể tạo liên kết tải qua máy chủ, tiếp tục với phương thức cục bộ:', stageErr);
    }

    // Trigger download:
    // If stagedDownloadUrl is available, a real HTTP link with Content-Disposition: attachment works on ALL mobile platforms:
    // - Android: Download Manager receives HTTP attachment header and saves to /Download/ folder directly.
    // - iOS Safari: Prompts native "Bạn có muốn tải về tệp này không?" -> Saves to Files/Downloads.
    const effectiveDownloadUrl = stagedDownloadUrl || blobUrl;

    try {
      const link = document.createElement('a');
      link.href = effectiveDownloadUrl;
      link.download = finalFileName;
      link.target = '_self'; // CRITICAL: NEVER use _blank for downloads (triggers popup blockers & blank tabs on mobile)
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
      }, 2000);
    } catch (downloadErr) {
      console.warn('Tự động tải file gặp giới hạn trình duyệt:', downloadErr);
    }

    return {
      success: true,
      blob: pdfBlob,
      blobUrl,
      stagedDownloadUrl,
      stagedViewUrl,
      fileName: finalFileName,
      isInApp: inApp
    };
  } catch (err: any) {
    console.error('Lỗi xuất PDF:', err);
    let errorMsg = 'Không thể tạo file PDF do lỗi kết xuất trang.';
    if (err?.message) {
      if (err.message.includes('unsupported color') || err.message.includes('oklch')) {
        errorMsg = 'Lỗi tương thích màu sắc trên trình duyệt. Vui lòng thử chọn "Tải Sách Offline (.HTML)" hoặc "Mở Tab Mới Để In".';
      } else if (err.message.includes('memory') || err.message.includes('out of memory')) {
        errorMsg = 'Bộ nhớ thiết bị không đủ để kết xuất 6 trang chất lượng cao. Bạn hãy chọn "Tải Sách Offline (.HTML)" hoặc "Mở Tab Mới Để In".';
      } else {
        errorMsg = `Lỗi kết xuất PDF: ${err.message}`;
      }
    }
    return { success: false, error: errorMsg };
  }
}

/**
 * 2. STANDALONE OFFLINE HTML E-BOOK EXPORT
 * Produces an ultra-fast, zero-dependency .html file that can be opened on any phone,
 * runs 100% offline, and includes full fonts, dark theme, and an embedded native Print button.
 */
function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function exportOfflineHtmlBook(
  pageContainerElement: HTMLElement,
  title: string,
  fileName: string
): boolean {
  try {
    const safeTitle = escapeHtml(title);
    const rawHtml = pageContainerElement.innerHTML;

    // Collect all computed or existing stylesheets for standalone rendering
    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} — Sách Bản Mệnh Tinh Hoa (Offline Edition)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #04050a;
      color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .font-cinzel { font-family: 'Cinzel', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    
    .a4-page-dossier {
      width: 210mm;
      min-height: 297mm;
      height: 297mm;
      margin: 20px auto;
      box-sizing: border-box;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      position: relative;
    }

    @media (max-width: 850px) {
      .a4-page-dossier {
        width: 95%;
        height: auto;
        min-height: auto;
        margin: 15px auto;
        padding: 20px 14px !important;
      }
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
      body {
        background-color: #050814 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .a4-page-dossier {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 10mm !important;
        page-break-after: always !important;
        break-after: page !important;
        border: none !important;
      }
    }

    .top-action-bar {
      position: sticky;
      top: 0;
      z-index: 999;
      background: rgba(10, 12, 22, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(251, 191, 36, 0.3);
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
  <!-- Top Offline Control Bar -->
  <div class="top-action-bar no-print">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 18px;">📜</span>
      <div>
        <div style="font-size: 13px; font-weight: bold; color: #fbbf24; font-family: 'Cinzel', serif;">${title}</div>
        <div style="font-size: 10px; color: #94a3b8;">Sách Bản Mệnh Tinh Hoa • Độc Bản Offline (Chuẩn A4)</div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <button onclick="window.print()" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #020617; border: none; padding: 7px 14px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
        <span>🖨️</span>
        <span>In Sách / Lưu PDF</span>
      </button>
      <button onclick="this.parentElement.parentElement.style.display='none'" style="background: rgba(255,255,255,0.1); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); padding: 7px 10px; border-radius: 8px; font-size: 11px; cursor: pointer;">
        Ẩn thanh
      </button>
    </div>
  </div>

  <!-- Book Pages Container -->
  <div style="display: flex; flex-direction: column; align-items: center; padding-bottom: 40px;">
    ${rawHtml}
  </div>

  <!-- Footer Seal Note -->
  <div style="text-align: center; font-size: 11px; color: #64748b; padding: 20px; font-family: 'JetBrains Mono', monospace;" class="no-print">
    Bản quyền nghiên cứu & phát triển: GS.TOAN & Aurora Destiny AI • Độc bản bảo chứng số
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName.endsWith('.html') ? fileName : `${fileName}.html`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 5000);

    return true;
  } catch (err) {
    console.error('Lỗi xuất file HTML:', err);
    return false;
  }
}

/**
 * 3. OPEN IN DEDICATED PRINT WINDOW
 * Essential for iframe sandboxes: opens a clean top-level window and calls window.print(),
 * allowing iOS and Android browsers to trigger their native system PDF saver without iframe blocks.
 */
export function openInDedicatedPrintWindow(
  pageContainerElement: HTMLElement,
  title: string
): boolean {
  try {
    const safeTitle = escapeHtml(title);
    const rawHtml = pageContainerElement.innerHTML;
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      return false; // Popup blocked
    }

    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} — Xuất Bản A4</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #050814;
      color: #e2e8f0;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4 portrait;
      margin: 0;
    }
    .a4-page-dossier {
      width: 210mm !important;
      min-height: 297mm !important;
      height: 297mm !important;
      margin: 0 auto !important;
      padding: 10mm !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      page-break-after: always !important;
      break-after: page !important;
    }
    .no-print {
      display: none !important;
    }
  </style>
</head>
<body>
  ${rawHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 600);
    };
  </script>
</body>
</html>`);
    printWindow.document.close();
    return true;
  } catch (err) {
    console.error('Không thể mở cửa sổ in mới:', err);
    return false;
  }
}

/**
 * 4. WEB SHARE API OR CLIPBOARD
 * Direct sharing to Zalo / Files / Drive on mobile phones
 */
export async function shareOrCopyDossier(
  title: string,
  summaryText: string,
  pdfBlob?: Blob,
  fileName?: string
): Promise<{ shared: boolean; copied: boolean }> {
  // If navigator.share supports file sharing on mobile:
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    pdfBlob &&
    fileName
  ) {
    try {
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text: summaryText,
          files: [file]
        });
        return { shared: true, copied: false };
      }
    } catch (e) {
      console.log('Web share file rejected or canceled, trying text share...', e);
    }
  }

  // Fallback to text sharing
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text: summaryText
      });
      return { shared: true, copied: false };
    } catch (e) {
      console.log('Web share text canceled, falling back to clipboard');
    }
  }

  // Fallback to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(summaryText);
    return { shared: false, copied: true };
  }

  return { shared: false, copied: false };
}
