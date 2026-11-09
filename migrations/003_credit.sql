create table if not exists credit_accounts (
  account_id text primary key references accounts (id),
  balance numeric not null default 500000,
  updated_at timestamptz not null default now()
);

create table if not exists credit_requests (
  id text primary key,
  account_id text not null references accounts (id),
  amount numeric not null,
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  granted numeric,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists credit_requests_account_idx on credit_requests (account_id, status);

create table if not exists learner_profiles (
  account_id text primary key references accounts (id),
  lessons_done integer not null default 0,
  sim_day integer not null default 0,
  revenue numeric not null default 0,
  orders integer not null default 0,
  profit numeric not null default 0,
  purchases integer not null default 0,
  custom jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

insert into credit_accounts (account_id, balance)
select id, 500000 from accounts where role = 'learner'
on conflict (account_id) do nothing;

insert into learner_profiles (account_id)
select id from accounts where role = 'learner'
on conflict (account_id) do nothing;
