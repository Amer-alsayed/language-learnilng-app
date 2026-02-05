'use server';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginWithKey(prevState: any, formData: FormData) {
    const key = formData.get("accessKey") as string;

    if (!key) {
        return { error: "Access Key is required" };
    }

    const supabase = await createClient();
    const email = `${key}@german-mastery.student`;
    const password = key;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        // We return a generic error to not leak if key exists or not (security best practice),
        // though for this specific app 'Invalid Access Key' is fine.
        return { error: "Invalid Access Key. Please check your key and try again." };
    }

    redirect("/dashboard");
}
