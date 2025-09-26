-- Update marketing_concepts table to support audience snapshots
-- This allows concepts to retain audience data even after audiences are deleted

-- Make audience_id optional since we'll store snapshots instead
ALTER TABLE marketing_concepts 
ALTER COLUMN audience_id DROP NOT NULL;

-- Add audience_snapshots column to store array of audience data
ALTER TABLE marketing_concepts 
ADD COLUMN audience_snapshots JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance when querying audience snapshots
CREATE INDEX idx_marketing_concepts_audience_snapshots 
ON marketing_concepts USING GIN (audience_snapshots);

-- Update the updated_at trigger to include the new column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists (recreate if needed)
DROP TRIGGER IF EXISTS update_marketing_concepts_updated_at ON marketing_concepts;
CREATE TRIGGER update_marketing_concepts_updated_at
    BEFORE UPDATE ON marketing_concepts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
