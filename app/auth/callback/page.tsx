import { Suspense } from 'react';
import { AuthCallback } from '@/components/auth-pages';
export default function CallbackPage(){return <Suspense fallback={<main className="sd-auth-page"><p className="text-white">Verifying secure sign in…</p></main>}><AuthCallback/></Suspense>}
