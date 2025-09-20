-- Create admin users in Supabase Auth
-- Note: These need to be created through Supabase Auth, not directly in database
-- This script documents the admin accounts that should be created

-- Admin Account 1: Tournament Director
-- Email: admin@tournament.com
-- Password: Tournament2024!
-- Role: Super Admin

-- Admin Account 2: Score Keeper
-- Email: scorekeeper@tournament.com  
-- Password: Scores2024!
-- Role: Score Entry Admin

-- Admin Account 3: Match Manager
-- Email: matchmanager@tournament.com
-- Password: Matches2024!
-- Role: Match Management Admin

-- Instructions for creating admin accounts:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add user" and create accounts with the above credentials
-- 4. Or use the sign-up page at /auth/sign-up to create these accounts
-- 5. All registered users have admin access to the tournament system

-- Alternative: Create a profiles table to manage user roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
