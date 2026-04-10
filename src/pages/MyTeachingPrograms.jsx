import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Download, Printer, Eye, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyTeachingPrograms() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!['teacher', 'pastor', 'admin'].includes(currentUser.user_role)) {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['teaching-programs', user?.id],
    queryFn: () => base44.entities.TeachingProgram.filter({ teacher_id: user.id }, '-created_date'),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TeachingProgram.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['teaching-programs']);
      setShowPreview(false);
    },
  });

  const drafts = programs.filter(p => p.status === 'draft');
  const finalized = programs.filter(p => p.status === 'finalized');

  const handlePreview = (program) => {
    setSelectedProgram(program);
    setShowPreview(true);
  };

  const handlePrint = (program) => {
    setSelectedProgram(program);
    setShowPreview(true);
    setTimeout(() => window.print(), 500);
  };

  const audienceLabels = {
    youth: 'Youth',
    adults: 'Adults',
    new_believers: 'New Believers',
    church_leaders: 'Church Leaders'
  };

  const typeLabels = {
    sermon: 'Sermon',
    bible_study: 'Bible Study',
    lecture: 'Lecture',
    devotional: 'Devotional'
  };

  const ProgramCard = ({ program }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={program.status === 'finalized' ? 'default' : 'outline'}>
                {program.status}
              </Badge>
              <Badge variant="outline">{typeLabels[program.teaching_type]}</Badge>
              <Badge variant="outline">{audienceLabels[program.audience]}</Badge>
            </div>
            <CardTitle className="text-lg">{program.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-2">{program.scripture}</p>
            <p className="text-xs text-gray-500 mt-1">{program.duration_minutes} minutes</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handlePreview(program)} className="flex-1">
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" variant="outline" onClick={() => handlePrint(program)} title="Print Teaching">
            <Printer className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm('Are you sure you want to delete this program?')) {
                deleteMutation.mutate(program.id);
              }
            }}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Teaching Programs</h1>
            <p className="text-gray-600">Manage your sermons, Bible studies, and teaching materials</p>
          </div>
          <Link to={createPageUrl('TeachingProgramGenerator')}>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create New Teaching Program
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{programs.length}</div>
                <div className="text-sm text-gray-600 mt-1">Total Programs</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{finalized.length}</div>
                <div className="text-sm text-gray-600 mt-1">Finalized</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{drafts.length}</div>
                <div className="text-sm text-gray-600 mt-1">Drafts</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({programs.length})</TabsTrigger>
            <TabsTrigger value="finalized">Finalized ({finalized.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <p className="text-center py-12 text-gray-600">Loading programs...</p>
            ) : programs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">You haven't created any teaching programs yet</p>
                  <Link to={createPageUrl('TeachingProgramGenerator')}>
                    <Button>Create New Teaching Program</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map(program => <ProgramCard key={program.id} program={program} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="finalized" className="mt-6">
            {finalized.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-600">No finalized programs</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {finalized.map(program => <ProgramCard key={program.id} program={program} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="mt-6">
            {drafts.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-600">No draft programs</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drafts.map(program => <ProgramCard key={program.id} program={program} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProgram?.title}</DialogTitle>
          </DialogHeader>
          {selectedProgram && (
            <div className="prose prose-sm max-w-none" id="preview-content">
              <ReactMarkdown>{selectedProgram.content}</ReactMarkdown>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #preview-content, #preview-content * {
            visibility: visible;
          }
          #preview-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}