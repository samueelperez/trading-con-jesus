'use client'

import { useState } from 'react'
import AddExchangeForm from '@/components/portfolio/add-exchange-form'
import PortfolioSummary from '@/components/portfolio/portfolio-summary'

export default function PortfolioPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleExchangeAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <PortfolioSummary key={`summary-${refreshKey}`} />
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <AddExchangeForm onExchangeAdded={handleExchangeAdded} />
      </div>
    </div>
  )
} 