export type TradeStatus = 'WIN' | 'LOSS' | 'PENDING'

export interface Trade {
  id: string
  symbol: string
  position: 'LONG' | 'SHORT'
  status: TradeStatus
  profit_loss: number
  commission_paid: boolean
  created_at: string
  notes?: string
  trader: 'Vivian' | 'Stefan' | 'Foxian'
  trade_type: 'Swing' | 'Quickie'
} 