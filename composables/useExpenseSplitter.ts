import type { Friend, Expense, Settlement } from '~/types'

export const useExpenseSplitter = () => {
  // Use useState for reactive state management
  const friends = useState<Friend[]>('expense-splitter-friends', () => [])
  const expenses = useState<Expense[]>('expense-splitter-expenses', () => [])

  // Use cookies for persistence
  const friendsCookie = useCookie<Friend[]>('expense-splitter-friends', {
    default: () => [],
    serialize: JSON.stringify,
    deserialize: JSON.parse
  })
  
  const expensesCookie = useCookie<Expense[]>('expense-splitter-expenses', {
    default: () => [],
    serialize: JSON.stringify,
    deserialize: JSON.parse
  })

  // Initialize state from cookies on client side
  const initializeData = () => {
    if (process.client) {
      // Check for token in URL first
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      
      if (token) {
        try {
          loadDataFromToken(token)
          // Remove token from URL after loading
          const newUrl = window.location.pathname
          window.history.replaceState({}, document.title, newUrl)
          return
        } catch (error) {
          console.error('Failed to load data from token:', error)
        }
      }
      
      // Load from cookies if no token
      if (friendsCookie.value && friendsCookie.value.length > 0) {
        friends.value = friendsCookie.value.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt)
        }))
      }
      
      if (expensesCookie.value && expensesCookie.value.length > 0) {
        expenses.value = expensesCookie.value.map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt)
        }))
      }
    }
  }

  // Save data to cookies
  const saveData = () => {
    if (process.client) {
      friendsCookie.value = friends.value
      expensesCookie.value = expenses.value
    }
  }

  // Generate shareable link with base64 token
  const generateShareableLink = (): string => {
    if (!process.client) return ''
    
    const data = {
      friends: friends.value,
      expenses: expenses.value,
      timestamp: new Date().toISOString()
    }
    
    try {
      const jsonString = JSON.stringify(data)
      const base64Token = btoa(unescape(encodeURIComponent(jsonString)))
      const currentUrl = window.location.origin + window.location.pathname
      return `${currentUrl}?token=${base64Token}`
    } catch (error) {
      console.error('Failed to generate shareable link:', error)
      return ''
    }
  }

  // Load data from base64 token
  const loadDataFromToken = (token: string) => {
    try {
      const jsonString = decodeURIComponent(escape(atob(token)))
      const data = JSON.parse(jsonString)
      
      if (data.friends && Array.isArray(data.friends)) {
        friends.value = data.friends.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt)
        }))
      }
      
      if (data.expenses && Array.isArray(data.expenses)) {
        expenses.value = data.expenses.map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt)
        }))
      }
      
      // Save loaded data to cookies
      saveData()
      
      return true
    } catch (error) {
      console.error('Failed to load data from token:', error)
      return false
    }
  }

  // Copy shareable link to clipboard
  const copyShareableLink = async (): Promise<boolean> => {
    if (!process.client) return false
    
    try {
      const link = generateShareableLink()
      if (!link) return false
      
      await navigator.clipboard.writeText(link)
      return true
    } catch (error) {
      console.error('Failed to copy link to clipboard:', error)
      return false
    }
  }

  // Friend management
  const addFriend = (name: string) => {
    const friend: Friend = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date()
    }
    friends.value = [...friends.value, friend]
    saveData()
  }

  const removeFriend = (id: string) => {
    friends.value = friends.value.filter(f => f.id !== id)
    // Remove friend from expenses
    expenses.value = expenses.value.map(expense => ({
      ...expense,
      participants: expense.participants.filter(p => p !== id),
      paidBy: expense.paidBy === id ? '' : expense.paidBy
    })).filter(expense => expense.participants.length > 0 && expense.paidBy)
    saveData()
  }

  // Expense management
  const addExpense = (description: string, amount: number, currency: string, paidBy: string, participants: string[]) => {
    const expense: Expense = {
      id: Date.now().toString(),
      description: description.trim(),
      amount,
      currency,
      paidBy,
      participants: [...participants],
      createdAt: new Date()
    }
    expenses.value = [...expenses.value, expense]
    saveData()
  }

  const removeExpense = (id: string) => {
    expenses.value = expenses.value.filter(e => e.id !== id)
    saveData()
  }

  // Calculate balances - who owes money and who should receive money
  const calculateBalances = (): { [key: string]: number } => {
    const balances: { [key: string]: number } = {}
    
    // Initialize balances for all friends
    friends.value.forEach(friend => {
      balances[friend.id] = 0
    })

    // Calculate balances from expenses
    expenses.value.forEach(expense => {
      const perPersonAmount = expense.amount / expense.participants.length
      
      // Each participant owes their share
      expense.participants.forEach(participantId => {
        balances[participantId] -= perPersonAmount
      })
      
      // The person who paid gets credited for the full amount
      balances[expense.paidBy] += expense.amount
    })

    // Round to avoid floating point issues
    Object.keys(balances).forEach(key => {
      balances[key] = Math.round(balances[key] * 100) / 100
    })

    return balances
  }

  // Calculate direct settlements between all pairs of friends
  const calculateSettlements = (): Settlement[] => {
    const settlements: Settlement[] = []
    
    // Create a matrix to track who owes whom for each expense
    const owesMatrix: { [from: string]: { [to: string]: number } } = {}
    
    // Initialize matrix
    friends.value.forEach(friend1 => {
      owesMatrix[friend1.id] = {}
      friends.value.forEach(friend2 => {
        owesMatrix[friend1.id][friend2.id] = 0
      })
    })
    
    // Calculate direct debts from each expense
    expenses.value.forEach(expense => {
      const perPersonAmount = expense.amount / expense.participants.length
      
      expense.participants.forEach(participantId => {
        if (participantId !== expense.paidBy) {
          // This participant owes the payer their share
          owesMatrix[participantId][expense.paidBy] += perPersonAmount
        }
      })
    })
    
    // Create settlements from the matrix, netting out mutual debts
    friends.value.forEach(friend1 => {
      friends.value.forEach(friend2 => {
        if (friend1.id !== friend2.id) {
          const amount1owes2 = owesMatrix[friend1.id][friend2.id]
          const amount2owes1 = owesMatrix[friend2.id][friend1.id]
          
          // Net the amounts
          const netAmount = amount1owes2 - amount2owes1
          
          if (netAmount > 0.01) {
            settlements.push({
              from: friend1.id,
              to: friend2.id,
              amount: Math.round(netAmount * 100) / 100
            })
          }
        }
      })
    })
    
    return settlements.sort((a, b) => b.amount - a.amount)
  }

  // Get friend name by ID
  const getFriendName = (id: string): string => {
    return friends.value.find(f => f.id === id)?.name || 'Unknown'
  }

  // Clear all data
  const clearAllData = () => {
    friends.value = []
    expenses.value = []
    saveData()
  }

  // Initialize data on mount
  onMounted(() => {
    initializeData()
  })

  return {
    friends,
    expenses,
    addFriend,
    removeFriend,
    addExpense,
    removeExpense,
    calculateBalances,
    calculateSettlements,
    getFriendName,
    clearAllData,
    generateShareableLink,
    copyShareableLink,
    loadDataFromToken
  }
}