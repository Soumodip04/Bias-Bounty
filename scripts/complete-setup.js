const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

console.log('🚀 BiasBounty Complete Setup Starting...')
console.log('')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!')
  console.log('')
  console.log('Please create .env.local with the following variables:')
  console.log('')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key')
  console.log('BIAS_DETECTION_API_URL=http://localhost:8000')
  console.log('NEXTAUTH_URL=http://localhost:3000')
  console.log('NEXTAUTH_SECRET=your_random_32_character_secret')
  console.log('')
  console.log('Get your Supabase credentials from: https://supabase.com/dashboard')
  process.exit(1)
}

require('dotenv').config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please check your .env.local file and ensure all variables are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const setupDatabase = async () => {
  console.log('📊 Setting up Supabase database...')

  try {
    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Create users table
    console.log('👥 Creating users table...')
    await supabase.rpc('exec_sql', {
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

    // Create datasets table
    console.log('📁 Creating datasets table...')
    await supabase.rpc('exec_sql', {
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

    // Create bias_reports table
    console.log('📋 Creating bias_reports table...')
    await supabase.rpc('exec_sql', {
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

    // Create views
    console.log('📊 Creating database views...')
    await supabase.rpc('exec_sql', {
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

    // Setup RLS
    console.log('🔒 Setting up Row Level Security...')
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
        ALTER TABLE bias_reports ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view own profile" ON users;
        CREATE POLICY "Users can view own profile" ON users
          FOR SELECT USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own profile" ON users;
        CREATE POLICY "Users can update own profile" ON users
          FOR UPDATE USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Anyone can view datasets" ON datasets;
        CREATE POLICY "Anyone can view datasets" ON datasets
          FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Users can insert own datasets" ON datasets;
        CREATE POLICY "Users can insert own datasets" ON datasets
          FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

        DROP POLICY IF EXISTS "Users can update own datasets" ON datasets;
        CREATE POLICY "Users can update own datasets" ON datasets
          FOR UPDATE USING (auth.uid() = uploaded_by);

        DROP POLICY IF EXISTS "Anyone can view bias reports" ON bias_reports;
        CREATE POLICY "Anyone can view bias reports" ON bias_reports
          FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Users can insert own bias reports" ON bias_reports;
        CREATE POLICY "Users can insert own bias reports" ON bias_reports
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    })

    // Create storage bucket
    console.log('💾 Setting up file storage...')
    try {
      await supabase.storage.createBucket('datasets', {
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
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('⚠️ Storage bucket creation failed:', error.message)
      }
    }

    // Create user creation function
    console.log('⚙️ Setting up user creation trigger...')
    await supabase.rpc('exec_sql', {
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

        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();
      `
    })

    console.log('✅ Database setup completed successfully!')

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    throw error
  }
}

const createSampleData = async () => {
  console.log('📝 Creating sample data...')
  
  try {
    // Check if sample data already exists
    const { data: existingDatasets } = await supabase
      .from('datasets')
      .select('id')
      .limit(1)

    if (existingDatasets && existingDatasets.length > 0) {
      console.log('📊 Sample data already exists, skipping...')
      return
    }

    // Create sample datasets (these would normally be uploaded by users)
    const sampleDatasets = [
      {
        name: 'HR Employee Dataset',
        description: 'Employee data with potential gender bias in salary distribution',
        file_url: 'https://example.com/hr_dataset.csv',
        file_type: 'text/csv',
        file_size: 15420,
        bias_score: 72.5,
        status: 'completed',
        fairness_metrics: {
          dataset_info: { rows: 20, columns: 9 },
          demographic_bias: { potential_bias_risk: true },
          statistical_bias: { salary: { bias_risk: 'high' } }
        }
      },
      {
        name: 'Loan Application Data',
        description: 'Financial loan applications with demographic information',
        file_url: 'https://example.com/loan_applications.csv',
        file_type: 'text/csv',
        file_size: 18750,
        bias_score: 68.3,
        status: 'completed',
        fairness_metrics: {
          dataset_info: { rows: 20, columns: 12 },
          demographic_bias: { potential_bias_risk: true },
          statistical_bias: { income: { bias_risk: 'medium' } }
        }
      },
      {
        name: 'Product Reviews Dataset',
        description: 'Customer product reviews with potential text bias',
        file_url: 'https://example.com/product_reviews.json',
        file_type: 'application/json',
        file_size: 25600,
        bias_score: 45.2,
        status: 'completed',
        fairness_metrics: {
          dataset_info: { rows: 20, columns: 8 },
          text_bias: { review_text_sentiment_bias: { bias_risk: 'medium' } },
          demographic_bias: { potential_bias_risk: false }
        }
      }
    ]

    for (const dataset of sampleDatasets) {
      await supabase.from('datasets').insert(dataset)
    }

    console.log('✅ Sample data created successfully!')

  } catch (error) {
    console.warn('⚠️ Sample data creation failed:', error.message)
  }
}

const main = async () => {
  try {
    await setupDatabase()
    await createSampleData()
    
    console.log('')
    console.log('🎉 BiasBounty setup completed successfully!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Start the bias detection service: cd bias-detection-service && python main.py')
    console.log('3. Open http://localhost:3000 in your browser')
    console.log('4. Try uploading a sample dataset from the sample-data/ folder')
    console.log('')
    console.log('🚀 Happy bias hunting!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

main()