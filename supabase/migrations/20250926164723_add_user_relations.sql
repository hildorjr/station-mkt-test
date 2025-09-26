-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add user_id columns to existing tables
ALTER TABLE public.audiences 
ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.marketing_concepts 
ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Create indexes for user relationships
CREATE INDEX IF NOT EXISTS idx_audiences_user_id ON public.audiences(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_concepts_user_id ON public.marketing_concepts(user_id);

-- Add trigger to users table for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on audiences" ON public.audiences;
DROP POLICY IF EXISTS "Allow all operations on marketing_concepts" ON public.marketing_concepts;

-- Create user-specific policies for audiences
CREATE POLICY "Users can view their own audiences" ON public.audiences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own audiences" ON public.audiences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audiences" ON public.audiences
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audiences" ON public.audiences
    FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific policies for marketing_concepts
CREATE POLICY "Users can view their own marketing_concepts" ON public.marketing_concepts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own marketing_concepts" ON public.marketing_concepts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing_concepts" ON public.marketing_concepts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketing_concepts" ON public.marketing_concepts
    FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when auth user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
