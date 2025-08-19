/*
  # Initial Schema for Data Labeling Engine

  1. New Tables
    - `rules`
      - `id` (uuid, primary key)
      - `name` (text, rule name)
      - `conditions` (jsonb, rule conditions structure)
      - `label` (text, label to apply)
      - `priority` (integer, rule priority)
      - `enabled` (boolean, whether rule is active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `processed_data`
      - `id` (uuid, primary key)
      - `payload` (jsonb, original JSON payload)
      - `labels` (text array, applied labels)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since this is a demo app)

  3. Default Data
    - Insert 3 sample rules for immediate functionality
*/

-- Create rules table
CREATE TABLE IF NOT EXISTS rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  conditions jsonb NOT NULL,
  label text NOT NULL,
  priority integer DEFAULT 1,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create processed_data table
CREATE TABLE IF NOT EXISTS processed_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload jsonb NOT NULL,
  labels text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo app)
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

-- Insert default rules
INSERT INTO rules (name, conditions, label, priority, enabled, created_at, updated_at) VALUES
(
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
  }'::jsonb,
  'Green',
  3,
  true,
  now(),
  now()
),
(
  'Standard Price Products',
  '{
    "type": "group",
    "operator": "AND",
    "conditions": [
      {"type": "condition", "key": "Price", "operator": "=", "value": "2"}
    ]
  }'::jsonb,
  'Orange',
  2,
  true,
  now(),
  now()
),
(
  'Low MOQ Budget Products',
  '{
    "type": "group",
    "operator": "AND",
    "conditions": [
      {"type": "condition", "key": "MOQ", "operator": "<", "value": "100"},
      {"type": "condition", "key": "Price", "operator": "<", "value": "1.5"}
    ]
  }'::jsonb,
  'Green',
  1,
  true,
  now(),
  now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rules_priority ON rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_rules_enabled ON rules(enabled);
CREATE INDEX IF NOT EXISTS idx_processed_data_created_at ON processed_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processed_data_labels ON processed_data USING GIN(labels);