-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, category_id)
);

-- NOVO: Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create episodes table
CREATE TABLE IF NOT EXISTS episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  -- REMOVIDO: A coluna 'tags TEXT[]' foi removida מכאן
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOVO: Create episode_tags join table (para a relação muitos-para-muitos)
CREATE TABLE IF NOT EXISTS episode_tags (
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (episode_id, tag_id)
);


-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_episodes_category ON episodes(category_id);
CREATE INDEX IF NOT EXISTS idx_episodes_subcategory ON episodes(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_episodes_published_at ON episodes(published_at);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_episode_tags_episode_id ON episode_tags(episode_id);
CREATE INDEX IF NOT EXISTS idx_episode_tags_tag_id ON episode_tags(tag_id);

-- Insert some sample categories
INSERT INTO categories (name) VALUES
  ('Podcast'),
  ('Música'),
  ('Entrevistas'),
  ('Educacional')
ON CONFLICT (name) DO NOTHING;