'use client'

import { useState, useEffect } from 'react'
import { usePortfolio } from '@/hooks/use-portfolio'

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
  const { totalBalance: portfolioFromDB, loading: portfolioLoading } = usePortfolio()
  const [usePortfolioFromDB, setUsePortfolioFromDB] = useState(true)
  const [portfolioValue, setPortfolioValue] = useState<number>(0)
  const [portfolioValueText, setPortfolioValueText] = useState<string>(usePortfolioFromDB ? "" : "0")
  const [entryPrice, setEntryPrice] = useState<number>(0)
  const [entryPriceText, setEntryPriceText] = useState<string>("0")
  const [stopLoss, setStopLoss] = useState<number>(0)
  const [stopLossText, setStopLossText] = useState<string>("0")
  const [riskPercentage, setRiskPercentage] = useState<number>(1)
  const [riskPercentageText, setRiskPercentageText] = useState<string>("1")
  const [positionType, setPositionType] = useState<'LONG' | 'SHORT'>('LONG')
  const [result, setResult] = useState<RiskCalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Actualizar el valor del portfolio cuando se carga desde la base de datos
  useEffect(() => {
    if (portfolioFromDB > 0 && usePortfolioFromDB) {
      setPortfolioValue(portfolioFromDB)
      setPortfolioValueText(portfolioFromDB.toString())
    }
  }, [portfolioFromDB, usePortfolioFromDB])

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
      setError('El porcentaje de riesgo debe estar entre 0.01 y 100')
      return
    }

    // Validación según tipo de posición
    if (positionType === 'LONG' && entryPrice <= stopLoss) {
      setError('Para posiciones LONG, el stop loss debe ser menor que el precio de entrada')
      return
    }

    if (positionType === 'SHORT' && entryPrice >= stopLoss) {
      setError('Para posiciones SHORT, el stop loss debe ser mayor que el precio de entrada')
      return
    }

    // Cálculos según tipo de posición
    const riskAmount = portfolioValue * (riskPercentage / 100)
    const stopLossPoints = positionType === 'LONG' 
      ? entryPrice - stopLoss 
      : stopLoss - entryPrice
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

  const handlePortfolioValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPortfolioValueText(value);
    setUsePortfolioFromDB(false);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setPortfolioValue(numValue);
    } else {
      setPortfolioValue(0);
    }
  };

  const handleEntryPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEntryPriceText(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEntryPrice(numValue);
    } else {
      setEntryPrice(0);
    }
  };

  const handleStopLossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStopLossText(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setStopLoss(numValue);
    } else {
      setStopLoss(0);
    }
  };

  const handleRiskPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRiskPercentageText(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setRiskPercentage(numValue);
    } else {
      setRiskPercentage(0);
    }
  };

  // Actualizar el valor del portfolio desde DB
  const usePortfolioFromDBValue = () => {
    setUsePortfolioFromDB(true);
    setPortfolioValue(portfolioFromDB);
    setPortfolioValueText(portfolioFromDB.toString());
  };

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
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  id="portfolioValue"
                  value={portfolioValueText}
                  onChange={handlePortfolioValueChange}
                  className={`block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    usePortfolioFromDB ? 'ring-green-300 bg-green-50' : 'ring-gray-300'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                  placeholder={portfolioLoading ? 'Cargando...' : 'Ej: 10000'}
                />
                <button
                  onClick={usePortfolioFromDBValue}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-500"
                >
                  Usar Portfolio
                </button>
              </div>
              {usePortfolioFromDB && (
                <p className="mt-1 text-xs text-green-600">
                  Usando el valor total de la sección Portfolio
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="positionType" className="block text-sm font-medium leading-6 text-gray-900">
              Tipo de Posición
            </label>
            <div className="mt-2">
              <select
                id="positionType"
                value={positionType}
                onChange={(e) => setPositionType(e.target.value as 'LONG' | 'SHORT')}
                className="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              >
                <option value="LONG">LONG (Alcista)</option>
                <option value="SHORT">SHORT (Bajista)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="entryPrice" className="block text-sm font-medium leading-6 text-gray-900">
              Precio de Entrada ($)
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="entryPrice"
                value={entryPriceText}
                onChange={handleEntryPriceChange}
                className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
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
                type="text"
                id="stopLoss"
                value={stopLossText}
                onChange={handleStopLossChange}
                className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder={positionType === 'LONG' ? 'Menor que entrada' : 'Mayor que entrada'}
              />
              <p className="mt-1 text-xs text-blue-600">
                {positionType === 'LONG' 
                  ? 'Para LONG: Stop Loss debe ser menor que el precio de entrada' 
                  : 'Para SHORT: Stop Loss debe ser mayor que el precio de entrada'}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="riskPercentage" className="block text-sm font-medium leading-6 text-gray-900">
              Riesgo (%)
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="riskPercentage"
                name="riskPercentage"
                value={riskPercentageText}
                onChange={handleRiskPercentageChange}
                className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Ej: 0.5"
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
                  <div className="mt-4 text-sm">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                        <dt className="truncate text-sm font-medium text-gray-500">Cantidad a arriesgar</dt>
                        <dd className="mt-1 text-2xl font-semibold tracking-tight text-red-600">
                          ${result.riskAmount.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </dd>
                      </div>
                      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                        <dt className="truncate text-sm font-medium text-gray-500">Puntos de Stop Loss</dt>
                        <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                          {result.stopLossPoints.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          <span className="ml-2 text-sm text-gray-500">
                            ({((result.stopLossPoints / entryPrice) * 100).toFixed(2)}%)
                          </span>
                        </dd>
                      </div>
                      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                        <dt className="truncate text-sm font-medium text-gray-500">Tamaño de posición recomendado</dt>
                        <dd className="mt-1 text-2xl font-semibold tracking-tight text-blue-600">
                          ${result.positionSize.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold leading-7 text-gray-900">Opciones según Apalancamiento</h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                La columna &quot;Cantidad a Invertir&quot; muestra la cantidad real de dinero que debes introducir en la operación
              </p>
              <div className="mt-4 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              Apalancamiento
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                              Tamaño de Posición
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 bg-yellow-50">
                              Cantidad a Invertir
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                              % del Portfolio
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {result.leverageSuggestions.map((suggestion) => (
                            <tr key={suggestion.leverage} className={suggestion.realInvestment / portfolioValue <= 0.05 ? 'bg-green-50' : ''}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                <span className="font-bold">{suggestion.leverage}x</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 text-right">
                                ${suggestion.positionSize.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-blue-700 bg-yellow-50 text-right">
                                ${suggestion.realInvestment.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                <span className={`${(suggestion.realInvestment / portfolioValue) <= 0.02 ? 'text-green-600 font-medium' : 
                                  (suggestion.realInvestment / portfolioValue) <= 0.05 ? 'text-blue-600' : 
                                  (suggestion.realInvestment / portfolioValue) >= 0.2 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                  {((suggestion.realInvestment / portfolioValue) * 100).toFixed(2)}%
                                </span>
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