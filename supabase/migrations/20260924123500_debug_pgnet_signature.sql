-- Temporary introspection view to find pg_net's actual http_post signature
-- (dropped again in the next migration once used).
create or replace view public.debug_pgnet_signature as
select
  p.proname,
  n.nspname as schema,
  pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname in ('http_post', 'http_get')
  and n.nspname in ('extensions', 'net');
