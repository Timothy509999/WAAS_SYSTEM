CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_authed" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Trigger: when a new message is sent, create a notification for the recipient
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  sender_name text;
BEGIN
  SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
  INSERT INTO public.notifications (user_id, title, body, type, link)
  VALUES (NEW.recipient_id, 'New message from ' || COALESCE(sender_name, 'Someone'),
          LEFT(NEW.body, 140), 'message', '/messages');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_message_notify AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

-- Trigger: when an assignment is created, notify all enrolled students
CREATE OR REPLACE FUNCTION public.notify_on_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  course_title text;
BEGIN
  SELECT title INTO course_title FROM public.courses WHERE id = NEW.course_id;
  INSERT INTO public.notifications (user_id, title, body, type, link)
  SELECT e.student_id,
         'New assignment: ' || NEW.title,
         'Posted in ' || COALESCE(course_title, 'your course'),
         'assignment', '/assessments'
  FROM public.enrollments e WHERE e.course_id = NEW.course_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_assignment_notify AFTER INSERT ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_assignment();

-- Trigger: when an announcement is posted, notify everyone (or course members)
CREATE OR REPLACE FUNCTION public.notify_on_announcement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.course_id IS NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    SELECT p.id, 'Announcement: ' || NEW.title, LEFT(NEW.body, 140), 'announcement', '/dashboard'
    FROM public.profiles p WHERE p.id <> NEW.author_id;
  ELSE
    INSERT INTO public.notifications (user_id, title, body, type, link)
    SELECT e.student_id, 'Announcement: ' || NEW.title, LEFT(NEW.body, 140), 'announcement', '/dashboard'
    FROM public.enrollments e WHERE e.course_id = NEW.course_id AND e.student_id <> NEW.author_id;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_announcement_notify AFTER INSERT ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_announcement();