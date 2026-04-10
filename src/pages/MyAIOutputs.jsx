import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Copy, Download, Trash2, RefreshCw, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function MyAIOutputs() {
  const [user, setUser] = useState(null);
  const [tier, setTier] = useState('free');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  useEffect(() => {
    if (!user) return;
    base44.entities.UserEntitlement.filter({ user_id: user.id }, '-created_date', 1).then(ent => {
      if (ent.length) setTier(ent[0].tier);
    });
  }, [user]);

  const { data: outputs = [], isLoading, refetch } = useQuery({
    queryKey: ['savedOutputs', user?.id],
    queryFn: () => base44.entities.SavedAIOutput.filter({ user_id: user.id }, '-created_date', 100),
    enabled: !!user,
  });

  if (!user) return <div className="flex items-center justify-center min-h-screen"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>;

  const sermons = outputs.filter(o => o.output_type === 'sermon');
  const plans = outputs.filter(o => o.output_type === 'study_plan');
  const devotionals = outputs.filter(o => o.output_type === 'devotional');
  const guides = outputs.filter(o => o.output_type === 'group_guide');

  const copyOutput = async (content) => {
    await navigator.clipboard.writeText(content);
    toast.success('Copied');
  };

  const exportPDF = async (output) => {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text(output.title || 'Untitled', 10, 10);
    pdf.setFontSize(10);
    if (output.passage) pdf.text(`Passage: ${output.passage}`, 10, 20);
    pdf.setFontSize(9);
    const splitText = pdf.splitTextToSize(output.content, 190);
    pdf.text(splitText, 10, 30);
    pdf.save(`${output.title || 'output'}.pdf`);
    toast.success('PDF saved');
  };

  const deleteOutput = async (id) => {
    await base44.entities.SavedAIOutput.delete(id);
    refetch();
    toast.success('Deleted');
  };

  const OutputCard = ({ output }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">{output.title || 'Untitled'}</h3>
          {output.passage && <p className="text-xs text-gray-500">{output.passage}</p>}
          <p className="text-xs text-gray-400 mt-1">
            {output.created_date ? format(new Date(output.created_date), 'MMM d, yyyy') : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
        <button onClick={() => copyOutput(output.content)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-100 transition-colors">
          <Copy className="w-3 h-3" /> Copy
        </button>
        <button onClick={() => exportPDF(output)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-100 transition-colors">
          <Download className="w-3 h-3" /> PDF
        </button>
        <button onClick={() => deleteOutput(output.id)}
          className="flex items-center justify-center px-2 py-1.5 rounded text-xs text-red-400 hover:bg-red-50 transition-colors">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  const TabSection = ({ outputs, empty }) => (
    outputs.length === 0 ? (
      <div className="text-center py-12 text-gray-400">
        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">{empty}</p>
      </div>
    ) : (
      <div className="grid gap-3">
        {outputs.map(o => (
          <OutputCard key={o.id} output={o} />
        ))}
      </div>
    )
  );

  if (tier === 'free') {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h1>
          <p className="text-gray-600 mb-6">Save and manage your AI-generated sermon outlines, study plans, and guides.</p>
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">Upgrade to Premium</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My AI Outputs</h1>
        <p className="text-gray-600 text-sm mb-6">Manage your saved sermons, study plans, and guides.</p>

        <Tabs defaultValue="sermons">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="sermons" className="gap-2 flex-1">
              <FileText className="w-3.5 h-3.5" /> Sermons {sermons.length > 0 && <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs ml-1">{sermons.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2 flex-1">
              <BookOpen className="w-3.5 h-3.5" /> Plans {plans.length > 0 && <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs ml-1">{plans.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="devotionals" className="gap-2 flex-1">
              <BookOpen className="w-3.5 h-3.5" /> Devotionals {devotionals.length > 0 && <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs ml-1">{devotionals.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="guides" className="gap-2 flex-1">
              <BookOpen className="w-3.5 h-3.5" /> Guides {guides.length > 0 && <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs ml-1">{guides.length}</span>}
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <TabsContent value="sermons">
                <TabSection outputs={sermons} empty="No saved sermons yet" />
              </TabsContent>
              <TabsContent value="plans">
                <TabSection outputs={plans} empty="No saved study plans yet" />
              </TabsContent>
              <TabsContent value="devotionals">
                <TabSection outputs={devotionals} empty="No saved devotionals yet" />
              </TabsContent>
              <TabsContent value="guides">
                <TabSection outputs={guides} empty="No saved group guides yet" />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}