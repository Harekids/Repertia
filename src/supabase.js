import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qystaahiwhreglmqgvno.supabase.co'
const supabaseAnonKey = 'sb_publishable_4Xuc79PsjK78Bba-2_o27w_UAskm5Xf'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)