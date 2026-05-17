const SUPABASE_URL = 'https://evmwuvjgokkxxnckhiyc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NZui1kNw6Dlczyu-KdstEw_jWxWkdQQ';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// V13.18 - Notificaciones push opcionales.
// Para push real con la app cerrada, genera VAPID keys, pega la pública aquí
// y despliega la Edge Function incluida en supabase/functions/send-shared-invite-push.
window.CUENTA_CLARA_PUBLIC_VAPID_KEY = '';
window.CUENTA_CLARA_PUSH_FUNCTION_NAME = 'send-shared-invite-push';
