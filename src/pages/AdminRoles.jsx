import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import RoleManager from '@/components/admin/RoleManager';
import UserRoleAssignment from '@/components/admin/UserRoleAssignment';

export default function AdminRolesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Check if user is admin
        if (currentUser.role !== 'admin') {
          window.location.href = '/Home';
        }
      } catch (error) {
        console.error('Auth error:', error);
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="p-12 text-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p>Not authorized to access this page</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-2">
            Manage custom roles and assign permissions to users
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="roles">Manage Roles</TabsTrigger>
            <TabsTrigger value="assignments">Assign to Users</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <div className="bg-white rounded-lg border p-6">
              <RoleManager
                adminUserId={user.id}
                adminName={user.full_name}
              />
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="bg-white rounded-lg border p-6">
              <UserRoleAssignment
                adminUserId={user.id}
                adminName={user.full_name}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}