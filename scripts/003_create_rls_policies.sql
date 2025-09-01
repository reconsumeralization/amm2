-- Services policies (public read, admin/manager write)
create policy "services_select_all"
  on public.services for select
  using (true);

create policy "services_insert_admin"
  on public.services for insert
  with check (exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'manager')
  ));

create policy "services_update_admin"
  on public.services for update
  using (exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'manager')
  ));

-- Staff policies
create policy "staff_select_all"
  on public.staff for select
  using (auth.uid() = id or exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'manager')
  ));

create policy "staff_insert_admin"
  on public.staff for insert
  with check (exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'manager')
  ));

create policy "staff_update_own_or_admin"
  on public.staff for update
  using (auth.uid() = id or exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'manager')
  ));

-- Customers policies
create policy "customers_select_own_or_staff"
  on public.customers for select
  using (auth.uid() = id or exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'manager', 'barber')
  ));

create policy "customers_insert_own"
  on public.customers for insert
  with check (auth.uid() = id);

create policy "customers_update_own_or_staff"
  on public.customers for update
  using (auth.uid() = id or exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'manager', 'barber')
  ));

-- Appointments policies
create policy "appointments_select_related"
  on public.appointments for select
  using (
    customer_id = auth.uid() or 
    barber_id = auth.uid() or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

create policy "appointments_insert_staff_or_customer"
  on public.appointments for insert
  with check (
    customer_id = auth.uid() or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'manager', 'barber')
    )
  );

create policy "appointments_update_staff"
  on public.appointments for update
  using (
    barber_id = auth.uid() or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- Time entries policies
create policy "time_entries_select_own_or_admin"
  on public.time_entries for select
  using (
    staff_id = auth.uid() or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

create policy "time_entries_insert_own"
  on public.time_entries for insert
  with check (staff_id = auth.uid());

create policy "time_entries_update_own_or_admin"
  on public.time_entries for update
  using (
    staff_id = auth.uid() or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- Payroll policies (admin/manager only)
create policy "payroll_select_own_or_admin"
  on public.payroll for select
  using (
    staff_id = auth.uid() or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

create policy "payroll_insert_admin"
  on public.payroll for insert
  with check (exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'manager')
  ));

create policy "payroll_update_admin"
  on public.payroll for update
  using (exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'manager')
  ));
