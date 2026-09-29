'use client';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Clock3, 
  Cpu, 
  HardDrive, 
  MapPin, 
  Monitor, 
  Package, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  Wrench, 
  X, 
  Zap 
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export type Booking = {
  id: string;
  name: string;
  service: string;
  date: string;
  time: string;
  status: string;
  parts: string;
  budget: string;
  email: string;
  notes: string;
  owned: string[];
  needed: string[];
  exact?: Record<string, string>;
  imagePaths?: string[];
  suggestedDate?: string;
  suggestedTime?: string;
};

export type Availability = {
  availableDays: string[];
  availableHours: string[];
  duration: string;
  maxPerDay: number;
  blockedDates: string[];
  unavailableHours: Record<string, string[]>;
  shippingAddress?: string;
  shippingInstructions?: string;
};

export const TIMES = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
export const DEFAULT_AVAIL: Availability = {
  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  availableHours: TIMES,
  duration: '1 hour',
  maxPerDay: 5,
  blockedDates: [],
  unavailableHours: {}
};

export const DEMO: Booking[] = [
  {
    id: 'PC-1048',
    name: 'Jordan Lee',
    service: 'Custom Gaming PC Build',
    date: '2026-10-05',
    time: '2:00 PM',
    status: 'Pending Approval',
    parts: 'I want SD Deals to help choose and purchase parts after I approve a quote.',
    budget: '$2,000',
    email: 'jordan@example.com',
    notes: 'Looking for a quiet 1440p setup.',
    owned: [],
    needed: ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'Power Supply']
  },
  {
    id: 'PC-1047',
    name: 'Alex Morgan',
    service: 'PC Upgrade',
    date: '2026-10-06',
    time: '11:00 AM',
    status: 'Confirmed',
    parts: 'I have some parts, but I need you to buy the rest.',
    budget: '$700',
    email: 'alex@example.com',
    notes: 'Would love a GPU upgrade.',
    owned: ['Case', 'RAM'],
    needed: ['GPU', 'SSD']
  }
];

const SERVICES_DATA = [
  { name: 'PC Assembly', desc: 'Precision build using parts you already own.', icon: Cpu, badge: 'From $65' },
  { name: 'Custom Gaming PC Build', desc: 'End-to-end custom build tailored for maximum gaming performance.', icon: Zap, badge: 'From $120' },
  { name: 'PC Upgrade', desc: 'Targeted GPU, RAM, CPU or high-speed SSD upgrades.', icon: Sparkles, badge: 'From $45' },
  { name: 'PC Diagnostics', desc: 'System troubleshooting for crashes, BSOD, or power issues.', icon: Monitor, badge: 'From $40' },
  { name: 'PC Repair', desc: 'Hardware diagnosis, component replacement, and thermal re-paste.', icon: Wrench, badge: 'From $55' },
  { name: 'Cable Management', desc: 'Clean wire routing, optimal airflow, and silent fan tuning.', icon: HardDrive, badge: 'From $50' },
  { name: 'Windows Setup', desc: 'Debloated Windows 11 installation with latest optimized drivers.', icon: ShieldCheck, badge: 'From $40' }
];

const PARTS = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'Power Supply', 'Case', 'CPU Cooler', 'Other Components'];
const BUY = ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'Power Supply', 'Case', 'Cooler', 'Fans', 'Other'];
const USES = ['Gaming', 'Gaming + Streaming', 'Streaming', 'Work & Productivity', 'Content Creation / 3D'];
const PRIORITIES = ['Maximum gaming FPS', 'Clean aesthetics & RGB', 'Ultra-quiet operation', 'Future upgradability', 'Compact Small Form Factor (ITX)', 'Best performance per dollar'];
const STEP = ['Service', 'Date & time', 'Parts', 'Delivery', 'Contact', 'Review'];

function Label({ children }: { children: string }) {
  return <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#b8b5ac]">{children}</label>;
}

function Eye({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-bold tracking-[.25em] text-[#d5c298] uppercase">{children}</p>;
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[46px] rounded-xl border px-4 py-3 text-left text-xs font-medium transition duration-200 ${
        active 
          ? 'border-[#b39864] bg-[#b39864]/15 text-[#fbfaf6] shadow-[0_0_15px_rgba(179,152,100,0.18)]' 
          : 'border-white/10 bg-[#151513]/70 text-[#9e9b90] hover:border-white/20 hover:text-white'
      }`}
    >
      <span className={`mr-2.5 inline-block h-2.5 w-2.5 rounded-full border transition-all ${active ? 'border-[#d5c298] bg-[#d5c298]' : 'border-white/30'}`} />
      {children}
    </button>
  );
}

function Multi({ items, values, toggle }: { items: string[]; values: string[]; toggle: (x: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((x) => {
        const active = values.includes(x);
        return (
          <label 
            key={x} 
            onClick={() => toggle(x)}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition select-none ${
              active 
                ? 'border-[#b39864]/70 bg-[#b39864]/15 text-white' 
                : 'border-white/[.08] bg-[#161614] text-[#8e8b82] hover:border-white/20 hover:text-white'
            }`}
          >
            <input 
              type="checkbox" 
              checked={active} 
              onChange={() => {}} 
              className="accent-[#b39864]"
            />
            <span className="truncate">{x}</span>
          </label>
        );
      })}
    </div>
  );
}

function ReviewSection({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-xl border border-white/[.08] bg-[#161614] p-4 shadow-sm">
      <h4 className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-[#d5c298]">{title}</h4>
      <div className="divide-y divide-white/[.05]">
        {rows.map(([a, b]) => (
          <div className="grid grid-cols-[130px_1fr] gap-3 py-1.5 text-xs" key={a}>
            <span className="text-[#88857d]">{a}</span>
            <span className="break-words font-medium text-[#f0ede6]">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BookingWizard({
  close,
  rows,
  setRows,
  availability,
  notify
}: {
  close: () => void;
  rows: Booking[];
  setRows: (a: Booking[]) => void;
  availability: Availability;
  notify: (s: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [method, setMethod] = useState('');
  const [delivery, setDelivery] = useState('I will drop them off');
  const [owned, setOwned] = useState<string[]>([]);
  const [needed, setNeeded] = useState<string[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [exact, setExact] = useState<Record<string, string>>({});
  const [budget, setBudget] = useState('');
  const [uses, setUses] = useState<string[]>([]);
  const [games, setGames] = useState('');
  const [resolution, setResolution] = useState('');
  const [fps, setFps] = useState('');
  const [cpu, setCpu] = useState('No preference');
  const [gpu, setGpu] = useState('No preference');
  const [rgb, setRgb] = useState('Some RGB');
  const [style, setStyle] = useState('No preference');
  const [priorities, setPriorities] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('Text Message / WhatsApp');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (arr: string[], setter: (a: string[]) => void, x: string) => {
    setter(arr.includes(x) ? arr.filter((v) => v !== x) : [...arr, x]);
  };

  const uploadPictures = async (userId: string) => {
    if (files.length > 6) throw new Error('Choose no more than 6 photos.');
    const sb = getSupabase();
    if (!sb) return [];
    const paths: string[] = [];
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024) {
        throw new Error('Use JPG, PNG, WEBP, or GIF images under 10 MB each.');
      }
      const path = `${userId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await sb.storage.from('part-photos').upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      paths.push(path);
    }
    return paths;
  };

  const mixed = method === 'I have some parts.';
  const full = method.startsWith('I want SD Deals');
  const already = method === 'I already have all the parts.';
  const dateWeekday = date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }) : '';
  const dateAvailable =
    !!date &&
    new Date(`${date}T23:59:59`).getTime() > Date.now() &&
    availability.availableDays.includes(dateWeekday) &&
    !availability.blockedDates.includes(date) &&
    rows.filter((a) => a.date === date && ['Confirmed', 'Pending Approval'].includes(a.status)).length < availability.maxPerDay;

  const slots = useMemo(
    () =>
      availability.availableHours.filter((t) => {
        const hour =
          Number(t.split(':')[0]) +
          (t.includes('PM') && Number(t.split(':')[0]) !== 12
            ? 12
            : t.includes('AM') && Number(t.split(':')[0]) === 12
            ? -12
            : 0);
        const minute = Number(t.split(':')[1].slice(0, 2));
        const slotDate = new Date(`${date}T00:00:00`);
        slotDate.setHours(hour, minute, 0, 0);
        return (
          slotDate.getTime() > Date.now() &&
          !rows.some((a) => a.date === date && a.time === t && ['Confirmed', 'Pending Approval'].includes(a.status)) &&
          !(availability.unavailableHours[date] || []).includes(t)
        );
      }),
    [availability, rows, date]
  );

  const advance = () => {
    setError('');
    if (step === 1 && !service) return setError('Please choose a service to continue.');
    if (step === 2 && (!date || !time || !dateAvailable || !slots.includes(time))) {
      return setError('Please choose an available date and appointment time slot.');
    }
    if (step === 3 && !method) return setError('Choose how you would like to handle the PC parts.');
    if (step === 3 && mixed && !owned.length && !needed.length) {
      return setError('Choose at least one part you already own or need us to buy.');
    }
    if (step === 5 && (!name.trim() || !/^\S+@\S+\.\S+$/.test(email) || phone.trim().length < 7)) {
      return setError('Enter your full name, valid email address, and phone number.');
    }
    setStep(Math.min(step + 1, 6));
  };

  const input = (value: string, setter: (s: string) => void, placeholder: string, type = 'text') => (
    <input 
      className="field rounded-xl" 
      type={type} 
      value={value} 
      onChange={(e) => setter(e.target.value)} 
      placeholder={placeholder} 
    />
  );

  const selectChoices = (items: string[], selected: string, setter: (s: string) => void) => (
    <div className="flex flex-wrap gap-2">
      {items.map((x) => (
        <Choice key={x} active={selected === x} onClick={() => setter(x)}>
          {x}
        </Choice>
      ))}
    </div>
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step !== 6) return;
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email) || phone.trim().length < 7) {
      setError('Enter your name, valid email, and phone number before submitting.');
      setStep(5);
      return;
    }
    setBusy(true);
    setError('');
    const id = Math.max(1048, ...rows.map((a) => Number(a.id.slice(3)) || 0)) + 1;
    const refNumber = `PC-${id}`;

    // Notificación en segundo plano a WhatsApp
    const sendNotification = async () => {
      try {
        await fetch('/api/appointment-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentRef: refNumber,
            customerName: name,
            phone,
            email,
            service,
            date,
            time,
            partsMethod: method,
            budget: budget || 'Sin especificar',
            delivery,
            notes
          })
        });
      } catch (e) {
        console.warn('Background WhatsApp notify failed:', e);
      }
    };

    try {
      const sb = getSupabase();
      if (sb) {
        try {
          const { data: { user } } = await sb.auth.getUser();
          if (user && user.app_metadata?.role !== 'admin') {
            const paths = await uploadPictures(user.id);
            await sb.from('appointments').insert({
              customer_id: user.id,
              service,
              requested_date: date,
              requested_time: time,
              parts_method: method,
              parts_owned: owned,
              parts_needed: needed,
              part_details: exact,
              budget: budget || null,
              delivery_method: delivery,
              customer_name: name,
              phone,
              email,
              preferred_contact: contact,
              customer_notes: notes,
              pc_preferences: { uses, games, resolution, fps, cpu, gpu, rgb, style, priorities },
              image_paths: paths,
              status: 'Pending Approval'
            });
          }
        } catch (supabaseErr) {
          console.warn('Supabase insert skipped or failed:', supabaseErr);
        }
      }

      // Guardar cita en el estado local del cliente
      setRows([
        {
          id: refNumber,
          name,
          service,
          date,
          time,
          status: 'Pending Approval',
          parts: method,
          budget: budget || '—',
          email,
          notes,
          owned,
          needed,
          exact
        },
        ...rows
      ]);

      void sendNotification();
      setStep(7);
      notify('Appointment request submitted successfully!');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="flex h-[100dvh] w-full max-w-[720px] flex-col overflow-hidden border border-white/10 bg-[#121210] shadow-[0_25px_70px_rgba(0,0,0,0.85)] sm:h-auto sm:max-h-[92vh] sm:rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[.08] bg-[#161614] px-6 py-4 sm:px-8">
          <div>
            <Eye>SD DEALS · SAN DIEGO PC STUDIO</Eye>
            <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-[#fbfaf6]">
              {step === 7 ? 'Request Confirmed' : 'Request PC Appointment'}
            </h2>
          </div>
          <button
            onClick={close}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#1d1d19] text-[#9c9990] transition hover:border-[#b39864]/50 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Header */}
        {step < 7 && (
          <div className="border-b border-white/[.06] bg-[#141412] px-6 py-3.5 sm:px-8">
            <div className="mb-2 flex items-center justify-between sm:hidden">
              <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d5c298]">
                Step {step} of 6
              </span>
              <span className="text-xs font-medium text-white/70">{STEP[step - 1]}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08] sm:hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#b39864] to-[#e4d4b1] transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
            <div className="hidden items-center justify-between sm:flex">
              {STEP.map((x, i) => (
                <div key={x} className="flex flex-1 items-center gap-2">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold transition-all ${
                      step === i + 1
                        ? 'bg-[#b39864] text-[#121210] shadow-[0_0_12px_rgba(179,152,100,0.5)]'
                        : step > i + 1
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/[.05] text-white/40'
                    }`}
                  >
                    {step > i + 1 ? <Check size={12} strokeWidth={3} /> : i + 1}
                  </span>
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      step === i + 1 ? 'text-[#fbfaf6]' : 'text-white/40'
                    }`}
                  >
                    {x}
                  </span>
                  {i < 5 && <span className="mx-2 h-px flex-1 bg-white/[.08]" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Form & Step Content */}
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <>
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-[#f8f6f0]">What service do you need?</h3>
                  <p className="mt-1 text-xs text-[#959288]">
                    Select your service. We manually inspect and tailor every build to your performance goals.
                  </p>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {SERVICES_DATA.map((item) => {
                    const Icon = item.icon;
                    const isSelected = service === item.name;
                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setService(item.name)}
                        className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition duration-200 ${
                          isSelected
                            ? 'border-[#b39864] bg-[#b39864]/12 shadow-[0_0_20px_rgba(179,152,100,0.15)]'
                            : 'border-white/10 bg-[#161614] hover:border-white/25 hover:bg-[#1a1a17]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition ${
                                isSelected
                                  ? 'border-[#b39864] bg-[#b39864] text-[#121210]'
                                  : 'border-white/10 bg-white/[.04] text-[#d5c298] group-hover:border-white/20'
                              }`}
                            >
                              <Icon size={18} />
                            </div>
                            <div>
                              <b className="block text-xs font-semibold text-[#f8f6f0]">{item.name}</b>
                              <span className="text-[10px] font-semibold text-[#b39864]">{item.badge}</span>
                            </div>
                          </div>
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                              isSelected
                                ? 'border-[#b39864] bg-[#b39864] text-[#121210]'
                                : 'border-white/20 bg-white/[.02]'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </span>
                        </div>
                        <small className="mt-3 block text-[11px] leading-relaxed text-[#8a8880]">
                          {item.desc}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <>
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-[#f8f6f0]">Select Date &amp; Time Slot</h3>
                  <p className="mt-1 text-xs text-[#959288]">
                    Choose your preferred appointment. Requests are reviewed personally to prevent double-booking.
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label>Preferred Date</Label>
                    <input
                      className="field rounded-xl cursor-pointer"
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setTime('');
                      }}
                    />
                    <p className="mt-2.5 text-[10px] text-[#868379]">
                      Open Monday – Saturday for San Diego drop-offs and consultations.
                    </p>
                  </div>
                  <div>
                    <Label>Available Time Slots</Label>
                    {!date ? (
                      <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#161614] p-4 text-center text-xs text-[#868379]">
                        <Clock3 size={20} className="mb-2 text-[#b39864]" />
                        Select a date on the left to see available slots.
                      </div>
                    ) : !dateAvailable ? (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/[.06] p-4 text-xs text-rose-200">
                        This date is unavailable or fully booked. Please select an open business day.
                      </div>
                    ) : slots.length ? (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((t) => (
                          <button
                            type="button"
                            key={t}
                            onClick={() => setTime(t)}
                            className={`min-h-[44px] rounded-xl border px-2 py-2.5 text-center text-xs font-semibold transition ${
                              time === t
                                ? 'border-[#b39864] bg-[#b39864] text-[#121210] shadow-[0_0_15px_rgba(179,152,100,0.3)]'
                                : 'border-white/10 bg-[#161614] text-[#b6b3aa] hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-white/10 bg-[#161614] p-4 text-xs text-[#868379]">
                        No open time slots remaining for this date.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#b39864]/20 bg-[#b39864]/[0.06] p-3.5 text-xs text-[#d5c298]">
                  <Clock3 size={18} className="shrink-0" />
                  <span>
                    <strong>Review Guarantee:</strong> Appointments start as Pending Approval. We confirm every scope with you personally.
                  </span>
                </div>
              </>
            )}

            {/* Step 3: Parts & Specifications */}
            {step === 3 && (
              <>
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-[#f8f6f0]">How would you like to handle parts?</h3>
                  <p className="mt-1 text-xs text-[#959288]">
                    No hardware is purchased without your explicit approval of the exact quote.
                  </p>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    'I already have all the parts.',
                    'I have some parts.',
                    'I want SD Deals to help choose the parts.',
                    'I want SD Deals to purchase parts after I approve a quote.'
                  ].map((x) => (
                    <Choice key={x} active={method === x} onClick={() => setMethod(x)}>
                      {x}
                    </Choice>
                  ))}
                </div>

                {method && (
                  <div className="mt-6 space-y-6 rounded-2xl border border-white/[.08] bg-[#161614] p-5 sm:p-6">
                    {mixed ? (
                      <>
                        <div>
                          <Label>Parts you already own</Label>
                          <Multi items={PARTS} values={owned} toggle={(x) => toggle(owned, setOwned, x)} />
                        </div>
                        {owned.length > 0 && (
                          <PartDetails
                            parts={owned}
                            unknown={unknown}
                            setUnknown={setUnknown}
                            exact={exact}
                            setExact={setExact}
                            files={files}
                            setFiles={setFiles}
                            setError={setError}
                          />
                        )}
                        <div>
                          <Label>Parts you need SD Deals to source</Label>
                          <Multi items={BUY} values={needed} toggle={(x) => toggle(needed, setNeeded, x)} />
                        </div>
                        <Budget budget={budget} setBudget={setBudget} />
                      </>
                    ) : full ? (
                      <>
                        <Budget budget={budget} setBudget={setBudget} />
                        <div>
                          <Label>Intended PC Uses</Label>
                          <Multi items={USES} values={uses} toggle={(x) => toggle(uses, setUses, x)} />
                        </div>
                        <div>
                          <Label>Target Games or Software (optional)</Label>
                          {input(games, setGames, 'e.g. Call of Duty Warzone, Cyberpunk 2077, Blender, Premiere Pro')}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label>Target Resolution</Label>
                            {selectChoices(['1080p', '1440p 2K', '4K Ultra', "I'm not sure"], resolution, setResolution)}
                          </div>
                          <div>
                            <Label>Target Frame Rate</Label>
                            {selectChoices(['60 FPS', '120-144 FPS', '240 FPS+', 'Best for budget'], fps, setFps)}
                          </div>
                        </div>

                        <details className="rounded-xl border border-white/[.08] bg-[#11110f] p-4">
                          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-[#d5c298]">
                            Aesthetic &amp; Hardware Preferences (Optional)
                          </summary>
                          <div className="mt-4 grid gap-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <Label>CPU Preference</Label>
                                {selectChoices(['AMD Ryzen', 'Intel Core', 'No preference'], cpu, setCpu)}
                              </div>
                              <div>
                                <Label>GPU Preference</Label>
                                {selectChoices(['NVIDIA GeForce', 'AMD Radeon', 'No preference'], gpu, setGpu)}
                              </div>
                              <div>
                                <Label>Lighting Style</Label>
                                {selectChoices(['RGB Lighting', 'Stealth No RGB', 'Subtle Ambient'], rgb, setRgb)}
                              </div>
                              <div>
                                <Label>Chassis Theme</Label>
                                {selectChoices(['Pure Black', 'Pure White', 'Glass Aquarium', 'Small ITX'], style, setStyle)}
                              </div>
                            </div>
                            <div>
                              <Label>Top Priorities (Select any)</Label>
                              <Multi items={PRIORITIES} values={priorities} toggle={(x) => toggle(priorities, setPriorities, x)} />
                            </div>
                          </div>
                        </details>
                      </>
                    ) : (
                      <>
                        {already && (
                          <div className="rounded-xl border border-white/10 bg-[#11110f] p-4 text-xs text-[#a4a198]">
                            Bring all your components to your San Diego studio appointment. We will inspect, benchmark, and verify fitment before assembly.
                          </div>
                        )}
                        <PartDetails
                          parts={PARTS}
                          unknown={unknown}
                          setUnknown={setUnknown}
                          exact={exact}
                          setExact={setExact}
                          files={files}
                          setFiles={setFiles}
                          setError={setError}
                        />
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Step 4: Delivery / Handoff */}
            {step === 4 && (
              <>
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-[#f8f6f0]">How will you deliver your PC or parts?</h3>
                  <p className="mt-1 text-xs text-[#959288]">
                    We coordinate secure, private drop-off and pickup across San Diego.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { title: 'I will drop them off', desc: 'San Diego studio drop-off by appointment' },
                    { title: 'I will ship them', desc: 'Direct shipping with tracking verification' },
                    { title: 'I need another arrangement', desc: 'Custom courier or doorstep pickup' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.title}
                      onClick={() => setDelivery(item.title)}
                      className={`rounded-xl border p-4 text-left transition ${
                        delivery === item.title
                          ? 'border-[#b39864] bg-[#b39864]/15 text-white shadow-[0_0_15px_rgba(179,152,100,0.18)]'
                          : 'border-white/10 bg-[#161614] text-[#939088] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <b className="block text-xs font-semibold text-[#f8f6f0]">{item.title}</b>
                      <small className="mt-1 block text-[10px] text-[#7d7a72]">{item.desc}</small>
                    </button>
                  ))}
                </div>

                {delivery.includes('ship') && (
                  <div className="mt-5 rounded-xl border border-sky-400/20 bg-sky-400/[.05] p-4 text-xs leading-relaxed text-[#b5c7d8]">
                    <b className="font-semibold text-sky-200">Shipping Instructions:</b>
                    <p className="mt-1">
                      {availability.shippingAddress || 'Our verified studio shipping address will be sent to your email upon appointment approval.'}
                    </p>
                    <p className="mt-1 text-[11px] text-white/50">
                      Please pack GPU and tempered glass panels separately with adequate cushioning.
                    </p>
                  </div>
                )}

                {delivery.includes('arrangement') && (
                  <div className="mt-5">
                    <Label>Special Arrangement Details</Label>
                    <textarea
                      className="field min-h-24 rounded-xl"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify your location, preferred courier, or courier handoff requirements..."
                    />
                  </div>
                )}
              </>
            )}

            {/* Step 5: Contact Details */}
            {step === 5 && (
              <>
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-[#f8f6f0]">Your Contact Information</h3>
                  <p className="mt-1 text-xs text-[#959288]">
                    We will get in touch via your preferred channel to confirm the appointment.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Full Name *</Label>
                    {input(name, setName, 'e.g. Alex Johnson')}
                  </div>
                  <div>
                    <Label>Phone / WhatsApp *</Label>
                    {input(phone, setPhone, '(619) 000-0000', 'tel')}
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    {input(email, setEmail, 'alex@example.com', 'email')}
                  </div>
                  <div>
                    <Label>Preferred Contact Channel</Label>
                    <select
                      className="field rounded-xl"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    >
                      {['Text Message / WhatsApp', 'Phone Call', 'Email'].map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Additional notes or questions (Optional)</Label>
                    <textarea
                      className="field min-h-24 rounded-xl"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific symptoms, requested aesthetic, questions, or urgency details..."
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 6: Review & Submit */}
            {step === 6 && (
              <>
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-[#f8f6f0]">Review Appointment Request</h3>
                  <p className="mt-1 text-xs text-[#959288]">
                    Review the details below. Once submitted, we will inspect your request and confirm the slot.
                  </p>
                </div>
                <div className="space-y-3.5">
                  <ReviewSection
                    title="Service & Appointment"
                    rows={[
                      ['Selected Service', service],
                      ['Requested Date', date],
                      ['Requested Time', time],
                      ['Status', 'Pending Approval (No instant charge)']
                    ]}
                  />
                  <ReviewSection
                    title="Components & Delivery"
                    rows={[
                      ['Parts Plan', method],
                      [
                        'Parts Owned',
                        owned.length
                          ? owned.map((p) => `${p}${exact[p] ? `: ${exact[p]}` : ''}`).join(', ')
                          : Object.entries(exact)
                              .filter(([, v]) => v)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ') || 'None specified'
                      ],
                      ['Parts to Buy', needed.join(', ') || 'None'],
                      ['Budget', budget || 'Not specified'],
                      ['Handoff', delivery]
                    ]}
                  />
                  {full && (
                    <ReviewSection
                      title="Build Specifications"
                      rows={[
                        ['Intended Uses', uses.join(', ') || '—'],
                        ['Target Games', games || '—'],
                        ['Resolution & FPS', `${resolution || '—'} @ ${fps || '—'}`],
                        ['Hardware Pref', `${cpu} / ${gpu}`],
                        ['Theme & Lighting', `${style} · ${rgb}`],
                        ['Priorities', priorities.join(', ') || '—']
                      ]}
                    />
                  )}
                  <ReviewSection
                    title="Customer Contact"
                    rows={[
                      ['Full Name', name],
                      ['Phone', phone],
                      ['Email', email],
                      ['Preferred Contact', contact],
                      ['Notes', notes || '—']
                    ]}
                  />
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#b39864]/30 bg-[#b39864]/10 p-4 text-xs text-[#d5c298]">
                  <ShieldCheck size={20} className="shrink-0 text-[#b39864]" />
                  <div>
                    <strong className="block font-semibold">100% Upfront Transparency</strong>
                    <span className="text-[#a8a59c]">
                      No card charged online. SD Deals will reach out to verify components, compatibility, and timing.
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Step 7: Completed Success State */}
            {step === 7 && (
              <div className="py-12 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                  <CheckCircle2 size={32} />
                </span>
                <p className="mt-6 text-xs font-bold tracking-[.25em] text-emerald-400 uppercase">
                  REQUEST TRANSMITTED
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Appointment Request Sent!
                </h3>
                <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-[#a4a198]">
                  Your appointment is currently <b className="text-[#d5c298]">Pending Approval</b>. We are reviewing your build details and will reach out via WhatsApp / Email shortly.
                </p>
                <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/10 bg-[#161614] p-5 text-left shadow-lg">
                  <span className="text-[10px] font-bold tracking-wider text-[#868379] uppercase">
                    REFERENCE NUMBER
                  </span>
                  <b className="mt-1 block text-lg font-mono text-[#d5c298]">
                    #PC-{1048 + rows.length}
                  </b>
                  <div className="mt-3 border-t border-white/[.08] pt-3 text-xs text-[#bbb7ad]">
                    {service} · {date} at {time}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="sd-button sd-button-gold mt-8 min-h-[46px] px-8 text-xs font-bold"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          {(error || step < 7) && (
            <div className="shrink-0 border-t border-white/[.08] bg-[#141412] px-6 py-4 sm:px-8">
              {error && (
                <div
                  role="alert"
                  className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-200"
                >
                  {error}
                </div>
              )}
              {step < 7 && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => (step === 1 ? close() : setStep(step - 1))}
                    className="min-h-[44px] rounded-xl border border-white/10 px-5 text-xs font-semibold text-[#8e8b82] transition hover:border-white/20 hover:text-white"
                  >
                    {step === 1 ? 'Cancel' : '← Back'}
                  </button>
                  {step < 6 ? (
                    <button
                      type="button"
                      onClick={advance}
                      className="sd-button sd-button-gold min-h-[44px] flex-1 rounded-xl px-6 text-xs font-bold sm:flex-none"
                    >
                      Continue <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      disabled={busy}
                      className="sd-button sd-button-gold min-h-[44px] flex-1 rounded-xl px-6 text-xs font-bold disabled:opacity-50 sm:flex-none"
                    >
                      {busy ? 'Transmitting…' : 'Request Appointment'} <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function PartDetails({
  parts,
  unknown,
  setUnknown,
  exact,
  setExact,
  files,
  setFiles,
  setError
}: {
  parts: string[];
  unknown: string[];
  setUnknown: (v: string[]) => void;
  exact: Record<string, string>;
  setExact: (v: Record<string, string>) => void;
  files: File[];
  setFiles: (v: File[]) => void;
  setError: (v: string) => void;
}) {
  const toggleUnknown = (part: string) =>
    setUnknown(unknown.includes(part) ? unknown.filter((x) => x !== part) : [...unknown, part]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Specific Part Models (Optional)</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {parts.map((p) => (
            <div className="flex items-center gap-2" key={p}>
              <span className="w-24 shrink-0 text-xs text-[#959288]">{p}</span>
              <input
                disabled={unknown.includes(p)}
                className="field py-2 text-xs rounded-xl"
                placeholder={unknown.includes(p) ? 'Unknown model' : `${p} model...`}
                value={exact[p] || ''}
                onChange={(e) => setExact({ ...exact, [p]: e.target.value })}
              />
              <button
                type="button"
                aria-label={`Mark ${p} model as unknown`}
                onClick={() => toggleUnknown(p)}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-xs font-bold transition ${
                  unknown.includes(p) ? 'border-[#b39864] bg-[#b39864]/20 text-[#d5c298]' : 'border-white/10 text-white/50'
                }`}
              >
                ?
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>Upload Part or Case Photos (Optional)</Label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#11110f] p-3.5 text-xs text-[#928f87] transition hover:border-[#b39864]/50">
          <Package size={18} className="text-[#b39864]" />
          <span>
            {files.length
              ? `${files.length} of 6 photo(s) selected`
              : 'Choose up to 6 photos · PNG, JPG, WEBP · max 10 MB each'}
          </span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const chosen = Array.from(e.target.files || []);
              const valid = chosen.filter(
                (f) =>
                  f.size <= 10 * 1024 * 1024 &&
                  ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)
              );
              setFiles(valid.slice(0, 6));
              if (chosen.length > 6 || valid.length !== chosen.length) {
                setError('Photos are limited to 6 images (under 10 MB each).');
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}

function Budget({ budget, setBudget }: { budget: string; setBudget: (s: string) => void }) {
  return (
    <div>
      <Label>Estimated Hardware Budget</Label>
      <div className="flex flex-wrap gap-2">
        {['$600', '$1,000', '$1,500', '$2,000', '$3,000+'].map((x) => (
          <Choice key={x} active={budget === x} onClick={() => setBudget(x)}>
            {x}
          </Choice>
        ))}
      </div>
      <input
        className="field mt-3 max-w-[240px] rounded-xl"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        placeholder="Or type custom budget (e.g. $1,800)"
      />
    </div>
  );
}
