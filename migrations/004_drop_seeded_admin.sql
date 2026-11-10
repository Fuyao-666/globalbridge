create table if not exists register_limits (
  bucket text primary key,
  hits integer not null,
  window_started timestamptz not null
);

delete from sessions where account_id = 'acc_fuyaoadmin';
delete from credit_requests where account_id = 'acc_fuyaoadmin';
delete from credit_accounts where account_id = 'acc_fuyaoadmin';
delete from learner_profiles where account_id = 'acc_fuyaoadmin';
delete from accounts where id = 'acc_fuyaoadmin' and role = 'superadmin';
