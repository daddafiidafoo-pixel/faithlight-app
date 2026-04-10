import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Plus, Upload, Download, Trash2, Edit, File, Search } from 'lucide-react';

const REGIONS = ['Africa', 'Europe', 'Asia', 'Americas'];
const LAUNCH_STATUSES = [
  { value: 'planning', label: 'Planning', color: 'bg-gray-100' },
  { value: 'soft_launch', label: 'Soft Launch', color: 'bg-yellow-100' },
  { value: 'live', label: 'Live', color: 'bg-green-100' }
];
const DOC_TYPES = [
  'grant_proposal',
  'donor_one_pager',
  'church_info_pack',
  'ambassador_pack',
  'impact_report',
  'training_materials',
  'other'
];
const VISIBILITY_OPTIONS = ['admin_only', 'ambassador', 'church_partner', 'public'];

export default function CountryResources() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);
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
    queryKey: ['countries'],
    queryFn: () => base44.entities.Country.list(),
    enabled: !!user
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['countryDocuments', selectedCountry?.id],
    queryFn: () => base44.entities.CountryDocument.filter({ country_id: selectedCountry?.id }),
    enabled: !!selectedCountry
  });

  const addCountryMutation = useMutation({
    mutationFn: (data) => base44.entities.Country.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      setShowAddCountry(false);
    }
  });

  const addDocMutation = useMutation({
    mutationFn: (data) => base44.entities.CountryDocument.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countryDocuments'] });
      setShowAddDoc(false);
    }
  });

  const deleteCountryMutation = useMutation({
    mutationFn: (id) => base44.entities.Country.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      setSelectedCountry(null);
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id) => base44.entities.CountryDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countryDocuments'] });
    }
  });

  if (!user) return null;

  const filteredCountries = countries.filter(c => 
    c.country_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    return LAUNCH_STATUSES.find(s => s.value === status)?.color || 'bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Country Resources</h1>
          </div>
          <Dialog open={showAddCountry} onOpenChange={setShowAddCountry}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Country
              </Button>
            </DialogTrigger>
            <DialogContent>
              <AddCountryForm onSubmit={addCountryMutation.mutate} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Countries List */}
          <div className="col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => setSelectedCountry(country)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedCountry?.id === country.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{country.country_name}</p>
                      <p className="text-xs text-gray-500">{country.region}</p>
                    </div>
                    <Badge className={getStatusColor(country.launch_status)}>
                      {LAUNCH_STATUSES.find(s => s.value === country.launch_status)?.label}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Country Details & Documents */}
          <div className="col-span-2">
            {selectedCountry ? (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Country Info</TabsTrigger>
                  <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{selectedCountry.country_name}</CardTitle>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCountryMutation.mutate(selectedCountry.id)}
                      >
                        Delete
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Region</p>
                          <p className="font-semibold">{selectedCountry.region}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Launch Status</p>
                          <Badge className={getStatusColor(selectedCountry.launch_status)}>
                            {LAUNCH_STATUSES.find(s => s.value === selectedCountry.launch_status)?.label}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Primary Languages</p>
                          <p className="font-semibold">{selectedCountry.primary_languages?.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Ambassador</p>
                          <p className="font-semibold">{selectedCountry.ambassador_assigned || 'Not assigned'}</p>
                        </div>
                      </div>
                      {selectedCountry.notes && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Notes</p>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedCountry.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="flex justify-end">
                    <Dialog open={showAddDoc} onOpenChange={setShowAddDoc}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Upload className="w-4 h-4" />
                          Add Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <AddDocumentForm
                          countryId={selectedCountry.id}
                          onSubmit={addDocMutation.mutate}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3">
                    {documents.length === 0 ? (
                      <Card className="bg-gray-50 border-dashed">
                        <CardContent className="p-8 text-center">
                          <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No documents yet</p>
                        </CardContent>
                      </Card>
                    ) : (
                      documents.map((doc) => (
                        <Card key={doc.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                                  <Badge variant="outline">{doc.version}</Badge>
                                  <Badge className="bg-purple-100 text-purple-800">
                                    {doc.document_type.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                                {doc.description && (
                                  <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                                )}
                                <div className="flex gap-4 text-xs text-gray-500">
                                  <span>Visibility: {doc.visibility.replace(/_/g, ' ')}</span>
                                  <span>•</span>
                                  <span>Updated: {new Date(doc.updated_date).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => window.open(doc.file_url, '_blank')}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteDocMutation.mutate(doc.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="p-12 text-center">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">Select a country</p>
                  <p className="text-gray-600">Choose a country from the list to view details and manage documents</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCountryForm({ onSubmit }) {
  const [formData, setFormData] = React.useState({
    country_name: '',
    region: '',
    primary_languages: [],
    launch_status: 'planning',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.country_name && formData.region) {
      onSubmit(formData);
      setFormData({ country_name: '', region: '', primary_languages: [], launch_status: 'planning', notes: '' });
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Add New Country</DialogTitle>
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
            <SelectValue placeholder="Select region" />
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
        <Textarea
          placeholder="Notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
        <Button type="submit" className="w-full">Add Country</Button>
      </form>
    </div>
  );
}

function AddDocumentForm({ countryId, onSubmit }) {
  const [formData, setFormData] = React.useState({
    country_id: countryId,
    document_type: '',
    title: '',
    file_url: '',
    version: 'v1.0',
    visibility: 'admin_only',
    description: ''
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        setFormData({ ...formData, file_url: result.file_url });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.file_url && formData.document_type) {
      onSubmit(formData);
      setFormData({
        country_id: countryId,
        document_type: '',
        title: '',
        file_url: '',
        version: 'v1.0',
        visibility: 'admin_only',
        description: ''
      });
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Add Document</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select value={formData.document_type} onValueChange={(v) => setFormData({ ...formData, document_type: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Document type" />
          </SelectTrigger>
          <SelectContent>
            {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          placeholder="Document title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full"
            required
          />
          {formData.file_url && <p className="text-xs text-green-600">✓ File uploaded</p>}
        </div>
        <Input
          placeholder="Version (e.g., v1.0)"
          value={formData.version}
          onChange={(e) => setFormData({ ...formData, version: e.target.value })}
        />
        <Select value={formData.visibility} onValueChange={(v) => setFormData({ ...formData, visibility: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Textarea
          placeholder="Description (optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <Button type="submit" className="w-full">Add Document</Button>
      </form>
    </div>
  );
}