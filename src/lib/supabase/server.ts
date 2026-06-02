import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Supabase client for use in Server Components, Route Handlers and Server Actions. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In Server Components `set` can throw; safe to ignore when there is
          // middleware refreshing sessions (added when we wire up auth).
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* no-op */
          }
        },
      },
    },
  );
}
