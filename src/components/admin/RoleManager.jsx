import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Lock } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_PERMISSIONS = [
  { id: 'MANAGE_TRAINING', label: 'Manage Training Modules', category: 'Training' },
  { id: 'CREATE_COURSES', label: 'Create Courses', category: 'Training' },
  { id: 'EDIT_COURSES', label: 'Edit Courses', category: 'Training' },
  { id: 'APPROVE_COURSES', label: 'Approve Courses', category: 'Training' },
  { id: 'DELETE_COURSES', label: 'Delete Courses', category: 'Training' },
  { id: 'MODERATE_CHAT', label: 'Moderate Chat', category: 'Moderation' },
  { id: 'MUTE_USERS', label: 'Mute Users', category: 'Moderation' },
  { id: 'REMOVE_MESSAGES', label: 'Remove Messages', category: 'Moderation' },
  { id: 'BAN_USERS', label: 'Ban Users', category: 'Moderation' },
  { id: 'CREATE_EVENTS', label: 'Create Events', category: 'Events' },
  { id: 'MANAGE_EVENTS', label: 'Manage Events', category: 'Events' },
  { id: 'MANAGE_GROUPS', label: 'Manage Groups', category: 'Groups' },
  { id: 'CREATE_SESSIONS', label: 'Create Live Sessions', category: 'Sessions' },
  { id: 'MANAGE_USERS', label: 'Manage Users', category: 'Admin' },
  { id: 'MANAGE_ROLES', label: 'Manage Roles', category: 'Admin' },
  { id: 'VIEW_REPORTS', label: 'View Reports', category: 'Admin' },
];

export default function RoleManager({ adminUserId, adminName }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    permissions: [],
    color: '#6366f1',
    icon: 'Shield',
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
  });

  const createRoleMutation = useMutation({
    mutationFn: async () => {
      if (!formData.role_name || formData.permissions.length === 0) {
        throw new Error('Role name and at least one permission required');
      }

      if (editingRole) {
        return await base44.entities.Role.update(editingRole.id, {
          role_name: formData.role_name,
          description: formData.description,
          permissions: formData.permissions,
          color: formData.color,
          icon: formData.icon,
        });
      }

      return await base44.entities.Role.create({
        role_name: formData.role_name,
        description: formData.description,
        permissions: formData.permissions,
        color: formData.color,
        icon: formData.icon,
        created_by_user_id: adminUserId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      toast.success(editingRole ? 'Role updated' : 'Role created');
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId) => base44.entities.Role.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      toast.success('Role deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      role_name: '',
      description: '',
      permissions: [],
      color: '#6366f1',
      icon: 'Shield',
    });
    setEditingRole(null);
  };

  const openEditDialog = (role) => {
    setEditingRole(role);
    setFormData({
      role_name: role.role_name,
      description: role.description || '',
      permissions: role.permissions || [],
      color: role.color || '#6366f1',
      icon: role.icon || 'Shield',
    });
    setDialogOpen(true);
  };

  const togglePermission = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  const systemRoles = roles.filter(r => r.is_system_role);
  const customRoles = roles.filter(r => !r.is_system_role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Role Management</h2>
        <Button onClick={() => {
          resetForm();
          setDialogOpen(true);
        }} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Role
        </Button>
      </div>

      <Tabs defaultValue="custom" className="space-y-4">
        <TabsList>
          <TabsTrigger value="custom">Custom Roles ({customRoles.length})</TabsTrigger>
          <TabsTrigger value="system">System Roles ({systemRoles.length})</TabsTrigger>
        </TabsList>

        {/* Custom Roles */}
        <TabsContent value="custom">
          {customRoles.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No custom roles created yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {customRoles.map(role => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={() => openEditDialog(role)}
                  onDelete={() => deleteRoleMutation.mutate(role.id)}
                  canDelete={!role.is_system_role}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* System Roles */}
        <TabsContent value="system">
          {systemRoles.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No system roles
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {systemRoles.map(role => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={() => openEditDialog(role)}
                  isSystemRole
                  canDelete={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Role Name *</Label>
              <Input
                value={formData.role_name}
                onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                placeholder="e.g., Content Moderator"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this role do?"
                rows={2}
              />
            </div>

            <div>
              <Label className="block mb-3">Permissions *</Label>
              <div className="space-y-4 max-h-48 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <p className="text-sm font-semibold text-gray-700 mb-2">{category}</p>
                    <div className="space-y-2 ml-4">
                      {perms.map(perm => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                onClick={() => setDialogOpen(false)}
                variant="outline"
                disabled={createRoleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createRoleMutation.mutate()}
                disabled={
                  createRoleMutation.isPending ||
                  !formData.role_name ||
                  formData.permissions.length === 0
                }
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoleCard({ role, onEdit, onDelete, canDelete, isSystemRole }) {
  const permissionLabels = AVAILABLE_PERMISSIONS.reduce((acc, p) => {
    acc[p.id] = p.label;
    return acc;
  }, {});

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{role.role_name}</h3>
              {isSystemRole && (
                <Badge className="bg-purple-100 text-purple-800">
                  <Lock className="w-3 h-3 mr-1" />
                  System
                </Badge>
              )}
            </div>
            {role.description && (
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {role.permissions.map(perm => (
                <Badge key={perm} variant="outline" className="text-xs">
                  {permissionLabels[perm] || perm}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={onEdit} size="sm" variant="outline">
              <Edit2 className="w-4 h-4" />
            </Button>
            {canDelete && (
              <Button onClick={onDelete} size="sm" variant="destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}