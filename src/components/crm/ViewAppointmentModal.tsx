'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppointmentFormModal from './AppointmentFormModal';

interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    resource: any;
}

interface ViewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: CalendarEvent | null;
}

const ViewAppointmentModal: React.FC<ViewAppointmentModalProps> = ({ isOpen, onClose, appointment }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!appointment) return null;

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    onClose(); // Also close the view modal
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      const response = await fetch(`/api/appointments/${appointment.resource.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onClose();
        // You might want to refresh the calendar here
      } else {
        console.error('Failed to delete appointment');
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{appointment.title}</DialogTitle>
          </DialogHeader>
          <div>
            <p><strong>Starts:</strong> {appointment.start.toLocaleString()}</p>
            <p><strong>Ends:</strong> {appointment.end.toLocaleString()}</p>
            <p><strong>Customer:</strong> {appointment.resource.user.fullName}</p>
            <p><strong>Service:</strong> {appointment.resource.service.name}</p>
            <p><strong>Status:</strong> {appointment.resource.status}</p>
            <p><strong>Notes:</strong> {appointment.resource.notes}</p>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleEdit}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
      {isEditModalOpen && (
        <AppointmentFormModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          appointment={appointment.resource}
        />
      )}
    </>
  );
};

export default ViewAppointmentModal;
