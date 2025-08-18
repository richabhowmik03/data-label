import React, { useState } from 'react';
import { Download, FileText, File } from 'lucide-react';
import { Statistics } from '../types/Statistics';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';

interface StatisticsExportProps {
  statistics: Statistics;
}

const StatisticsExport: React.FC<StatisticsExportProps> = ({ statistics }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    const data = Object.entries(statistics.labelCounts).map(([label, count]) => ({
      Label: label,
      Count: count,
      Percentage: statistics.labelPercentages?.[label] || 0
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statistics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF();
      
      // Title
      pdf.setFontSize(20);
      pdf.text('Data Labeling Statistics Report', 20, 30);
      
      // Date
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Summary
      pdf.setFontSize(14);
      pdf.text('Summary', 20, 65);
      pdf.setFontSize(11);
      pdf.text(`Total Processed: ${statistics.totalProcessed}`, 20, 80);
      pdf.text(`Unique Labels: ${Object.keys(statistics.labelCounts).length}`, 20, 90);
      pdf.text(`Last Updated: ${new Date(statistics.lastUpdated).toLocaleString()}`, 20, 100);
      
      // Label breakdown
      pdf.setFontSize(14);
      pdf.text('Label Breakdown', 20, 120);
      
      let yPosition = 135;
      Object.entries(statistics.labelCounts).forEach(([label, count]) => {
        const percentage = statistics.labelPercentages?.[label] || 0;
        pdf.setFontSize(11);
        pdf.text(`${label}: ${count} (${percentage.toFixed(2)}%)`, 30, yPosition);
        yPosition += 15;
      });
      
      pdf.save(`statistics_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={exportToCSV}
        disabled={isExporting}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        <FileText className="h-4 w-4" />
        <span>Export CSV</span>
      </button>
      
      <button
        onClick={exportToPDF}
        disabled={isExporting}
        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        <File className="h-4 w-4" />
        <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
      </button>
    </div>
  );
};

export default StatisticsExport;