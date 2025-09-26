-- Create API usage logs table for monitoring (optional)
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    operation TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_timestamp ON public.api_usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_operation ON public.api_usage_logs(operation);

-- Enable Row Level Security
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own API usage logs" ON public.api_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage logs" ON public.api_usage_logs
    FOR INSERT WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_api_usage_logs_updated_at 
    BEFORE UPDATE ON public.api_usage_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
