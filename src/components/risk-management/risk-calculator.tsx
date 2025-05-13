'use client'

import { useState } from 'react'

interface RiskCalculationResult {
  positionSize: number
  riskAmount: number
  stopLossPoints: number
  leverageSuggestions: {
    leverage: number
    positionSize: number
    collateral: number
    realInvestment: number  // Cantidad real a invertir
  }[]
}

export default function RiskCalculator() {
  const [portfolioValue, setPortfolioValue] = useState<number>(0)
  const [entryPrice, setEntryPrice] = useState<number>(0)
  const [stopLoss, setStopLoss] = useState<number>(0)
  const [riskPercentage, setRiskPercentage] = useState<number>(1)
  const [result, setResult] = useState<RiskCalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculateRisk = () => {
    setError(null)

    // Validaciones
    if (portfolioValue <= 0) {
      setError('El valor del portfolio debe ser mayor a 0')
      return
    }

    if (entryPrice <= 0) {
      setError('El precio de entrada debe ser mayor a 0')
      return
    }

    if (stopLoss <= 0) {
      setError('El stop loss debe ser mayor a 0')
      return
    }

    if (riskPercentage <= 0 || riskPercentage > 100) {
      setError('El porcentaje de riesgo debe estar entre 1 y 100')
      return
    }

    if (entryPrice <= stopLoss) {
      setError('Para posiciones long, el stop loss debe ser menor que el precio de entrada')
      return
    }

    // Cálculos
    const riskAmount = portfolioValue * (riskPercentage / 100)
    const stopLossPoints = entryPrice - stopLoss
    const positionSize = riskAmount / (stopLossPoints / entryPrice)

    // Sugerencias de apalancamiento
    const leverages = [1, 2, 3, 5, 10, 20, 50, 100]
    const leverageSuggestions = leverages.map(leverage => {
      const collateral = positionSize / leverage
      return {
        leverage,
        positionSize: positionSize,
        collateral: collateral,
        realInvestment: collateral // La inversión real es el colateral necesario
      }
    })

    setResult({
      positionSize,
      riskAmount,
      stopLossPoints,
      leverageSuggestions
    })
  }

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold leading-7 text-gray-900">Calculadora de Gestión de Riesgo</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">
        Calcula el tamaño óptimo de posición basado en tu tolerancia al riesgo
      </p>

      <div className="mt-6 space-y-6">
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
            <label htmlFor="portfolioValue" className="block text-sm font-medium leading-6 text-gray-900">
              Valor del Portfolio ($)
            </label>
            <div className="mt-2">
              <input
                type="number"
                id="portfolioValue"
                value={portfolioValue || ''}
                onChange={(e) => setPortfolioValue(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Ej: 10000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="entryPrice" className="block text-sm font-medium leading-6 text-gray-900">
              Precio de Entrada ($)
            </label>
            <div className="mt-2">
              <input
                type="number"
                id="entryPrice"
                value={entryPrice || ''}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Ej: 100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="stopLoss" className="block text-sm font-medium leading-6 text-gray-900">
              Stop Loss ($)
            </label>
            <div className="mt-2">
              <input
                type="number"
                id="stopLoss"
                value={stopLoss || ''}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Ej: 95"
              />
            </div>
          </div>

          <div>
            <label htmlFor="riskPercentage" className="block text-sm font-medium leading-6 text-gray-900">
              Riesgo (%)
            </label>
            <div className="mt-2">
              <input
                type="number"
                id="riskPercentage"
                value={riskPercentage || ''}
                onChange={(e) => setRiskPercentage(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Ej: 1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={calculateRisk}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Calcular
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">Resultado</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="font-medium">Cantidad a arriesgar:</p>
                        <p>${result.riskAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Puntos de Stop Loss:</p>
                        <p>{result.stopLossPoints.toFixed(2)} ({((result.stopLossPoints / entryPrice) * 100).toFixed(2)}%)</p>
                      </div>
                      <div>
                        <p className="font-medium">Tamaño de posición recomendado:</p>
                        <p>${result.positionSize.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold leading-7 text-gray-900">Opciones según Apalancamiento</h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                La columna "Cantidad a Invertir" muestra la cantidad real de dinero que debes introducir en la operación
              </p>
              <div className="mt-4 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Apalancamiento</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tamaño de Posición</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-yellow-50">Cantidad a Invertir</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">% del Portfolio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {result.leverageSuggestions.map((suggestion) => (
                            <tr key={suggestion.leverage}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {suggestion.leverage}x
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                ${suggestion.positionSize.toFixed(2)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-blue-700 bg-yellow-50">
                                ${suggestion.realInvestment.toFixed(2)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {((suggestion.realInvestment / portfolioValue) * 100).toFixed(2)}%
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
          </div>
        )}
      </div>
    </div>
  )
} 