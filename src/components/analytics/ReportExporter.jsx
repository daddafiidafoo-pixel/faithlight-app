import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, FileText, Loader } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export default function ReportExporter({ dashboardRef }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportToPDF = async () => {
    try {
      setExporting(true);

      if (dashboardRef?.current) {
        const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        });

        const imgWidth = pdf.internal.pageSize.getWidth() - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
        
        toast.success('Report exported as PDF');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
      setDialogOpen(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);

      const courses = await base44.entities.TrainingCourse.list();
      const progress = await base44.entities.UserTrainingProgress.list();
      const quizResults = await base44.entities.UserQuizResult.list();
      const users = await base44.entities.User.list();

      // Build CSV data
      let csv = 'Analytics Report - ' + new Date().toISOString().split('T')[0] + '\n\n';
      
      csv += 'COURSE COMPLETION RATES\n';
      csv += 'Course Name,Enrolled,Completed,Completion Rate\n';
      
      courses.forEach(course => {
        const courseProgress = progress.filter(p => p.course_id === course.id);
        const completed = courseProgress.filter(p => p.status === 'completed').length;
        const rate = courseProgress.length > 0 ? ((completed / courseProgress.length) * 100).toFixed(2) : 0;
        csv += `"${course.title}",${courseProgress.length},${completed},${rate}%\n`;
      });

      csv += '\nQUIZ PERFORMANCE\n';
      csv += 'Quiz ID,Attempts,Avg Score,Pass Rate\n';
      
      const uniqueQuizzes = [...new Set(quizResults.map(r => r.quiz_id))];
      uniqueQuizzes.forEach(quizId => {
        const results = quizResults.filter(r => r.quiz_id === quizId);
        const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
        const passRate = Math.round((results.filter(r => r.passed).length / results.length) * 100);
        csv += `${quizId},${results.length},${avgScore}%,${passRate}%\n`;
      });

      // Download CSV
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
      element.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success('Report exported as CSV');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Export Report
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Analytics Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              onClick={exportToPDF}
              disabled={exporting}
              className="w-full gap-2"
            >
              {exporting && <Loader className="w-4 h-4 animate-spin" />}
              <FileText className="w-4 h-4" />
              Export as PDF
            </Button>
            <Button
              onClick={exportToCSV}
              disabled={exporting}
              variant="outline"
              className="w-full gap-2"
            >
              {exporting && <Loader className="w-4 h-4 animate-spin" />}
              Export as CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}