-- Services table
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes integer not null,
  price decimal(10,2) not null,
  category text default 'haircut' check (category in ('haircut', 'beard', 'styling', 'treatment', 'package')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Staff table
create table if not exists public.staff (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id text unique not null,
  hire_date date not null,
  hourly_rate decimal(10,2),
  commission_rate decimal(5,2) default 0.00,
  specialties text[],
  is_active boolean default true,
  schedule jsonb, -- Store weekly schedule
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Customers table (extends profiles)
create table if not exists public.customers (
  id uuid primary key references public.profiles(id) on delete cascade,
  preferred_barber_id uuid references public.staff(id),
  hair_type text,
  allergies text,
  notes text,
  loyalty_points integer default 0,
  total_visits integer default 0,
  total_spent decimal(10,2) default 0.00,
  last_visit_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appointments table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  barber_id uuid not null references public.staff(id),
  service_id uuid not null references public.services(id),
  appointment_date timestamp with time zone not null,
  duration_minutes integer not null,
  status text default 'scheduled' check (status in ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  price decimal(10,2) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Time tracking table
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id),
  clock_in timestamp with time zone not null,
  clock_out timestamp with time zone,
  break_minutes integer default 0,
  total_hours decimal(4,2),
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payroll table
create table if not exists public.payroll (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id),
  pay_period_start date not null,
  pay_period_end date not null,
  regular_hours decimal(6,2) default 0.00,
  overtime_hours decimal(6,2) default 0.00,
  commission_amount decimal(10,2) default 0.00,
  tips_amount decimal(10,2) default 0.00,
  gross_pay decimal(10,2) not null,
  tax_deductions decimal(10,2) default 0.00,
  other_deductions decimal(10,2) default 0.00,
  net_pay decimal(10,2) not null,
  status text default 'pending' check (status in ('pending', 'processed', 'paid')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;
alter table public.time_entries enable row level security;
alter table public.payroll enable row level security;
