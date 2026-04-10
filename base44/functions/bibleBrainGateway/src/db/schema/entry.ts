-- FaithLight Bible Gateway Postgres Schema

-- Languages
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  locale VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Providers
CREATE TABLE IF NOT EXISTS providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  base_url VARCHAR(500),
  is_enabled BOOLEAN DEFAULT true,
  priority_text INT DEFAULT 0,
  priority_audio INT DEFAULT 0,
  priority_search INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Translations (Bibles)
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  provider_id INT REFERENCES providers(id),
  provider_translation_id VARCHAR(255),
  language_id INT REFERENCES languages(id),
  name VARCHAR(255) NOT NULL,
  abbreviation VARCHAR(10),
  has_text BOOLEAN DEFAULT true,
  has_audio BOOLEAN DEFAULT false,
  has_search BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  metadata_json JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_id, provider_translation_id)
);

-- Books
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  translation_id INT REFERENCES translations(id) ON DELETE CASCADE,
  provider_book_id VARCHAR(255),
  book_code VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  sort_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(translation_id, book_code)
);

-- Chapters
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  translation_id INT REFERENCES translations(id) ON DELETE CASCADE,
  book_id INT REFERENCES books(id) ON DELETE CASCADE,
  provider_chapter_id VARCHAR(255),
  chapter_number INT NOT NULL,
  verse_count INT,
  content_text TEXT,
  content_html TEXT,
  audio_url VARCHAR(500),
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(translation_id, book_id, chapter_number)
);

-- Verses Index (for search)
CREATE TABLE IF NOT EXISTS verses_index (
  id SERIAL PRIMARY KEY,
  translation_id INT REFERENCES translations(id) ON DELETE CASCADE,
  book_code VARCHAR(10),
  chapter_number INT,
  verse_number INT,
  reference VARCHAR(100),
  text TEXT,
  language_code VARCHAR(10),
  search_vector tsvector,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(translation_id, reference)
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_verses_search ON verses_index USING GIN(search_vector);

-- Daily Verses
CREATE TABLE IF NOT EXISTS daily_verses (
  id SERIAL PRIMARY KEY,
  date_key VARCHAR(5) NOT NULL,
  language_id INT REFERENCES languages(id),
  translation_id INT REFERENCES translations(id),
  reference VARCHAR(100) NOT NULL,
  verse_text TEXT NOT NULL,
  explanation TEXT,
  audio_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date_key, language_id)
);

-- Provider Attribution
CREATE TABLE IF NOT EXISTS provider_attribution (
  id SERIAL PRIMARY KEY,
  provider_id INT REFERENCES providers(id),
  translation_id INT REFERENCES translations(id),
  copyright_text TEXT,
  attribution_text TEXT,
  license_type VARCHAR(50),
  display_rules_json JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Request Cache
CREATE TABLE IF NOT EXISTS request_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(500) UNIQUE NOT NULL,
  cache_type VARCHAR(50),
  payload_json JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cleanup old cache entries
CREATE INDEX IF NOT EXISTS idx_cache_expires ON request_cache(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_languages_timestamp BEFORE UPDATE ON languages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_providers_timestamp BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_translations_timestamp BEFORE UPDATE ON translations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_books_timestamp BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_chapters_timestamp BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_verses_index_timestamp BEFORE UPDATE ON verses_index FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_daily_verses_timestamp BEFORE UPDATE ON daily_verses FOR EACH ROW EXECUTE FUNCTION update_updated_at();