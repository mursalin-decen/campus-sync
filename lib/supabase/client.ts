import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing in .env.local");
    }

    if (!supabaseKey) {
        throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in .env.local");
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseKey
    );
}