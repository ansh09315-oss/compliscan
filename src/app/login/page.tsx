'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#06090E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#10B981', fontSize: '14px', fontFamily: 'monospace' }}>
        Redirecting to Official CompliScan AI Portal...
      </div>
    </div>
  );
}
