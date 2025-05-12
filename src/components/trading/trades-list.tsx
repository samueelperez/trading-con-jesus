'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/config'
import type { Trade } from '@/types/trading'

interface TradesListProps {
  onTradeDeleted?: () => void
}

export default function TradesList({ onTradeDeleted }: TradesListProps) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Procesar las operaciones para marcar las comisiones como pagadas automáticamente
      const processedTrades = data.map(trade => {
        if (trade.status === 'WIN' && trade.profit_loss > 20 && !trade.commission_paid) {
          // Actualizar en la base de datos
          supabase
            .from('trades')
            .update({ commission_paid: true })
            .eq('id', trade.id)
            .then(({ error }) => {
              if (error) console.error('Error al actualizar comisión:', error)
            })
          
          return { ...trade, commission_paid: true }
        }
        return trade
      })

      setTrades(processedTrades)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las operaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (tradeId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta operación?')) return

    setDeletingId(tradeId)
    setError(null)

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)

      if (error) throw error

      // Actualizar la lista localmente
      setTrades(prevTrades => prevTrades.filter(trade => trade.id !== tradeId))

      // Notificar que se eliminó una operación
      if (onTradeDeleted) {
        onTradeDeleted()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la operación')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
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
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Operaciones</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Lista de todas las operaciones registradas
          </p>
        </div>
      </div>

      <div className="mt-6 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Símbolo
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Trader
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Tipo
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Posición
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Estado
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Profit/Loss
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Comisión
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Fecha
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {trades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {trade.symbol}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trade.trader}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trade.trade_type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trade.position}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            trade.status === 'WIN'
                              ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                              : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                          }`}
                        >
                          {trade.status === 'WIN' ? 'Ganancia' : 'Pérdida'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`${
                            trade.status === 'LOSS' ? 'text-red-600' : trade.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          ${trade.profit_loss.toFixed(2)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {trade.status === 'WIN' && trade.profit_loss > 20 ? '$8.00' : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(trade.created_at).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleDelete(trade.id)}
                          disabled={deletingId === trade.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === trade.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 