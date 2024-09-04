import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js' // Importa el tipo User

export function useSupabaseAuth() {
  // Especificamos que el estado user puede ser User o null
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Obtener la sesión actual con la nueva API
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  return { user }
}
