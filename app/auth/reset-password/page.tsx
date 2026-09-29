import { Suspense } from 'react';
import { ResetPasswordPage } from '@/components/auth-pages';
export default function ResetPage(){return <Suspense fallback={<main className="sd-auth-page"><p className="text-white">Loading password reset…</p></main>}><ResetPasswordPage/></Suspense>}
