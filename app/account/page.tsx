'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import SDDealsApp from '@/components/forge-app';
import { getSupabase } from '@/lib/supabase';
export default function AccountPage(){const router=useRouter(),[ready,setReady]=useState(false);useEffect(()=>{const sb=getSupabase();if(!sb){router.replace('/auth/login?next=%2Faccount');return}let active=true;const check=async()=>{const{data:{user}}=await sb.auth.getUser();if(!active)return;if(!user){router.replace('/auth/login?next=%2Faccount');return}if(user.app_metadata?.role==='admin'){router.replace('/admin');return}setReady(true)};void check();const{data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{if(!session)router.replace('/auth/login?next=%2Faccount')});return()=>{active=false;subscription.unsubscribe()}},[router]);return ready?<SDDealsApp initialView="account"/>:<main className="sd-auth-page"><div className="sd-auth-loading"><LoaderCircle className="sd-spin"/>Loading your private account…</div></main>}
