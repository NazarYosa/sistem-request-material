import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://njgbbxgyhtrqtdmqcmtz.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ2JieGd5aHRycXRkbXFjbXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNDgwMzEsImV4cCI6MjEwMDkyNDAzMX0.Lob5BNkIHm9ZYEKwVqhYhJ44-8N0Nk4fHkRboFRAsH0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);