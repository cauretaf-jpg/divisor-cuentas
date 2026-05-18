const SUPABASE_URL = 'https://evmwuvjgokkxxnckhiyc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NZui1kNw6Dlczyu-KdstEw_jWxWkdQQ';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// V13.18.5 - Configuración opcional de avisos del celular.
// Mantener vacío si solo se usarán avisos dentro de la app.
window.CUENTA_CLARA_PUBLIC_VAPID_KEY = '';
window.CUENTA_CLARA_PUSH_FUNCTION_NAME = 'send-shared-invite-push';
