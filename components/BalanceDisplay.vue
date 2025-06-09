<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900">Balances & Settlements</h2>
      <div v-if="settlements.length > 0" class="text-sm text-gray-500">
        {{ settlements.length }} settlement{{ settlements.length !== 1 ? 's' : '' }}
      </div>
    </div>
    
    <div v-if="settlements.length > 0" class="space-y-6">
      <!-- Settlements -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <ArrowRightIcon class="w-5 h-5 mr-2 text-blue-600" />
          Who owes whom:
        </h3>
        <div class="space-y-3">
          <TransitionGroup name="settlement" tag="div">
            <div
              v-for="settlement in settlements"
              :key="`${settlement.from}-${settlement.to}`"
              class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="font-medium text-gray-900">
                    <span class="text-blue-600">{{ getFriendName(settlement.from) }}</span>
                    <span class="text-gray-500 mx-2">pays</span>
                    <span class="text-emerald-600">{{ getFriendName(settlement.to) }}</span>
                  </div>
                  <div class="text-xs text-gray-500">Settlement payment</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-emerald-600">
                  {{ settlement.amount.toFixed(2) }} PLN
                </div>
                <div class="text-xs text-gray-500">to settle</div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- Individual Balances -->
      <div class="pt-4 border-t border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <CheckCircleIcon class="w-5 h-5 mr-2 text-gray-600" />
          Individual balances:
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TransitionGroup name="balance" tag="div" class="contents">
            <div
              v-for="balance in balancesDisplay"
              :key="balance.friendId"
              class="p-4 rounded-lg transition-all duration-200 hover:shadow-sm"
              :class="getBalanceCardClass(balance.amount)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center"
                       :class="getBalanceIconClass(balance.amount)">
                    <component :is="getBalanceIcon(balance.amount)" class="w-4 h-4" />
                  </div>
                  <span class="font-medium text-gray-900">{{ balance.friendName }}</span>
                </div>
                <div class="text-right">
                  <div class="font-bold" :class="getBalanceTextClass(balance.amount)">
                    {{ balance.amount > 0 ? '+' : '' }}{{ balance.amount.toFixed(2) }} PLN
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ getBalanceStatus(balance.amount) }}
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- Summary -->
      <div class="pt-4 border-t border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <ChartBarIcon class="w-5 h-5 mr-2 text-gray-600" />
          Summary:
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-3 rounded-lg">
            <div class="text-sm text-blue-600 font-medium">Total Expenses</div>
            <div class="text-lg font-bold text-blue-700">{{ totalExpenses.toFixed(2) }} PLN</div>
          </div>
          <div class="bg-emerald-50 p-3 rounded-lg">
            <div class="text-sm text-emerald-600 font-medium">Settlements Needed</div>
            <div class="text-lg font-bold text-emerald-700">{{ settlements.length }}</div>
          </div>
          <div class="bg-purple-50 p-3 rounded-lg">
            <div class="text-sm text-purple-600 font-medium">Active Friends</div>
            <div class="text-lg font-bold text-purple-700">{{ friends.length }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-12 text-gray-500">
      <CurrencyDollarIcon class="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 class="text-lg font-semibold text-gray-700 mb-2">No expenses to split yet</h3>
      <p class="text-gray-500">Add some expenses to see balances and settlements</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/vue/24/outline'

const { friends, expenses, calculateBalances, calculateSettlements, getFriendName } = useExpenseSplitter()

const settlements = computed(() => calculateSettlements())

const balancesDisplay = computed(() => {
  const balances = calculateBalances()
  
  return friends.value.map(friend => ({
    friendId: friend.id,
    friendName: friend.name,
    amount: balances[friend.id] || 0
  })).sort((a, b) => b.amount - a.amount)
})

const totalExpenses = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + expense.amount, 0)
})

const getBalanceCardClass = (amount: number) => {
  if (amount > 0.01) return 'bg-green-50 border border-green-200'
  if (amount < -0.01) return 'bg-red-50 border border-red-200'
  return 'bg-gray-50 border border-gray-200'
}

const getBalanceTextClass = (amount: number) => {
  if (amount > 0.01) return 'text-green-600'
  if (amount < -0.01) return 'text-red-600'
  return 'text-gray-600'
}

const getBalanceIconClass = (amount: number) => {
  if (amount > 0.01) return 'bg-green-100 text-green-600'
  if (amount < -0.01) return 'bg-red-100 text-red-600'
  return 'bg-gray-100 text-gray-600'
}

const getBalanceIcon = (amount: number) => {
  if (amount > 0.01) return PlusIcon
  if (amount < -0.01) return MinusIcon
  return CheckCircleIcon
}

const getBalanceStatus = (amount: number) => {
  if (amount > 0.01) return 'Gets back'
  if (amount < -0.01) return 'Owes'
  return 'Settled'
}
</script>

<style scoped>
.settlement-enter-active,
.settlement-leave-active,
.balance-enter-active,
.balance-leave-active {
  transition: all 0.3s ease;
}

.settlement-enter-from,
.settlement-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.balance-enter-from,
.balance-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>