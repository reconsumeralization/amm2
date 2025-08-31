'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CrmPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/crm/dashboard');
  }, [router]);

  return null; // Or a loading spinner
}