'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download,
  Upload,
  RefreshCw,
  Database,
  HardDrive,
  Cloud,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Eye,
  Settings,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { toast } from 'sonner';

interface Backup {
  id: string;
  name: string;
  type: 'manual' | 'automatic' | 'scheduled';
  status: 'completed' | 'in_progress' | 'failed';
  size: number;
  createdAt: string;
  createdBy: string;
  location: 'local' | 'cloud' | 'external';
  includes: {
    database: boolean;
    files: boolean;
    settings: boolean;
    media: boolean;
  };
  downloadUrl?: string;
  checksum?: string;
}

interface RestoreOperation {
  id: string;
  backupId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retention: number; // days
  location: 'local' | 'cloud' | 'both';
  compression: boolean;
  encryption: boolean;
  includeDatabase: boolean;
  includeFiles: boolean;
  includeMedia: boolean;
  includeSettings: boolean;
  autoCleanup: boolean;
  notifications: boolean;
}

export default function BackupRestore() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [restoreOperations, setRestoreOperations] = useState<RestoreOperation[]>([]);
  const [settings, setSettings] = useState<BackupSettings>({
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    retention: 30,
    location: 'both',
    compression: true,
    encryption: true,
    includeDatabase: true,
    includeFiles: true,
    includeMedia: true,
    includeSettings: true,
    autoCleanup: true,
    notifications: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  // Mock data
  const mockBackups: Backup[] = [
    {
      id: '1',
      name: 'Daily Backup - 2024-01-20',
      type: 'automatic',
      status: 'completed',
      size: 245760000, // 245MB
      createdAt: '2024-01-20T02:00:00Z',
      createdBy: 'System',
      location: 'cloud',
      includes: {
        database: true,
        files: true,
        settings: true,
        media: true
      },
      downloadUrl: '/api/backups/1/download',
      checksum: 'a1b2c3d4e5f6...'
    },
    {
      id: '2',
      name: 'Manual Backup - Full System',
      type: 'manual',
      status: 'completed',
      size: 312000000, // 312MB
      createdAt: '2024-01-19T14:30:00Z',
      createdBy: 'John Admin',
      location: 'local',
      includes: {
        database: true,
        files: true,
        settings: true,
        media: true
      },
      downloadUrl: '/api/backups/2/download',
      checksum: 'f6e5d4c3b2a1...'
    },
    {
      id: '3',
      name: 'Database Only - 2024-01-18',
      type: 'scheduled',
      status: 'completed',
      size: 89000000, // 89MB
      createdAt: '2024-01-18T02:00:00Z',
      createdBy: 'System',
      location: 'cloud',
      includes: {
        database: true,
        files: false,
        settings: true,
        media: false
      },
      downloadUrl: '/api/backups/3/download',
      checksum: '9h8g7f6e5d4...'
    },
    {
      id: '4',
      name: 'Weekly Backup - 2024-01-15',
      type: 'automatic',
      status: 'in_progress',
      size: 0,
      createdAt: '2024-01-15T02:00:00Z',
      createdBy: 'System',
      location: 'both',
      includes: {
        database: true,
        files: true,
        settings: true,
        media: true
      }
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setBackups(mockBackups);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newBackup: Backup = {
        id: Date.now().toString(),
        name: `Manual Backup - ${new Date().toLocaleDateString()}`,
        type: 'manual',
        status: 'completed',
        size: Math.floor(Math.random() * 100000000) + 100000000,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User',
        location: settings.location,
        includes: {
          database: settings.includeDatabase,
          files: settings.includeFiles,
          settings: settings.includeSettings,
          media: settings.includeMedia
        },
        downloadUrl: `/api/backups/${Date.now()}/download`,
        checksum: Math.random().toString(36).substring(2, 15)
      };

      setBackups(prev => [newBackup, ...prev]);
      toast.success('Backup created successfully');
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestore = async (backup: Backup) => {
    setSelectedBackup(backup);
    setShowRestoreDialog(true);
  };

  const confirmRestore = async () => {
    if (!selectedBackup) return;

    setIsRestoring(true);
    setRestoreProgress(0);
    setShowRestoreDialog(false);

    try {
      // Simulate restore process
      const steps = [
        'Validating backup integrity...',
        'Creating restore point...',
        'Restoring database...',
        'Restoring files...',
        'Restoring settings...',
        'Verifying restore...',
        'Cleanup and finalization...'
      ];

      for (let i = 0; i < steps.length; i++) {
        toast.info(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRestoreProgress(((i + 1) / steps.length) * 100);
      }

      const newOperation: RestoreOperation = {
        id: Date.now().toString(),
        backupId: selectedBackup.id,
        status: 'completed',
        progress: 100,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      setRestoreOperations(prev => [newOperation, ...prev]);
      toast.success('Restore completed successfully');
    } catch (error) {
      const failedOperation: RestoreOperation = {
        id: Date.now().toString(),
        backupId: selectedBackup.id,
        status: 'failed',
        progress: 0,
        startedAt: new Date().toISOString(),
        error: 'Restore failed due to an error'
      };
      setRestoreOperations(prev => [failedOperation, ...prev]);
      toast.error('Restore failed');
    } finally {
      setIsRestoring(false);
      setRestoreProgress(0);
      setSelectedBackup(null);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
      toast.success('Backup deleted successfully');
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      // Simulate download
      toast.success(`Downloading ${backup.name}...`);
      // In a real implementation, this would trigger a file download
    } catch (error) {
      toast.error('Failed to download backup');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      in_progress: 'secondary',
      failed: 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status.replace('_', ' ')}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      manual: 'outline',
      automatic: 'default',
      scheduled: 'secondary'
    } as const;
    return <Badge variant={variants[type as keyof typeof variants]}>{type}</Badge>;
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'cloud': return <Cloud className="h-4 w-4" />;
      case 'local': return <HardDrive className="h-4 w-4" />;
      case 'external': return <Database className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading backup system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup & Restore</h1>
          <p className="text-gray-600 mt-1">
            Manage system backups and restore operations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
            <Database className="h-4 w-4 mr-2" />
            {isCreatingBackup ? 'Creating...' : 'Create Backup'}
          </Button>
        </div>
      </div>

      {/* Restore Progress */}
      {isRestoring && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Restoring from backup...</span>
              <span>{Math.round(restoreProgress)}%</span>
            </div>
            <Progress value={restoreProgress} className="mt-2" />
          </AlertDescription>
        </Alert>
      )}

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Backup Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Frequency</label>
              <Select value={settings.frequency} onValueChange={(value: any) => setSettings(prev => ({ ...prev, frequency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={settings.time}
                onChange={(e) => setSettings(prev => ({ ...prev, time: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Retention (days)</label>
              <input
                type="number"
                value={settings.retention}
                onChange={(e) => setSettings(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="1"
                max="365"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Select value={settings.location} onValueChange={(value: any) => setSettings(prev => ({ ...prev, location: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Only</SelectItem>
                  <SelectItem value="cloud">Cloud Only</SelectItem>
                  <SelectItem value="both">Local & Cloud</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="font-medium">What to Include</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'includeDatabase', label: 'Database' },
                { key: 'includeFiles', label: 'Files' },
                { key: 'includeSettings', label: 'Settings' },
                { key: 'includeMedia', label: 'Media' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof BackupSettings] as boolean}
                    onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="font-medium">Advanced Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.compression}
                  onChange={(e) => setSettings(prev => ({ ...prev, compression: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Enable Compression</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.encryption}
                  onChange={(e) => setSettings(prev => ({ ...prev, encryption: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Enable Encryption</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Email Notifications</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Available Backups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{backup.name}</div>
                      <div className="text-sm text-gray-500">by {backup.createdBy}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(backup.type)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(backup.status)}
                  </TableCell>
                  <TableCell>
                    {backup.size > 0 ? formatFileSize(backup.size) : 'In Progress'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getLocationIcon(backup.location)}
                      <span className="capitalize">{backup.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(backup.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(backup.createdAt).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {backup.status === 'completed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadBackup(backup)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(backup)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBackup(backup.id)}
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

      {/* Restore Operations */}
      {restoreOperations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Restore Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Backup</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restoreOperations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell>
                      {backups.find(b => b.id === operation.backupId)?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(operation.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={operation.progress} className="w-20" />
                        <span className="text-sm">{operation.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(operation.startedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {operation.completedAt ? new Date(operation.completedAt).toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {backups.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Successful Backups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {formatFileSize(backups.reduce((total, b) => total + b.size, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Backup Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {Math.round((backups.filter(b => b.status === 'completed').length / Math.max(backups.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Restore</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Restoring from a backup will overwrite your current data. This action cannot be undone.
                Please ensure you have a recent backup before proceeding.
              </AlertDescription>
            </Alert>

            {selectedBackup && (
              <div className="space-y-2">
                <h4 className="font-medium">Backup Details:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Name: {selectedBackup.name}</div>
                  <div>Size: {formatFileSize(selectedBackup.size)}</div>
                  <div>Created: {new Date(selectedBackup.createdAt).toLocaleString()}</div>
                  <div>Includes: {Object.entries(selectedBackup.includes)
                    .filter(([_, included]) => included)
                    .map(([key, _]) => key)
                    .join(', ')}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmRestore} className="bg-red-600 hover:bg-red-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Restore
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
