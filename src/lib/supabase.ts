import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmqufunwtrmfvtfnxiwg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcXVmdW53dHJtZnZ0Zm54aXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjYzMDcsImV4cCI6MjEwNjYwMjMwN30.0o8-yHLVGibTpYQX5byipzSl_O8nFjExzJcGpteWMQU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
