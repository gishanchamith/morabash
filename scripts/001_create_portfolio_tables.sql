-- Create projects table for portfolio items
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  image_url TEXT,
  gallery_images TEXT[],
  project_url TEXT,
  github_url TEXT,
  featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  achievements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create education table
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  grade TEXT,
  description TEXT,
  activities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_messages table for contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no authentication required for viewing)
CREATE POLICY "Allow public read access to projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access to skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Allow public read access to experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Allow public read access to education" ON education FOR SELECT USING (true);

-- Admin policies (for now, allow all operations without authentication as requested)
CREATE POLICY "Allow admin insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete projects" ON projects FOR DELETE USING (true);

CREATE POLICY "Allow admin insert skills" ON skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update skills" ON skills FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete skills" ON skills FOR DELETE USING (true);

CREATE POLICY "Allow admin insert experiences" ON experiences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update experiences" ON experiences FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete experiences" ON experiences FOR DELETE USING (true);

CREATE POLICY "Allow admin insert education" ON education FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update education" ON education FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete education" ON education FOR DELETE USING (true);

-- Contact messages policies
CREATE POLICY "Allow public insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read contact messages" ON contact_messages FOR SELECT USING (true);
CREATE POLICY "Allow admin update contact messages" ON contact_messages FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete contact messages" ON contact_messages FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
