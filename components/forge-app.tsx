'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import Storefront, { EMPTY_PRODUCTS, type StoreProduct } from '@/components/storefront';
import { StoreAdmin } from '@/components/store-admin';
import { Menu } from 'lucide-react';
import { AdminPortal } from '@/components/admin-portal';
import { CustomerPortal } from '@/components/customer-portal';
import { BookingWizard, type Availability, type Booking, DEFAULT_AVAIL, DEMO, TIMES } from '@/components/booking-wizard';

export default function SDDealsApp({initialView='store'}:{initialView?:'store'|'account'|'admin'|'pc-admin'}){
 const router=useRouter();
 const[view,setView]=useState<'store'|'account'|'admin'|'pc-admin'>(initialView);
 const[appointmentOpen,setAppointmentOpen]=useState(false);
 const[notice,setNotice]=useState('');
 const[products,setProducts]=useState<StoreProduct[]>(EMPTY_PRODUCTS);
 const[rows,setRows]=useState<Booking[]>(DEMO);
 const[availability,setAvailability]=useState<Availability>(DEFAULT_AVAIL);
 const notify=(message:string)=>{setNotice(message);window.setTimeout(()=>setNotice(''),3600)};
 useEffect(()=>{const sb=getSupabase();if(!sb)return;sb.from('public_availability_settings').select('*').eq('id',1).maybeSingle().then(({data})=>{if(data)setAvailability({...DEFAULT_AVAIL,availableDays:data.available_days||DEFAULT_AVAIL.availableDays,availableHours:data.available_hours||TIMES,duration:data.appointment_duration||'1 hour',maxPerDay:data.maximum_appointments_per_day||5,blockedDates:data.blocked_dates||[],unavailableHours:data.unavailable_hours||{}})})},[]);
 return <>
 {view==='store'&&<Storefront onAccount={()=>router.push('/auth/login?next=%2Faccount')} onPcAppointment={()=>setAppointmentOpen(true)} onAdmin={()=>router.push('/admin')}/>}
 {view==='account'&&<div className="sd-account-shell"><CustomerPortal rows={rows} back={()=>router.push('/')} notify={notify}/><div className="sd-site-footer-mini">© 2026 SD DEALS · SAN DIEGO, CA</div></div>}
 {view==='admin'&&<StoreAdmin products={products} setProducts={setProducts} onBack={()=>router.push('/')} onPcAppointments={()=>setView('pc-admin')} notify={notify}/>}
 {view==='pc-admin'&&<div className="sd-pc-admin"><div className="sd-account-top"><button className="sd-brand" onClick={()=>router.push('/')}><span className="sd-mark">SD</span><span className="sd-brand-name">SD <b>DEALS</b><small>SAN DIEGO · GOODS &amp; SERVICE</small></span></button><button className="sd-button sd-button-outline" onClick={()=>setView('admin')}>Back to store admin</button></div><AdminPortal rows={rows} setRows={setRows} availability={availability} setAvailability={setAvailability} back={()=>setView('admin')} notify={notify}/></div>}
 {appointmentOpen&&<BookingWizard close={()=>setAppointmentOpen(false)} rows={rows} setRows={setRows} availability={availability} notify={notify}/>}
 {notice&&<div className="sd-toast" role="status">{notice}</div>}
 </>;
}
