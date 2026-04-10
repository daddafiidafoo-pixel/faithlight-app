import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function VerifyLeader() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeader, setSelectedLeader] = useState(null);

  const { data: allVerifiedLeaders = [] } = useQuery({
    queryKey: ['verified-leaders'],
    queryFn: async () => {
      // Fetch all users and filter by verified status
      const users = await base44.entities.User.list();
      return users.filter(u => u.verification_status === 'verified' && u.badge_type);
    },
  });

  const filteredLeaders = allVerifiedLeaders.filter(leader => {
    const searchLower = searchTerm.toLowerCase();
    const matchesId = leader.verification_id?.toLowerCase().includes(searchLower);
    const matchesName = leader.full_name?.toLowerCase().includes(searchLower);
    return matchesId || matchesName;
  });

  const getBadgeColor = (badgeType) => {
    switch (badgeType) {
      case 'verified_pastor':
        return 'bg-green-100 text-green-800';
      case 'verified_trainer':
        return 'bg-purple-100 text-purple-800';
      case 'verified_ambassador':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeLabel = (badgeType) => {
    switch (badgeType) {
      case 'verified_pastor':
        return 'Verified Pastor';
      case 'verified_trainer':
        return 'Verified Trainer';
      case 'verified_ambassador':
        return 'Verified Ambassador';
      default:
        return 'Verified';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Verify a Leader</h1>
          <p className="text-xl text-gray-600">
            Search and verify FaithLight's certified leaders
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by verification ID (e.g., FL-PASTOR-2026-00482) or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                Found {filteredLeaders.length} result{filteredLeaders.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {searchTerm ? (
          <div className="space-y-4">
            {filteredLeaders.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No verified leaders found matching your search
                </AlertDescription>
              </Alert>
            ) : (
              filteredLeaders.map(leader => (
                <Card key={leader.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedLeader(leader)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{leader.full_name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getBadgeColor(leader.badge_type)}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {getBadgeLabel(leader.badge_type)}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {leader.verification_id}
                          </Badge>
                        </div>
                        {leader.city && leader.country && (
                          <p className="text-sm text-gray-600 mt-2">
                            {leader.city}, {leader.country}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLeader(leader);
                      }}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Search by verification ID or leader name to verify a leader
            </AlertDescription>
          </Alert>
        )}

        {/* Leader Details Dialog */}
        <Dialog open={!!selectedLeader} onOpenChange={() => setSelectedLeader(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leader Details</DialogTitle>
              <DialogDescription>
                Verified leader information
              </DialogDescription>
            </DialogHeader>
            {selectedLeader && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="text-lg font-semibold">{selectedLeader.full_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Verification ID</p>
                  <p className="font-mono text-lg font-semibold text-indigo-600">{selectedLeader.verification_id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <Badge className={getBadgeColor(selectedLeader.badge_type)}>
                    {getBadgeLabel(selectedLeader.badge_type)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Verification Status</p>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                {selectedLeader.city && selectedLeader.country && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p>{selectedLeader.city}, {selectedLeader.country}</p>
                  </div>
                )}

                {selectedLeader.badge_issued_at && (
                  <div>
                    <p className="text-sm text-gray-600">Verified Date</p>
                    <p>{new Date(selectedLeader.badge_issued_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}