'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/config'
import type { Trade } from '@/types/trading'

export default function TradingSummary() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState({
    totalTrades: 0,
    winningTrades: 0,
    totalProfit: 0,
    totalCommissions: 0,
    netProfit: 0,
  })

  const calculateSummary = (trades: Trade[]) => {
    const totalTrades = trades.length
    const winningTrades = trades.filter(trade => trade.status === 'WIN').length
    const totalProfit = trades.reduce((acc, trade) => {
      // Si es pérdida, restamos el valor absoluto
      if (trade.status === 'LOSS') {
        return acc - Math.abs(trade.profit_loss)
      }
      return acc + trade.profit_loss
    }, 0)
    const totalCommissions = trades.filter(
      trade => trade.status === 'WIN' && trade.profit_loss > 20
    ).length * 6
    const netProfit = totalProfit - totalCommissions

    setSummary({
      totalTrades,
      winningTrades,
      totalProfit,
      totalCommissions,
      netProfit,
    })
  }

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        calculateSummary(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el resumen')
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()

    const channel = supabase
      .channel('trades_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => {
        fetchTrades()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold leading-7 text-gray-900">Resumen Contable</h2>
      <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Operaciones</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {summary.totalTrades}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Operaciones Ganadoras</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {summary.winningTrades}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Profit/Loss Total</dt>
          <dd className={`mt-1 text-3xl font-semibold tracking-tight ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${summary.totalProfit.toFixed(2)}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Comisiones</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            ${summary.totalCommissions.toFixed(2)}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Profit Neto</dt>
          <dd className={`mt-1 text-3xl font-semibold tracking-tight ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${summary.netProfit.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  )
} 