'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import AddNoteForm from '@/components/crm/AddNoteForm';

const CustomerDetailPage = ({ params }: { params: { id: string } }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerDashboard = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/customers/${params.id}/dashboard`);
    if (response.ok) {
      const data = await response.json();
      setDashboardData(data);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchCustomerDashboard();
  }, [fetchCustomerDashboard]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!dashboardData) {
    return <div>Customer not found</div>;
  }

  const { customer, appointments, notes, stats } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={customer.avatar?.url} alt={customer.fullName} />
          <AvatarFallback>{customer.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{customer.fullName}</h1>
          <p className="text-muted-foreground">{customer.email}</p>
        </div>
        <Button asChild>
          <Link href={`/crm/customers/${params.id}/edit`}>Edit Customer</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Contact Information</h3>
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Phone:</strong> {customer.phone}</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold">Preferences</h3>
              <p>{customer.preferences.notes}</p>
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold">Stats</h3>
                <p><strong>Total Appointments:</strong> {stats.totalAppointments}</p>
                <p><strong>Total Spent:</strong> ${(stats.totalSpent / 100).toFixed(2)}</p>
                <p><strong>Last Visit:</strong> {stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <AddNoteForm customerId={params.id} onNoteAdded={fetchCustomerDashboard} />
            <ul className="space-y-2 mt-4">
              {notes.map((note: any) => (
                <li key={note.id} className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p>{note.content}</p>
                  <p className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2">
                {appointments.map((appointment: any) => (
                    <li key={appointment.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <div>
                            <p className="font-semibold">{appointment.title}</p>
                            <p className="text-sm text-muted-foreground">{new Date(appointment.date).toLocaleString()}</p>
                        </div>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full bg-blue-200 text-blue-800`}>{appointment.status}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetailPage;