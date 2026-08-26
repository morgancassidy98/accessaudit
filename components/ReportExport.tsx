'use client';

import { useState } from 'react';
import type { Criterion } from '@/lib/wcag-criteria';

type Failure = {
  criterion: Criterion;
  result: {
    status: string;
    severity: string | null;
    notes: string;
  };
};

type ReportPage = {
  id: string;
  title: string;
  url: string;
  lighthouseScore: number | null;
  failures: Failure[];
  stats: {
    passed: number;
    failed: number;
    na: number;
    tested: number;
    passRate: number;
    progress: number;
  };
};

type OverallStats = {
  totalPassed: number;
  totalFailed: number;
  totalNa: number;
  totalTested: number;
  totalCriteria: number;
  overallProgress: number;
  overallPassRate: number;
};

export function ReportExport({
  audit,
  pages,
  overallStats,
}: {
  audit: { id: string; name: string; url: string; createdAt: Date };
  pages: ReportPage[];
  overallStats: OverallStats;
}) {
  const [isExporting, setIsExporting] = useState(false);

const handleExport = async () => {
  setIsExporting(true);
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageWidth  = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin     = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (needed: number) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const setStyle = (
      size: number,
      color: [number, number, number],
      bold = false
    ) => {
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
    };

    // ── Cover ──
    doc.setFillColor(26, 46, 61);
    doc.rect(0, 0, pageWidth, 56, 'F');

    setStyle(22, [255, 255, 255], true);
    doc.text('Accessibility Audit Report', margin, 22);

    setStyle(11, [255, 255, 255], true);
    doc.text(audit.name, margin, 32);

    setStyle(10, [210, 228, 242]);
    doc.text(audit.url, margin, 40);

    setStyle(9, [160, 195, 220]);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 50);

    y = 68;

    // ── Overall Summary ──
    setStyle(15, [45, 93, 123], true);
    doc.text('Overall Summary', margin, y);
    y += 2;

    doc.setDrawColor(45, 93, 123);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 1, margin + contentWidth, y + 1);
    y += 6;

    const summaryItems: [string, string][] = [
      ['Pages Audited',     pages.length.toString()],
      ['Criteria Tested',   `${overallStats.totalTested} / ${overallStats.totalCriteria}`],
      ['Passed',            overallStats.totalPassed.toString()],
      ['Failed',            overallStats.totalFailed.toString()],
      ['Not Applicable',    overallStats.totalNa.toString()],
      ['Overall Pass Rate', overallStats.overallPassRate > 0 ? `${overallStats.overallPassRate}%` : 'N/A'],
    ];

    summaryItems.forEach(([label, value]) => {
      checkPageBreak(7);
      setStyle(10, [100, 100, 100]);
      doc.text(label, margin, y);
      setStyle(10, [26, 26, 46], true);
      doc.text(value, margin + 52, y);
      y += 6.5;
    });

    y += 8;

    // ── Per Page Results ──
    pages.forEach((page) => {
      checkPageBreak(28);

      // Page header bar
      doc.setFillColor(232, 241, 247);
      doc.rect(margin, y - 5, contentWidth, 16, 'F');

      setStyle(12, [26, 26, 46], true);
      doc.text(page.title, margin + 3, y + 4);

      const statsText = `Pass Rate: ${page.stats.passRate}%  |  Failures: ${page.stats.failed}`;
      setStyle(9, [85, 85, 85]);
      const statsWidth = doc.getTextWidth(statsText);
      doc.text(statsText, margin + contentWidth - statsWidth - 2, y + 4);

      y += 14;

      // URL with breathing room
      setStyle(9, [100, 100, 100]);
      doc.text(page.url, margin + 3, y);
      y += 10;

      // Divider
      doc.setDrawColor(210, 220, 230);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 2, margin + contentWidth, y - 2);

      if (page.failures.length === 0) {
        checkPageBreak(8);
        setStyle(10, [45, 122, 42]);
        doc.text('No failures recorded for this page', margin + 3, y + 4);
        y += 12;
      } else {
        page.failures.forEach((failure, i) => {
          checkPageBreak(18);

          setStyle(10, [76, 6, 29], true);
          doc.text(
            `${failure.criterion.id} — ${failure.criterion.title}`,
            margin + 3,
            y + 4
          );
          y += 8;

          if (failure.result.severity) {
            setStyle(9, [100, 100, 100]);
            doc.text(`Severity: ${failure.result.severity}`, margin + 6, y);
            y += 5;
          }

          if (failure.result.notes) {
            checkPageBreak(10);
            setStyle(9, [60, 60, 60]);
            const lines = doc.splitTextToSize(
              `Notes: ${failure.result.notes}`,
              contentWidth - 6
            );
            doc.text(lines, margin + 6, y);
            y += lines.length * 4.5 + 2;
          }

          y += i < page.failures.length - 1 ? 4 : 2;
        });
      }

      y += 10;
    });

    // ── Footer ──
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 210, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
      setStyle(8, [150, 150, 150]);
      doc.text(
        `Audit Ally — WCAG Accessibility Report — ${audit.name}`,
        margin,
        pageHeight - 8
      );
      const pageNumText = `Page ${i} of ${totalPages}`;
      const pageNumWidth = doc.getTextWidth(pageNumText);
      doc.text(pageNumText, pageWidth - margin - pageNumWidth, pageHeight - 8);
    }

    doc.save(`${audit.name.replace(/\s+/g, '-')}-accessibility-report.pdf`);
  } catch (err) {
    console.error('Export failed:', err);
  } finally {
    setIsExporting(false);
  }
};

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/share/${audit.id}`;
    await navigator.clipboard.writeText(url);
    alert(`Share link copied:\n${url}`);
  };

  return (
    <div className="flex gap-3">
      <button
        className="btn btn-outline"
        onClick={handleCopyLink}
      >
        Copy Share Link
      </button>
      <button
        className="btn btn-primary"
        onClick={handleExport}
        disabled={isExporting}
        aria-busy={isExporting}
      >
        {isExporting ? 'Exporting…' : 'Export PDF'}
      </button>
    </div>
  );
}