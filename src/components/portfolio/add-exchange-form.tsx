'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/config'

interface AddExchangeFormProps {
  onExchangeAdded?: () => void
}

export default function AddExchangeForm({ onExchangeAdded }: AddExchangeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const balance = Number(formData.get('balance'))

    // Validaciones
    if (!name.trim()) {
      setError('El nombre del exchange es requerido')
      setLoading(false)
      return
    }

    if (balance <= 0) {
      setError('El balance debe ser mayor a 0')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('exchanges')
        .insert([{ name, balance }])

      if (error) throw error

      if (formRef.current) {
        formRef.current.reset()
      }

      // Notificar que se agregó un nuevo exchange
      if (onExchangeAdded) {
        onExchangeAdded()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el exchange')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold leading-7 text-gray-900">Añadir Exchange</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">
        Registra un nuevo exchange y su balance en USDT
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
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
              Nombre del Exchange
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                required
                className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Ej: Binance"
              />
            </div>
          </div>

          <div>
            <label htmlFor="balance" className="block text-sm font-medium leading-6 text-gray-900">
              Balance (USDT)
            </label>
            <div className="mt-2">
              <input
                type="number"
                step="0.01"
                name="balance"
                id="balance"
                required
                className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Ej: 1000"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Añadir Exchange'}
          </button>
        </div>
      </form>
    </div>
  )
} 