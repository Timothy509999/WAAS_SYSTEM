do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'courses_lecturer_id_fkey') then
    alter table public.courses
      add constraint courses_lecturer_id_fkey foreign key (lecturer_id) references public.profiles(id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'enrollments_course_id_fkey') then
    alter table public.enrollments
      add constraint enrollments_course_id_fkey foreign key (course_id) references public.courses(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'enrollments_student_id_fkey') then
    alter table public.enrollments
      add constraint enrollments_student_id_fkey foreign key (student_id) references public.profiles(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'assignments_course_id_fkey') then
    alter table public.assignments
      add constraint assignments_course_id_fkey foreign key (course_id) references public.courses(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'submissions_assignment_id_fkey') then
    alter table public.submissions
      add constraint submissions_assignment_id_fkey foreign key (assignment_id) references public.assignments(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'submissions_student_id_fkey') then
    alter table public.submissions
      add constraint submissions_student_id_fkey foreign key (student_id) references public.profiles(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'announcements_author_id_fkey') then
    alter table public.announcements
      add constraint announcements_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'announcements_course_id_fkey') then
    alter table public.announcements
      add constraint announcements_course_id_fkey foreign key (course_id) references public.courses(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'materials_course_id_fkey') then
    alter table public.materials
      add constraint materials_course_id_fkey foreign key (course_id) references public.courses(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'materials_uploaded_by_fkey') then
    alter table public.materials
      add constraint materials_uploaded_by_fkey foreign key (uploaded_by) references public.profiles(id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'messages_sender_id_fkey') then
    alter table public.messages
      add constraint messages_sender_id_fkey foreign key (sender_id) references public.profiles(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'messages_recipient_id_fkey') then
    alter table public.messages
      add constraint messages_recipient_id_fkey foreign key (recipient_id) references public.profiles(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notifications_user_id_fkey') then
    alter table public.notifications
      add constraint notifications_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'user_roles_user_id_fkey') then
    alter table public.user_roles
      add constraint user_roles_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_courses_lecturer_id on public.courses(lecturer_id);
create index if not exists idx_enrollments_course_id on public.enrollments(course_id);
create index if not exists idx_enrollments_student_id on public.enrollments(student_id);
create index if not exists idx_assignments_course_id on public.assignments(course_id);
create index if not exists idx_submissions_assignment_id on public.submissions(assignment_id);
create index if not exists idx_submissions_student_id on public.submissions(student_id);
create index if not exists idx_announcements_course_id on public.announcements(course_id);
create index if not exists idx_materials_course_id on public.materials(course_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_recipient_id on public.messages(recipient_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

create trigger messages_notify_after_insert
after insert on public.messages
for each row execute function public.notify_on_message();

create trigger assignments_notify_after_insert
after insert on public.assignments
for each row execute function public.notify_on_assignment();

create trigger announcements_notify_after_insert
after insert on public.announcements
for each row execute function public.notify_on_announcement();