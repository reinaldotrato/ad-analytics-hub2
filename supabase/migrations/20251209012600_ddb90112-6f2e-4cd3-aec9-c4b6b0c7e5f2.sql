-- Enable RLS on tryvia_analytics_clients
ALTER TABLE public.tryvia_analytics_clients ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert new clients (for signup)
CREATE POLICY "Allow authenticated users to insert clients"
ON public.tryvia_analytics_clients
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to view all clients
CREATE POLICY "Allow authenticated users to view clients"
ON public.tryvia_analytics_clients
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to update clients
CREATE POLICY "Admins can update clients"
ON public.tryvia_analytics_clients
FOR UPDATE
TO authenticated
USING (has_analytics_role(auth.uid(), 'admin'::analytics_role))
WITH CHECK (has_analytics_role(auth.uid(), 'admin'::analytics_role));

-- Allow admins to delete clients
CREATE POLICY "Admins can delete clients"
ON public.tryvia_analytics_clients
FOR DELETE
TO authenticated
USING (has_analytics_role(auth.uid(), 'admin'::analytics_role));

-- Enable RLS on tryvia_analytics_profiles
ALTER TABLE public.tryvia_analytics_profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert profiles (for signup)
CREATE POLICY "Allow authenticated to insert own profile"
ON public.tryvia_analytics_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to view own profile
CREATE POLICY "Users can view own profile"
ON public.tryvia_analytics_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR has_analytics_role(auth.uid(), 'admin'::analytics_role));

-- Allow users to update own profile
CREATE POLICY "Users can update own profile"
ON public.tryvia_analytics_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON public.tryvia_analytics_profiles
FOR ALL
TO authenticated
USING (has_analytics_role(auth.uid(), 'admin'::analytics_role))
WITH CHECK (has_analytics_role(auth.uid(), 'admin'::analytics_role));