-- Drop only the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view all progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admins can manage all plans" ON public.user_plans;

-- Create admin function that doesn't cause recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new admin policies using the function
CREATE POLICY "Admins can manage all messages" ON public.contact_messages
FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all progress" ON public.lesson_progress
FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all payments" ON public.payments
FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all attempts" ON public.quiz_attempts
FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all plans" ON public.user_plans
FOR ALL USING (public.is_admin());