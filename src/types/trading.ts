export type TradeStatus = 'WIN' | 'LOSS'

export interface Trade {
  id: string
  symbol: string
  status: TradeStatus
  profit_loss: number
  commission_paid: boolean
  created_at: string
} 