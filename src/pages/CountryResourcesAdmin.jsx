import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, Upload, Trash2, Edit2, File, Loader2 } from 'lucide-react';

const REGIONS = ['Africa', 'Europe', 'Asia', 'Americas'];
const DOCUMENT_TYPES = [
  'ambassador_handbook',
  'country_launch_pack',
  'church_info_pack',
  'training_deck',
  'grant_proposal',
  'donor_proposal',
  'donor_report'
];
const VISIBILITY_OPTIONS = ['admin_only', 'ambassador', 'church_partner'];

export default function CountryResourcesAdmin() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
        }
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: countries = [] } = useQuery({
    queryKey: ['adminCountries'],
    queryFn: () => base44.entities.Country.list(),
    enabled: !!user
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['countryDocuments'],
    queryFn: () => base44.entities.CountryDocument.list(),
    enabled: !!user
  });

  const { data: ambassadors = [] } = useQuery({
    queryKey: ['ambassadors'],
    queryFn: () => base44.entities.Ambassador.list(),
    enabled: !!user
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Country Resources</h1>
          </div>
          <p className="text-gray-600">Manage countries, ambassadors, and documents for FaithLight expansion.</p>
        </div>

        <Tabs defaultValue="countries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Countries Tab */}
          <TabsContent value="countries" className="space-y-4">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Country
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <CountryForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['adminCountries'] })} ambassadors={ambassadors} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {countries.map((country) => (
                <Card key={country.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{country.country_name}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{country.region}</p>
                      </div>
                      <Badge className={
                        country.launch_status === 'live' ? 'bg-green-100 text-green-800' :
                        country.launch_status === 'soft_launch' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {country.launch_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Languages</p>
                        <p className="font-semibold text-sm">{country.primary_languages?.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Ambassador</p>
                        <p className="font-semibold text-sm">{country.ambassador_assigned || 'Unassigned'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Churches</p>
                        <p className="font-semibold text-sm">{country.churches_onboarded || 0}</p>
                      </div>
                    </div>
                    {country.notes && <p className="text-xs text-gray-600 italic">{country.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DocumentUploadForm
                    countries={countries}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['countryDocuments'] })}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{doc.document_type.replace(/_/g, ' ')} • {doc.version}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Country</p>
                          <p className="font-semibold text-sm">{doc.country_id ? countries.find(c => c.id === doc.country_id)?.country_name : 'Global'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Visibility</p>
                          <div className="flex gap-1 mt-1">
                            {doc.visibility?.map(v => (
                              <Badge key={v} variant="outline" className="text-xs">{v.replace('_', ' ')}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CountryForm({ onSuccess, ambassadors }) {
  const [formData, setFormData] = React.useState({
    country_name: '',
    region: '',
    primary_languages: [],
    launch_status: 'planning',
    ambassador_assigned: '',
    notes: ''
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Country.create(data),
    onSuccess: () => {
      onSuccess();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.country_name && formData.region) {
      mutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Add Country</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Country name"
          value={formData.country_name}
          onChange={(e) => setFormData({ ...formData, country_name: e.target.value })}
          required
        />
        <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          placeholder="Primary languages (comma-separated)"
          value={formData.primary_languages.join(', ')}
          onChange={(e) => setFormData({ ...formData, primary_languages: e.target.value.split(',').map(l => l.trim()) })}
        />
        <Select value={formData.launch_status} onValueChange={(v) => setFormData({ ...formData, launch_status: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Launch status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="soft_launch">Soft Launch</SelectItem>
            <SelectItem value="live">Live</SelectItem>
          </SelectContent>
        </Select>
        <Select value={formData.ambassador_assigned} onValueChange={(v) => setFormData({ ...formData, ambassador_assigned: v || '' })}>
          <SelectTrigger>
            <SelectValue placeholder="Assign ambassador (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>None</SelectItem>
            {ambassadors.map(a => <SelectItem key={a.id} value={a.email}>{a.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Textarea placeholder="Notes (optional)" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
        <Button type="submit" className="w-full">Create Country</Button>
      </form>
    </div>
  );
}

function DocumentUploadForm({ countries, onSuccess }) {
  const [formData, setFormData] = React.useState({
    country_id: '',
    document_type: '',
    title: '',
    version: 'v1.0',
    visibility: ['admin_only'],
    file: null,
    description: ''
  });
  const [uploadProgress, setUploadProgress] = React.useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (fileData) => {
      const uploaded = await base44.integrations.Core.UploadFile({ file: fileData });
      return uploaded.file_url;
    },
    onSuccess: (fileUrl) => {
      base44.entities.CountryDocument.create({
        country_id: formData.country_id || null,
        document_type: formData.document_type,
        title: formData.title,
        version: formData.version,
        visibility: formData.visibility,
        description: formData.description,
        file_url: fileUrl,
        uploaded_by: 'admin'
      }).then(() => {
        onSuccess();
        setUploadProgress(false);
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.document_type && formData.title && formData.file) {
      setUploadProgress(true);
      uploadMutation.mutate(formData.file);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Upload Document</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select value={formData.country_id} onValueChange={(v) => setFormData({ ...formData, country_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Country (or Global)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Global Document</SelectItem>
            {countries.map(c => <SelectItem key={c.id} value={c.id}>{c.country_name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={formData.document_type} onValueChange={(v) => setFormData({ ...formData, document_type: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Document type" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map(dt => <SelectItem key={dt} value={dt}>{dt.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>

        <Input
          placeholder="Document title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Input
          placeholder="Version (e.g., v1.0)"
          value={formData.version}
          onChange={(e) => setFormData({ ...formData, version: e.target.value })}
        />

        <Textarea
          placeholder="Description (optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="h-16"
        />

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Visibility</label>
          <div className="space-y-2">
            {VISIBILITY_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.visibility.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, visibility: [...formData.visibility, option] });
                    } else {
                      setFormData({ ...formData, visibility: formData.visibility.filter(v => v !== option) });
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{option.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Upload PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
            className="w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
            required
          />
          {formData.file && <p className="text-xs text-gray-600 mt-1">{formData.file.name}</p>}
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={uploadProgress || !formData.file}
        >
          {uploadProgress ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Document'
          )}
        </Button>
      </form>
    </div>
  );
}