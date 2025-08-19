/*
# Initial Database Schema for Data Labeling Engine

1. New Tables
   - `rules` - Stores labeling rules with conditions and metadata
   - `processed_data` - Stores processed JSON payloads with applied labels
   - `statistics` - Stores aggregated statistics (optional, can be calculated)

2. Security
   - Enable RLS on all tables
   - Add policies for public access (adjust as needed for your use case)

3. Features
   - UUID primary keys with automatic generation
   - Timestamps with automatic updates
   - JSONB for flexible data storage
   - Indexes for performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rules table
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  conditions JSONB NOT NULL,
  label TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Processed data table
CREATE TABLE IF NOT EXISTS processed_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payload JSONB NOT NULL,
  labels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Statistics table (optional - can calculate from processed_data)
CREATE TABLE IF NOT EXISTS statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_processed INTEGER DEFAULT 0,
  label_counts JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Policies for public access (adjust as needed)
CREATE POLICY "Allow all operations on rules"
  ON rules
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on processed_data"
  ON processed_data
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on statistics"
  ON statistics
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rules_enabled ON rules(enabled);
CREATE INDEX IF NOT EXISTS idx_rules_priority ON rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_processed_data_created_at ON processed_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processed_data_labels ON processed_data USING GIN(labels);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for rules table
CREATE TRIGGER update_rules_updated_at
  BEFORE UPDATE ON rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default rules
INSERT INTO rules (id, name, conditions, label, priority, enabled, created_at, updated_at) VALUES
(
  'default-rule-1',
  'High Value Companies',
  '{
    "type": "group",
    "operator": "OR",
    "conditions": [
      {"type": "condition", "key": "CompanyName", "operator": "=", "value": "Google"},
      {
        "type": "group",
        "operator": "AND",
        "conditions": [
          {"type": "condition", "key": "CompanyName", "operator": "=", "value": "Amazon"},
          {"type": "condition", "key": "Price", "operator": "<", "value": "2.5"}
        ]
      }
    ]
  }',
  'Green',
  3,
  true,
  now(),
  now()
),
(
  'default-rule-2',
  'Standard Price Products',
  '{
    "type": "group",
    "operator": "AND",
    "conditions": [
      {"type": "condition", "key": "Price", "operator": "=", "value": "2"}
    ]
  }',
  'Orange',
  2,
  true,
  now(),
  now()
),
(
  'default-rule-3',
  'Low MOQ Budget Products',
  '{
    "type": "group",
    "operator": "AND",
    "conditions": [
      {"type": "condition", "key": "MOQ", "operator": "<", "value": "100"},
      {"type": "condition", "key": "Price", "operator": "<", "value": "1.5"}
    ]
  }',
  'Green',
  1,
  true,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;