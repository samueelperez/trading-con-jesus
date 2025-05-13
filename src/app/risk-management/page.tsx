import RiskCalculator from '@/components/risk-management/risk-calculator'

export const metadata = {
  title: 'Gestión de Riesgo | Trading Con Jesús',
  description: 'Calculadora de gestión de riesgo para operaciones de trading',
}

export default function RiskManagementPage() {
  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <RiskCalculator />
      </div>
    </div>
  )
} 