-- Auto-create a profiles row whenever a new user signs up via Supabase auth

create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, suburb, verification_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Anonymous'),
    coalesce(new.raw_user_meta_data->>'suburb', 'Muizenberg'),
    'unverified'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();
