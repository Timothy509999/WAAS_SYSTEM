revoke execute on function public.notify_on_assignment() from anon, authenticated;
revoke execute on function public.notify_on_announcement() from anon, authenticated;
revoke execute on function public.notify_on_message() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from anon;
revoke execute on function public.get_my_role() from anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.get_my_role() to authenticated;