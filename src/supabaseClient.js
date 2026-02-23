import { createClient } from '@supabase/supabase-js'

// Aapki project settings se milega (Step 2 dekhein)
const supabaseUrl = 'https://fipfutxhxpcckjskytzg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcGZ1dHhoeHBjY2tqc2t5dHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzkxNTQsImV4cCI6MjA4NzM1NTE1NH0.-QCpP9QcdtbXu11KpgL1BBdAG7952P8irb8Enmr-pDg'

let supabase = null
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('Supabase client initialized')
} catch (err) {
  console.error('Supabase initialization failed:', err)
  // Create a mock/placeholder if real init fails
  supabase = {
    storage: { from: () => ({ upload: async () => ({}), getPublicUrl: () => ({}) }) },
    from: () => ({ insert: async () => ({}) })
  }
}

export default supabase || {}

