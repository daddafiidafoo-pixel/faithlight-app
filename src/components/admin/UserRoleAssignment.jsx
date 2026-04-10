import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function UserRoleAssignment({ adminUserId, adminName }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-role-assignment'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => base44.entities.UserRole.list(),
  });

  const assignRoleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !selectedRole) {
        throw new Error('Please select both user and role');
      }

      const role = roles.find(r => r.id === selectedRole);

      return await base44.entities.UserRole.create({
        user_id: selectedUser.id,
        user_name: selectedUser.full_name,
        user_email: selectedUser.email,
        role_id: selectedRole,
        role_name: role.role_name,
        assigned_by_user_id: adminUserId,
        assigned_by_name: adminName,
        assigned_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-roles']);
      toast.success('Role assigned');
      setAssignDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole('');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: (userRoleId) => base44.entities.UserRole.delete(userRoleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-roles']);
      toast.success('Role removed');
    },
  });

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserRoles = (userId) => {
    return userRoles.filter(ur => ur.user_id === userId && ur.is_active);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Role Assignment</h2>
        <Button
          onClick={() => setAssignDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Assign Role
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by name or email..."
          className="pl-10"
        />
      </div>

      {/* Users with Roles */}
      <div className="space-y-3">
        {filteredUsers.map(user => {
          const assignedRoles = getUserRoles(user.id);
          return (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.full_name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {assignedRoles.length === 0 ? (
                        <span className="text-xs text-gray-500">No roles assigned</span>
                      ) : (
                        assignedRoles.map(ur => (
                          <Badge
                            key={ur.id}
                            className="flex items-center gap-2"
                          >
                            {ur.role_name}
                            <button
                              onClick={() => removeRoleMutation.mutate(ur.id)}
                              className="hover:text-red-300"
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedUser(user);
                      setAssignDialogOpen(true);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assign Role Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <Select
                value={selectedUser?.id || ''}
                onValueChange={(userId) => {
                  const user = users.find(u => u.id === userId);
                  setSelectedUser(user);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(r => r.is_active).map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                onClick={() => setAssignDialogOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => assignRoleMutation.mutate()}
                disabled={!selectedUser || !selectedRole || assignRoleMutation.isPending}
              >
                Assign Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}