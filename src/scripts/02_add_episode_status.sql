-- Creates the ENUM type for the status
CREATE TYPE episode_status AS ENUM ('draft', 'scheduled', 'published', 'archived');

-- Adds the new column to the episodes table
ALTER TABLE episodes
ADD COLUMN status episode_status NOT NULL DEFAULT 'draft';
