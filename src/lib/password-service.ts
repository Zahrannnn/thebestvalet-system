import { supabase } from "@/integrations/supabase/client";

export interface Password {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}


export async function getPasswordByKey(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("passwords")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) {
    console.error("Error fetching password:", error);
    return null;
  }

  return data.value;
}


export async function getAllPasswords(): Promise<Password[]> {
  const { data, error } = await supabase
    .from("passwords")
    .select("*")
    .order("key");

  if (error || !data) {
    console.error("Error fetching passwords:", error);
    return [];
  }

  return data;
}

export async function updatePassword(key: string, value: string): Promise<boolean> {
  const { error } = await supabase
    .from("passwords")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) {
    console.error("Error updating password:", error);
    return false;
  }

  return true;
}


export async function verifyPassword(key: string, inputPassword: string): Promise<boolean> {
  const correctPassword = await getPasswordByKey(key);
  return correctPassword === inputPassword;
} 