'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

interface AddNoteFormProps {
  customerId: string;
  onNoteAdded: () => void;
}

const AddNoteForm: React.FC<AddNoteFormProps> = ({ customerId, onNoteAdded }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const noteData = {
      ...values,
      customer: customerId,
    };

    const response = await fetch('/api/customer-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (response.ok) {
      form.reset();
      onNoteAdded();
    } else {
      console.error('Failed to add note');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>New Note</FormLabel>
              <FormControl>
                <Textarea placeholder="Add a note..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Note</Button>
      </form>
    </Form>
  );
};

export default AddNoteForm;
