-- Update the RLS policies for the subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow service role to manage subscriptions" ON public.subscriptions;

-- Create new policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users" ON public.subscriptions
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add a policy to allow the service role to manage subscriptions
CREATE POLICY "Allow service role to manage subscriptions" ON public.subscriptions
FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

