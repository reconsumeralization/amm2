import { redirect } from 'next/navigation';

export default function CrmPage() {
  // Server-side redirect to dashboard
  redirect('/crm/dashboard');
}