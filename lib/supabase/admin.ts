import { createClient } from "@supabase/supabase-js";

/**
 * Admin client using service role key — NEVER import in client-side code.
 * Only use in server components, server actions, and API routes.
 */
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
