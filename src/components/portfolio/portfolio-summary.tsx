'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/config'
import type { Exchange } from '@/types/portfolio'

export default function PortfolioSummary() {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newBalance, setNewBalance] = useState<number>(0)

  const fetchExchanges = async () => {
    try {
      const { data, error } = await supabase
        .from('exchanges')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setExchanges(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los exchanges')
    } finally {
      setLoading(false)
    }
  }

  const updateExchange = async (id: string) => {
    if (newBalance <= 0) {
      setError('El balance debe ser mayor a 0')
      return
    }

    try {
      const { error } = await supabase
        .from('exchanges')
        .update({ balance: newBalance })
        .eq('id', id)

      if (error) throw error

      // Actualizar localmente
      setExchanges(prevExchanges => 
        prevExchanges.map(exchange => 
          exchange.id === id ? { ...exchange, balance: newBalance } : exchange
        )
      )
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el exchange')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este exchange?')) return

    setDeletingId(id)
    setError(null)

    try {
      const { error } = await supabase
        .from('exchanges')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Actualizar localmente
      setExchanges(prevExchanges => prevExchanges.filter(exchange => exchange.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el exchange')
    } finally {
      setDeletingId(null)
    }
  }

  // Iniciar edición
  const startEditing = (exchange: Exchange) => {
    setEditingId(exchange.id)
    setNewBalance(exchange.balance)
  }

  // Cancelar edición
  const cancelEditing = () => {
    setEditingId(null)
  }

  useEffect(() => {
    fetchExchanges()

    const channel = supabase
      .channel('exchanges_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exchanges' }, () => {
        fetchExchanges()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const totalBalance = exchanges.reduce((sum, exchange) => sum + exchange.balance, 0)

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Portfolio Total</h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Balance Total (USDT)</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">
            ${totalBalance.toFixed(2)}
          </dd>
        </div>
      </div>

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Mis Exchanges</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Lista de todos los exchanges con su balance en USDT
          </p>
        </div>
      </div>

      {exchanges.length === 0 ? (
        <div className="mt-6 text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Todavía no has añadido ningún exchange. Usa el formulario para añadir uno.</p>
        </div>
      ) : (
        <div className="mt-6 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Exchange
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Balance (USDT)
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        % del Portfolio
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Fecha Añadido
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {exchanges.map((exchange) => (
                      <tr key={exchange.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {exchange.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {editingId === exchange.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={newBalance}
                              onChange={(e) => setNewBalance(parseFloat(e.target.value) || 0)}
                              className="w-24 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-blue-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                          ) : (
                            <span className="text-green-600 font-medium">${exchange.balance.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {((exchange.balance / totalBalance) * 100).toFixed(2)}%
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(exchange.created_at).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {editingId === exchange.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateExchange(exchange.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditing(exchange)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(exchange.id)}
                                disabled={deletingId === exchange.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === exchange.id ? 'Eliminando...' : 'Eliminar'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 