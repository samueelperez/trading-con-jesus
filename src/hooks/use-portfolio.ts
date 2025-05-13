import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/config'
import type { Exchange } from '@/types/portfolio'

export function usePortfolio() {
  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('exchanges')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const exchangesData = data || []
      setExchanges(exchangesData)
      
      // Calcular el balance total
      const total = exchangesData.reduce((sum, exchange) => sum + exchange.balance, 0)
      setTotalBalance(total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el portfolio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()

    // Suscribirse a cambios en la tabla exchanges
    const channel = supabase
      .channel('exchanges_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exchanges' }, () => {
        fetchPortfolio()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { totalBalance, exchanges, loading, error, refetch: fetchPortfolio }
} 