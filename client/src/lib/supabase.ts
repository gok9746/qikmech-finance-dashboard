import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Mock user context for prototype
export const mockUser = {
  id: '1',
  email: 'admin@qikmech.com',
  role: 'admin' as const,
  full_name: 'John Smith',
};

// TODO: remove mock functionality - replace with real Supabase auth
export const getMockUserRole = () => mockUser.role;
export const getMockUser = () => mockUser;