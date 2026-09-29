import { Suspense } from 'react';
import { AuthPage } from '@/components/auth-pages';
export default function LoginPage(){return <Suspense fallback={<main className="sd-auth-page"><p className="text-white">Loading secure sign in…</p></main>}><AuthPage/></Suspense>}
