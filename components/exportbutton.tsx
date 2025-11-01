'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonProps {
  data: Array<{
    id: string;
    question: string;
    answer: string;
    created_at: string;
  }>;
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // Prepare CSV content
      const headers = ['Date', 'Question', 'Answer'];
      const csvRows = [
        headers.join(','),
        ...data.map(row => {
          const date = new Date(row.created_at).toLocaleString();
          const question = `"${row.question.replace(/"/g, '""')}"`;
          const answer = `"${row.answer.replace(/"/g, '""')}"`;
          return [date, question, answer].join(',');
        })
      ];
      
      const csvContent = csvRows.join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `chat-history-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export chat history. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `chat-history-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export chat history. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToCSV}
        disabled={isExporting}
      >
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToJSON}
        disabled={isExporting}
      >
        <Download className="mr-2 h-4 w-4" />
        Export JSON
      </Button>
    </div>
  );
}