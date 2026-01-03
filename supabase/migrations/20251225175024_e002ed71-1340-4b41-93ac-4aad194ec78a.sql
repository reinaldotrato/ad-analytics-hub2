-- Drop existing RLS policies for crm_tasks to recreate with seller-specific access
DROP POLICY IF EXISTS "Users can view tasks of their client" ON crm_tasks;
DROP POLICY IF EXISTS "Sellers can view own tasks" ON crm_tasks;

-- Create new policy: crm_users only see their own tasks, admins/crm_admins see all
CREATE POLICY "Users can view tasks of their client" ON crm_tasks
FOR SELECT TO authenticated
USING (
  -- Admins, analysts, and crm_admins can see all tasks for the client
  (
    has_analytics_role(auth.uid(), 'admin'::analytics_role) OR
    has_analytics_role(auth.uid(), 'analyst'::analytics_role) OR
    has_analytics_role(auth.uid(), 'crm_admin'::analytics_role)
  )
  OR
  -- crm_users can only see tasks assigned to them (or unassigned tasks)
  (
    has_crm_client_access(auth.uid(), client_id) AND
    (
      assigned_to_id = auth.uid() OR
      assigned_to_id IS NULL
    )
  )
);