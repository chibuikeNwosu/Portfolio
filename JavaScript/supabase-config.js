const SUPABASE_URL = "https://edesmkmnhxmkosbuolzv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_vjQcI7aEIn9F7ipKZlTnOA_AXwDQ_LJ";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);
