-- Create exchanges table
CREATE TABLE IF NOT EXISTS exchanges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  balance DECIMAL NOT NULL CHECK (balance > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Setup RLS policies
ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can do all operations on exchanges" ON exchanges
FOR ALL TO authenticated USING (true) WITH CHECK (true); 