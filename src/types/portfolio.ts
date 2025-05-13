export interface Exchange {
  id: string
  name: string
  balance: number
  created_at: string
}

export interface Portfolio {
  totalBalance: number
  exchanges: Exchange[]
} 