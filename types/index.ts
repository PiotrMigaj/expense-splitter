export interface Friend {
  id: string
  name: string
  createdAt: Date
}

export interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  paidBy: string
  participants: string[]
  createdAt: Date
}

export interface Balance {
  from: string
  to: string
  amount: number
}

export interface Settlement {
  from: string
  to: string
  amount: number
}