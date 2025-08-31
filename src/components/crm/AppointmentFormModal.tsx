'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceId: z.string().min(1, 'Service is required'),
  notes: z.string().optional(),
});

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: any; // Full appointment object for editing
  slotInfo?: { start: Date; end: Date }; // For creating
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ isOpen, onClose, appointment, slotInfo }) => {
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const isEditMode = !!appointment;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      const fetchCustomers = async () => {
        const response = await fetch('/api/customers');
        if (response.ok) {
          const data = await response.json();
          setCustomers(data.docs);
        }
      };

      const fetchServices = async () => {
        const response = await fetch('/api/services');
        if (response.ok) {
          const data = await response.json();
          setServices(data.docs);
        }
      };

      fetchCustomers();
      fetchServices();

      if (isEditMode) {
        form.reset({
          customerId: appointment.user.id,
          serviceId: appointment.service.id,
          notes: appointment.notes,
        });
      }
    }
  }, [isOpen, isEditMode, appointment, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const appointmentData = {
      ...values,
      date: isEditMode ? appointment.date : slotInfo?.start.toISOString(),
    };

    const url = isEditMode ? `/api/appointments/${appointment.id}` : '/api/appointments';
    const method = isEditMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (response.ok) {
      onClose();
      // You might want to refresh the calendar here
    } else {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} appointment`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
              control={form.control}
              name="customerId"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service: any) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Any specific requests?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Appointment'}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormModal;
