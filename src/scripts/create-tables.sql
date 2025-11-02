-- src/scripts/create-tables.sql

-- =================================================================
-- TABELA DE PROGRAMAS
-- =================================================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NULL, -- Nova coluna para a URL da imagem do programa
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- TABELA DE ANEXOS DE EPISÓDIOS
-- =================================================================
-- Tabela para armazenar anexos dos episódios (documentos)
CREATE TABLE IF NOT EXISTS episode_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL, -- Caminho do arquivo no Cloudflare R2
  public_url TEXT NOT NULL,    -- URL pública para download
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para acelerar a busca de anexos por episódio
CREATE INDEX IF NOT EXISTS idx_episode_attachments_episode_id ON episode_attachments(episode_id);

-- =================================================================
-- TABELA DE DOCUMENTOS DE EPISÓDIOS
-- =================================================================
-- Tabela para armazenar documentos dos episódios
CREATE TABLE IF NOT EXISTS episode_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL UNIQUE,
  file_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para acelerar a busca de documentos por episódio
CREATE INDEX IF NOT EXISTS idx_episode_documents_episode_id ON episode_documents(episode_id);