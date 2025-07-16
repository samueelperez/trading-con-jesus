'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/config'
import type { Trade } from '@/types/trading'

interface NewTradeFormProps {
  onTradeAdded?: () => void
}

export default function NewTradeForm({ onTradeAdded }: NewTradeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<'WIN' | 'LOSS'>('WIN')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const symbol = formData.get('symbol') as string
    const status = formData.get('status') as 'WIN' | 'LOSS'
    const profitLoss = parseFloat(formData.get('profit_loss') as string)

    // Validaciones
    if (!symbol.trim()) {
      setError('El símbolo es requerido')
      setLoading(false)
      return
    }

    if (status === 'WIN' && profitLoss <= 0) {
      setError('Para operaciones ganadoras, el profit/loss debe ser positivo')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('trades')
        .insert({
          symbol: symbol.trim(),
          status,
          profit_loss: profitLoss,
          commission_paid: false,
        })

      if (error) throw error

      // Resetear el formulario
      if (formRef.current) {
        formRef.current.reset()
      }
      setStatus('WIN')

      // Notificar que se agregó una nueva operación
      if (onTradeAdded) {
        onTradeAdded()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la operación')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as 'WIN' | 'LOSS')
  }

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold leading-7 text-gray-900">Nueva Operación</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">
        Registra una nueva operación de trading
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && (
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
        )}

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium leading-6 text-gray-900">
              Símbolo
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="symbol"
                name="symbol"
                required
                className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Ej: BTCUSDT"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
              Resultado
            </label>
            <div className="mt-2">
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'WIN' | 'LOSS')}
                className="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              >
                <option value="WIN">Ganancia</option>
                <option value="LOSS">Pérdida</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="profit_loss" className="block text-sm font-medium leading-6 text-gray-900">
              Profit/Loss ($)
            </label>
            <div className="mt-2">
              <input
                type="number"
                step="0.01"
                id="profit_loss"
                name="profit_loss"
                required
                className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 ${
                  status === 'LOSS' ? 'ring-red-300' : 'ring-green-300'
                }`}
                placeholder={status === 'WIN' ? 'Solo números positivos' : 'Cualquier número'}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900">
            Notas
          </label>
          <div className="mt-2">
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Registrar Operación'}
          </button>
        </div>
      </form>
    </div>
  )
} 