import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BACKEND_ORIGIN } from '../constants';

export function formatCurrency(amount) {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateStr, pattern = 'MMM dd, yyyy') {
  if (!dateStr) return '—';
  try {
    const parsed = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(parsed, pattern);
  } catch {
    return String(dateStr);
  }
}

export function formatDateTime(dateStr) {
  return formatDate(dateStr, 'MMM dd, yyyy • hh:mm a');
}

export function formatBytes(bytes) {
  const b = Number(bytes || 0);
  if (b === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function resolveFileUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function exportTableToPDF(title, columns, rows, filename = 'nexuslms_report.pdf') {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229);
  doc.text(`NexusLMS Enterprise — ${title}`, 14, 18);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 25);

  autoTable(doc, {
    startY: 30,
    head: [columns],
    body: rows,
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  doc.save(filename);
}
