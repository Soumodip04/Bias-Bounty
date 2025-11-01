const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[ERROR] Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const setupDatabase = async () => {
  console.log('[SETUP] Setting up BiasBounty database...')

  try {
    // Create users table
    console.log('[DB] Creating users table...')
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT auth.uid(),
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          avatar_url TEXT,
          points INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create trigger to update updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (usersError) {
      console.error('[ERROR] Error creating users table:', usersError)
    } else {
      console.log('[SUCCESS] Users table created successfully')
    }

    // Create datasets table
    console.log('[DB] Creating datasets table...')
    const { error: datasetsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS datasets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          file_url TEXT NOT NULL,
          file_type TEXT NOT NULL,
          file_size BIGINT NOT NULL,
          uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
          bias_score DECIMAL(5,2),
          fairness_metrics JSONB,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        DROP TRIGGER IF EXISTS update_datasets_updated_at ON datasets;
        CREATE TRIGGER update_datasets_updated_at
          BEFORE UPDATE ON datasets
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (datasetsError) {
      console.error('[ERROR] Error creating datasets table:', datasetsError)
    } else {
      console.log('[SUCCESS] Datasets table created successfully')
    }

    // Create bias_reports table
    console.log('[DB] Creating bias_reports table...')
    const { error: reportsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS bias_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          bias_type TEXT NOT NULL,
          description TEXT NOT NULL,
          severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
          evidence JSONB,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
          points_awarded INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        DROP TRIGGER IF EXISTS update_bias_reports_updated_at ON bias_reports;
        CREATE TRIGGER update_bias_reports_updated_at
          BEFORE UPDATE ON bias_reports
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (reportsError) {
      console.error('[ERROR] Error creating bias_reports table:', reportsError)
    } else {
      console.log('[SUCCESS] Bias reports table created successfully')
    }

    // Create leaderboard view
    console.log('[DB] Creating leaderboard view...')
    const { error: leaderboardError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW leaderboard_view AS
        SELECT 
          u.id as user_id,
          u.username,
          u.avatar_url,
          u.points,
          u.level,
          COUNT(DISTINCT br.id) as reports_submitted,
          COUNT(DISTINCT CASE WHEN br.status = 'verified' THEN br.id END) as bias_found,
          ROW_NUMBER() OVER (ORDER BY u.points DESC, u.created_at ASC) as rank
        FROM users u
        LEFT JOIN bias_reports br ON u.id = br.user_id
        GROUP BY u.id, u.username, u.avatar_url, u.points, u.level, u.created_at
        ORDER BY u.points DESC, u.created_at ASC;
      `
    })

    if (leaderboardError) {
      console.error('[ERROR] Error creating leaderboard view:', leaderboardError)
    } else {
      console.log('[SUCCESS] Leaderboard view created successfully')
    }

    // Create user stats view
    console.log('[DB] Creating user stats view...')
    const { error: statsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW user_stats_view AS
        SELECT 
          u.id as user_id,
          u.username,
          u.points,
          u.level,
          COUNT(DISTINCT d.id) as datasets_uploaded,
          COUNT(DISTINCT br.id) as reports_submitted,
          COUNT(DISTINCT CASE WHEN br.status = 'verified' THEN br.id END) as bias_found,
          COALESCE(SUM(br.points_awarded), 0) as total_points_from_reports
        FROM users u
        LEFT JOIN datasets d ON u.id = d.uploaded_by
        LEFT JOIN bias_reports br ON u.id = br.user_id
        GROUP BY u.id, u.username, u.points, u.level;
      `
    })

    if (statsError) {
      console.error('[ERROR] Error creating user stats view:', statsError)
    } else {
      console.log('[SUCCESS] User stats view created successfully')
    }

    // Create storage bucket for datasets
    console.log('[DB] Creating storage bucket...')
    const { error: bucketError } = await supabase.storage.createBucket('datasets', {
      public: true,
      allowedMimeTypes: [
        'text/csv',
        'application/json',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain',
        'application/x-parquet'
      ],
      fileSizeLimit: 104857600 // 100MB
    })

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.error('[ERROR] Error creating storage bucket:', bucketError)
    } else {
      console.log('[SUCCESS] Storage bucket created successfully')
    }

    // Set up Row Level Security
    console.log('[DB] Setting up Row Level Security...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on all tables
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
        ALTER TABLE bias_reports ENABLE ROW LEVEL SECURITY;

        -- Users can read their own data and update their own profile
        DROP POLICY IF EXISTS "Users can view own profile" ON users;
        CREATE POLICY "Users can view own profile" ON users
          FOR SELECT USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own profile" ON users;
        CREATE POLICY "Users can update own profile" ON users
          FOR UPDATE USING (auth.uid() = id);

        -- Anyone can view datasets, but only owners can update
        DROP POLICY IF EXISTS "Anyone can view datasets" ON datasets;
        CREATE POLICY "Anyone can view datasets" ON datasets
          FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Users can insert own datasets" ON datasets;
        CREATE POLICY "Users can insert own datasets" ON datasets
          FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

        DROP POLICY IF EXISTS "Users can update own datasets" ON datasets;
        CREATE POLICY "Users can update own datasets" ON datasets
          FOR UPDATE USING (auth.uid() = uploaded_by);

        -- Anyone can view bias reports, users can insert their own
        DROP POLICY IF EXISTS "Anyone can view bias reports" ON bias_reports;
        CREATE POLICY "Anyone can view bias reports" ON bias_reports
          FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Users can insert own bias reports" ON bias_reports;
        CREATE POLICY "Users can insert own bias reports" ON bias_reports
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own bias reports" ON bias_reports;
        CREATE POLICY "Users can update own bias reports" ON bias_reports
          FOR UPDATE USING (auth.uid() = user_id);
      `
    })

    if (rlsError) {
      console.error('[ERROR] Error setting up RLS:', rlsError)
    } else {
      console.log('[SUCCESS] Row Level Security configured successfully')
    }

    // Create function to handle user creation
    console.log('[DB] Creating user creation function...')
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.users (id, email, username)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Create trigger for new user creation
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();
      `
    })

    if (functionError) {
      console.error('[ERROR] Error creating function:', functionError)
    } else {
      console.log('[SUCCESS] User creation function created successfully')
    }

    console.log('[SUCCESS] Database setup completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Run: npm install')
    console.log('2. Start the development server: npm run dev')
    console.log('3. Start the bias detection service: cd bias-detection-service && pip install -r requirements.txt && python main.py')
    console.log('')

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()