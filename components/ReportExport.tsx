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

      const addText = (
        text: string,
        x: number,
        fontSize: number,
        color: [number, number, number] = [26, 26, 46],
        bold = false,
        maxWidth?: number
      ) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        if (maxWidth) {
          const lines = doc.splitTextToSize(text, maxWidth);
          doc.text(lines, x, y);
          return lines.length;
        }
        doc.text(text, x, y);
        return 1;
      };

      // ── Cover ──
      doc.setFillColor(26, 46, 61);
      doc.rect(0, 0, pageWidth, 60, 'F');

      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Accessibility Audit Report', margin, 28);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 220, 235);
      doc.text(audit.name, margin, 38);
      doc.text(audit.url, margin, 46);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 54);

      y = 75;

      // ── Overall Summary ──
      addText('Overall Summary', margin, 16, [45, 93, 123], true);
      y += 8;

      const summaryItems = [
        ['Pages Audited', pages.length.toString()],
        ['Criteria Tested', `${overallStats.totalTested} / ${overallStats.totalCriteria}`],
        ['Passed', overallStats.totalPassed.toString()],
        ['Failed', overallStats.totalFailed.toString()],
        ['Not Applicable', overallStats.totalNa.toString()],
        ['Overall Pass Rate', overallStats.overallPassRate > 0 ? `${overallStats.overallPassRate}%` : 'N/A'],
      ];

      summaryItems.forEach(([label, value]) => {
        checkPageBreak(8);
        addText(label + ':', margin, 11, [85, 85, 85]);
        addText(value, margin + 55, 11, [26, 26, 46], true);
        y += 7;
      });

      y += 8;

      // ── Per Page Results ──
      pages.forEach((page) => {
        checkPageBreak(20);

        // Page header
        doc.setFillColor(240, 245, 250);
        doc.rect(margin, y - 4, contentWidth, 14, 'F');

        addText(page.title, margin + 2, 13, [26, 26, 46], true);
        addText(
          `Pass Rate: ${page.stats.passRate}% | Failures: ${page.stats.failed}`,
          pageWidth - margin - 70,
          10,
          [85, 85, 85]
        );
        y += 12;

        addText(page.url, margin + 2, 9, [85, 85, 85]);
        y += 8;

        if (page.failures.length === 0) {
          checkPageBreak(8);
          addText('✓ No failures recorded', margin + 4, 10, [45, 122, 42]);
          y += 8;
        } else {
          page.failures.forEach((failure) => {
            checkPageBreak(20);

            addText(
              `${failure.criterion.id} — ${failure.criterion.title}`,
              margin + 4,
              10,
              [76, 6, 29],
              true
            );
            y += 6;

            if (failure.result.severity) {
              addText(
                `Severity: ${failure.result.severity}`,
                margin + 4,
                9,
                [85, 85, 85]
              );
              y += 5;
            }

            if (failure.result.notes) {
              checkPageBreak(10);
              const lines = addText(
                `Notes: ${failure.result.notes}`,
                margin + 4,
                9,
                [60, 60, 60],
                false,
                contentWidth - 8
              );
              y += lines * 5 + 2;
            }

            y += 4;
          });
        }

        y += 6;
      });

      // ── Footer on each page ──
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `AccessAudit — WCAG 2.1 AA Report — ${audit.name}`,
          margin,
          pageHeight - 10
        );
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );
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
        🔗 Copy Share Link
      </button>
      <button
        className="btn btn-primary"
        onClick={handleExport}
        disabled={isExporting}
        aria-busy={isExporting}
      >
        {isExporting ? 'Exporting…' : '↓ Export PDF'}
      </button>
    </div>
  );
}