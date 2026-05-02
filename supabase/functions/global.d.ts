declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  import { SupabaseClient } from "@supabase/supabase-js";
  export function createClient(supabaseUrl: string, supabaseKey: string, options?: any): SupabaseClient;
}
