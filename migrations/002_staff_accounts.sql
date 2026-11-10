alter table accounts drop constraint if exists accounts_role_check;
alter table accounts add constraint accounts_role_check check (role in ('learner', 'admin', 'superadmin'));

alter table accounts add column if not exists username text;
create unique index if not exists accounts_username_key on accounts (username);

create table if not exists auth_attempts (
  bucket text primary key,
  failures integer not null default 0,
  locked_until timestamptz
);
