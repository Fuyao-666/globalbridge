create table if not exists accounts (
  id text primary key,
  email text not null unique,
  name text not null,
  role text not null check (role in ('learner', 'admin')),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  account_id text not null references accounts (id),
  expires_at timestamptz not null
);

create index if not exists sessions_account_id_idx on sessions (account_id);
