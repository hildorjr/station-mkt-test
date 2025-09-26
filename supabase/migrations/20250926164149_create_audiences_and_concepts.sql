-- Create audiences table
CREATE TABLE IF NOT EXISTS public.audiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    demographics JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create marketing_concepts table
CREATE TABLE IF NOT EXISTS public.marketing_concepts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    audience_id UUID NOT NULL REFERENCES public.audiences(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source_concept_id UUID REFERENCES public.marketing_concepts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_concepts_audience_id ON public.marketing_concepts(audience_id);
CREATE INDEX IF NOT EXISTS idx_marketing_concepts_source_concept_id ON public.marketing_concepts(source_concept_id);
CREATE INDEX IF NOT EXISTS idx_audiences_created_at ON public.audiences(created_at);
CREATE INDEX IF NOT EXISTS idx_marketing_concepts_created_at ON public.marketing_concepts(created_at);

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to automatically update updated_at
CREATE TRIGGER update_audiences_updated_at 
    BEFORE UPDATE ON public.audiences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_concepts_updated_at 
    BEFORE UPDATE ON public.marketing_concepts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for both tables
ALTER TABLE public.audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_concepts ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allow all operations for now - can be refined later)
CREATE POLICY "Allow all operations on audiences" ON public.audiences
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on marketing_concepts" ON public.marketing_concepts
    FOR ALL USING (true) WITH CHECK (true);
