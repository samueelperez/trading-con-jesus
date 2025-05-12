'use client'

import { useState } from 'react'
import NewTradeForm from '@/components/trading/new-trade-form'
import TradesList from '@/components/trading/trades-list'
import TradingSummary from '@/components/trading/trading-summary'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTradeAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleTradeDeleted = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <TradingSummary key={`summary-${refreshKey}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
            <NewTradeForm onTradeAdded={handleTradeAdded} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
            <TradesList key={`trades-${refreshKey}`} onTradeDeleted={handleTradeDeleted} />
          </div>
        </div>
      </div>
    </div>
  )
}
