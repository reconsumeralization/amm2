'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  Settings,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Filter
} from "lucide-react";
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'barber' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
  tenantId?: string;
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    totalSpent: number;
    averageRating: number;
  };
}

interface RolePermissions {
  role: string;
  permissions: string[];
  description: string;
}

const AVAILABLE_PERMISSIONS = [
  'view_dashboard',
  'manage_users',
  'manage_appointments',
  'manage_services',
  'manage_inventory',
  'view_reports',
  'manage_content',
  'manage_settings',
  'manage_billing',
  'manage_staff',
  'view_analytics',
  'export_data'
];

const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'admin',
    permissions: AVAILABLE_PERMISSIONS,
    description: 'Full access to all system features and settings'
  },
  {
    role: 'manager',
    permissions: [
      'view_dashboard',
      'manage_users',
      'manage_appointments',
      'manage_services',
      'view_reports',
      'manage_content',
      'manage_staff',
      'view_analytics',
      'export_data'
    ],
    description: 'Management access with limited administrative functions'
  },
  {
    role: 'barber',
    permissions: [
      'view_dashboard',
      'manage_appointments',
      'view_reports'
    ],
    description: 'Access to appointment management and basic reporting'
  },
  {
    role: 'customer',
    permissions: [
      'manage_appointments'
    ],
    description: 'Access to personal appointments and profile management'
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock data
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Admin',
      email: 'admin@modernmen.com',
      role: 'admin',
      status: 'active',
      phone: '+1 (555) 123-4567',
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-01-20T14:30:00Z',
      permissions: ROLE_PERMISSIONS.find(r => r.role === 'admin')?.permissions || [],
      stats: {
        totalAppointments: 0,
        completedAppointments: 0,
        totalSpent: 0,
        averageRating: 0
      }
    },
    {
      id: '2',
      name: 'Sarah Manager',
      email: 'manager@modernmen.com',
      role: 'manager',
      status: 'active',
      phone: '+1 (555) 234-5678',
      createdAt: '2024-01-05T00:00:00Z',
      lastLogin: '2024-01-20T10:15:00Z',
      permissions: ROLE_PERMISSIONS.find(r => r.role === 'manager')?.permissions || [],
      stats: {
        totalAppointments: 0,
        completedAppointments: 0,
        totalSpent: 0,
        averageRating: 0
      }
    },
    {
      id: '3',
      name: 'Mike Barber',
      email: 'mike@modernmen.com',
      role: 'barber',
      status: 'active',
      phone: '+1 (555) 345-6789',
      createdAt: '2024-01-10T00:00:00Z',
      lastLogin: '2024-01-20T09:00:00Z',
      permissions: ROLE_PERMISSIONS.find(r => r.role === 'barber')?.permissions || [],
      stats: {
        totalAppointments: 45,
        completedAppointments: 42,
        totalSpent: 0,
        averageRating: 4.8
      }
    },
    {
      id: '4',
      name: 'Jane Customer',
      email: 'jane@example.com',
      role: 'customer',
      status: 'active',
      phone: '+1 (555) 456-7890',
      createdAt: '2024-01-15T00:00:00Z',
      lastLogin: '2024-01-19T16:20:00Z',
      permissions: ROLE_PERMISSIONS.find(r => r.role === 'customer')?.permissions || [],
      stats: {
        totalAppointments: 8,
        completedAppointments: 7,
        totalSpent: 640,
        averageRating: 5.0
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleCreate = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: '',
      email: '',
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
      permissions: ROLE_PERMISSIONS.find(r => r.role === 'customer')?.permissions || [],
      stats: {
        totalAppointments: 0,
        completedAppointments: 0,
        totalSpent: 0,
        averageRating: 0
      }
    };
    setSelectedUser(newUser);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = async (user: User) => {
    try {
      if (isCreating) {
        setUsers(prev => [...prev, user]);
        toast.success('User created successfully');
      } else {
        setUsers(prev => prev.map(existing =>
          existing.id === user.id ? user : existing
        ));
        toast.success('User updated successfully');
      }
      setIsEditing(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      toast.success(`${selectedUsers.length} users deleted successfully`);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast.success(`User status updated to ${newStatus}`);
  };

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    const newPermissions = ROLE_PERMISSIONS.find(r => r.role === newRole)?.permissions || [];
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, role: newRole, permissions: newPermissions } : user
    ));
    toast.success(`User role updated to ${newRole}`);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'destructive',
      manager: 'default',
      barber: 'secondary',
      customer: 'outline'
    } as const;
    return <Badge variant={variants[role as keyof typeof variants]}>{role}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage users, roles, and permissions across your organization
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowPermissions(!showPermissions)}
            variant="outline"
            size="sm"
          >
            <Shield className="h-4 w-4 mr-2" />
            {showPermissions ? 'Hide' : 'Show'} Permissions
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="barber">Barber</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              {selectedUsers.length > 0 && (
                <Button
                  onClick={handleBulkDelete}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedUsers.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                {showPermissions && <TableHead>Permissions</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.role)}
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value as User['role'])}
                      >
                        <SelectTrigger className="w-24 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="barber">Barber</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(user.status)}
                      <Select
                        value={user.status}
                        onValueChange={(value) => handleStatusChange(user.id, value as User['status'])}
                      >
                        <SelectTrigger className="w-24 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <div className="text-sm">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </TableCell>
                  {showPermissions && (
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.permissions.slice(0, 3).map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                        {user.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleEdit(user)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(user.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {ROLE_PERMISSIONS.map((rolePerm) => (
              <div key={rolePerm.role} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{rolePerm.role}</h3>
                  <Badge variant="outline">{rolePerm.permissions.length} permissions</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rolePerm.description}</p>
                <div className="flex flex-wrap gap-1">
                  {rolePerm.permissions.map(permission => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Editor Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New User' : 'Edit User'}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserEditor
              user={selectedUser}
              onSave={handleSave}
              onCancel={() => {
                setIsEditing(false);
                setSelectedUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// User Editor Component
function UserEditor({
  user,
  onSave,
  onCancel
}: {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}) {
  const [editedUser, setEditedUser] = useState<User>(user);

  const handleSave = () => {
    // Update permissions based on role
    const rolePermissions = ROLE_PERMISSIONS.find(r => r.role === editedUser.role)?.permissions || [];
    const updatedUser = { ...editedUser, permissions: rolePermissions };
    onSave(updatedUser);
  };

  const handleRoleChange = (newRole: User['role']) => {
    const rolePermissions = ROLE_PERMISSIONS.find(r => r.role === newRole)?.permissions || [];
    setEditedUser(prev => ({
      ...prev,
      role: newRole,
      permissions: rolePermissions
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={editedUser.name}
            onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={editedUser.email}
            onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={editedUser.phone || ''}
            onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={editedUser.role} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="barber">Barber</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={editedUser.status}
          onValueChange={(value: User['status']) => setEditedUser(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Permissions</Label>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {editedUser.permissions.map(permission => (
              <Badge key={permission} variant="outline">
                {permission.replace('_', ' ')}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Permissions are automatically set based on the user's role
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Key className="h-4 w-4 mr-2" />
          Save User
        </Button>
      </div>
    </div>
  );
}