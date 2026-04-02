import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sql = `
-- Lost Places table for storing exploration locations
CREATE TABLE IF NOT EXISTS public.lostplaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('industrie', 'haus', 'bunker', 'krankenhaus', 'kirche', 'sonstiges')),
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('einfach', 'moderat', 'schwer')),
  terrain TEXT NOT NULL CHECK (terrain IN ('einfach', 'moderat', 'schwer')),
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security but allow public access (password protected at app level)
ALTER TABLE public.lostplaces ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anonymous users (app-level password protection)
CREATE POLICY "Allow public read access" ON public.lostplaces FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.lostplaces FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.lostplaces FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.lostplaces FOR DELETE USING (true);

-- Insert test data
INSERT INTO public.lostplaces (name, category, description, latitude, longitude, difficulty, terrain, images) VALUES
('TestIndustrie', 'industrie', 'Ein verlassenes Industriegebäude aus den 1950er Jahren. Vorsicht vor losen Böden und rostigen Strukturen.', 48.2082, 16.3738, 'moderat', 'moderat', ARRAY['https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800']),
('TestHaus', 'haus', 'Verlassenes Wohnhaus am Stadtrand. Teilweise eingestürzte Decken.', 47.8095, 13.0550, 'einfach', 'einfach', ARRAY['https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800']),
('TestBunker', 'bunker', 'Alter Weltkriegsbunker mit mehreren Etagen. Taschenlampe erforderlich!', 48.3069, 14.2858, 'schwer', 'schwer', ARRAY['https://images.unsplash.com/photo-1565711561500-49678a10a63f?w=800'])
ON CONFLICT DO NOTHING;
`;

async function initDb() {
  try {
    const { error } = await supabase.rpc('exec', {
      sql_string: sql
    }).catch(async () => {
      // If exec RPC doesn't exist, try direct SQL execution
      console.log('[v0] Trying direct SQL execution...');
      return await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify({ sql_string: sql })
      }).then(r => r.json());
    });

    if (error) {
      console.error('[v0] Error:', error);
      process.exit(1);
    }

    console.log('[v0] Database initialized successfully with 3 test records');
    process.exit(0);
  } catch (err) {
    console.error('[v0] Error initializing database:', err);
    process.exit(1);
  }
}

initDb();
