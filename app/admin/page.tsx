'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import SDDealsApp from '@/components/forge-app';
import { getSupabase } from '@/lib/supabase';
export default function AdminPage(){const router=useRouter(),[allowed,setAllowed]=useState(false);useEffect(()=>{const sb=getSupabase();if(!sb){router.replace('/auth/login?next=%2Fadmin');return}let active=true;const check=async()=>{const{data:{user}}=await sb.auth.getUser();if(!active)return;if(!user){router.replace('/auth/login?next=%2Fadmin');return}if(user.app_metadata?.role!=='admin'){router.replace('/account');return}setAllowed(true)};void check();const{data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{if(!session)router.replace('/auth/login?next=%2Fadmin');else if(session.user.app_metadata?.role!=='admin')router.replace('/account')});return()=>{active=false;subscription.unsubscribe()}},[router]);return allowed?<SDDealsApp initialView="admin"/>:<main className="sd-auth-page"><div className="sd-auth-loading"><LoaderCircle className="sd-spin"/>Verifying administrator access…</div></main>}
