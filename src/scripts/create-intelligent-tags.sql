-- Parte 1: Tabela para Agrupamento de Tags (Clusters)
CREATE TABLE IF NOT EXISTS tag_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tag_groups IS 'Armazena grupos de tags para organização, ex: Linguagens de Programação.';

-- Parte 2: Modificar a tabela de Tags para incluir o agrupamento
-- Adiciona uma coluna para relacionar a tag a um grupo. É opcional (pode ser NULL).
ALTER TABLE tags ADD COLUMN group_id UUID REFERENCES tag_groups(id) ON DELETE SET NULL;

COMMENT ON COLUMN tags.group_id IS 'Referencia o grupo ao qual esta tag pertence (opcional).';


-- Parte 3: Tabela para Aliases de Tags (Sinônimos)
CREATE TABLE IF NOT EXISTS tag_aliases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE, -- A tag "canônica" ou "principal"
    alias TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tag_aliases IS 'Define sinônimos (aliases) para tags existentes.';
COMMENT ON COLUMN tag_aliases.tag_id IS 'ID da tag principal para a qual o alias aponta.';
COMMENT ON COLUMN tag_aliases.alias IS 'O nome alternativo/sinônimo para a tag.';

-- Índice para acelerar a busca por aliases
CREATE INDEX IF NOT EXISTS idx_tag_aliases_alias ON tag_aliases(alias);