import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log('--- USERS TABLE ---');
    const { data: users, error: uErr } = await supabase.from('users').select('*').limit(1);
    if (uErr) console.error('Users fetch error:', uErr);
    else console.log('Users columns:', Object.keys(users[0] || {}));

    console.log('\n--- EVENTS TABLE ---');
    const { data: events, error: eErr } = await supabase.from('events').select('*').limit(1);
    if (eErr) console.error('Events fetch error:', eErr);
    else console.log('Events columns:', Object.keys(events[0] || {}));
}

checkSchema();
