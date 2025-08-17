import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://augozmbjvcjufbuzzifi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1Z296bWJqdmNqdWZidXp6aWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMTQzOTEsImV4cCI6MjA3MDg5MDM5MX0.Z42aZ6sBmUGUxJ5jp2CIXBDn1GfqGOouwrwCVk8NBuM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 簡化的數據類型定義
export interface Analysis {
  id: string
  user_id: string
  file_name: string
  file_size: number
  file_url?: string
  status: 'processing' | 'completed' | 'failed'
  progress_percentage: number
  chemical_entities?: any[]
  smiles_structures?: any[]
  patent_sections?: any
  error_message?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
}
