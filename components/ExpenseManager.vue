<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900">Add Expense</h2>
      <div class="text-sm text-gray-500">
        {{ expenses.length }} expense{{ expenses.length !== 1 ? 's' : '' }}
      </div>
    </div>
    
    <form @submit.prevent="handleAddExpense" class="space-y-4">
      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <input
          v-model="form.description"
          type="text"
          placeholder="e.g., gas, dinner, groceries"
          class="input-field"
          maxlength="100"
          required
        />
      </div>

      <!-- Amount and Currency -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            v-model.number="form.amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            class="input-field"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select v-model="form.currency" class="input-field">
            <option value="PLN">PLN</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <!-- Paid By -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Paid by *
        </label>
        <select v-model="form.paidBy" class="input-field" required>
          <option value="">Select who paid</option>
          <option v-for="friend in friends" :key="friend.id" :value="friend.id">
            {{ friend.name }}
          </option>
        </select>
      </div>

      <!-- Participants -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Split between * ({{ form.participants.length }} people)
          <span v-if="form.participants.length > 0 && form.amount > 0" class="text-emerald-600 font-normal">
            - {{ (form.amount / form.participants.length).toFixed(2) }} {{ form.currency }} per person
          </span>
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            v-for="friend in friends"
            :key="friend.id"
            class="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200"
            :class="{ 'bg-emerald-50 border-emerald-300 shadow-sm': form.participants.includes(friend.id) }"
          >
            <input
              v-model="form.participants"
              type="checkbox"
              :value="friend.id"
              class="sr-only"
            />
            <div class="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 mr-3 flex items-center justify-center transition-all duration-200"
                 :class="{ 'bg-emerald-600 border-emerald-600': form.participants.includes(friend.id) }">
              <CheckIcon v-if="form.participants.includes(friend.id)" class="w-3 h-3 text-white" />
            </div>
            <span class="text-sm font-medium text-gray-900">{{ friend.name }}</span>
          </label>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="!canSubmit"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        Add Expense
      </button>
    </form>

    <!-- Recent Expenses -->
    <div v-if="expenses.length > 0" class="mt-8 pt-6 border-t border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
      <div class="space-y-3 max-h-96 overflow-y-auto">
        <TransitionGroup name="expense" tag="div">
          <div
            v-for="expense in recentExpenses"
            :key="expense.id"
            class="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">{{ expense.description }}</div>
              <div class="text-sm text-gray-600 mt-1">
                <span class="font-semibold">{{ expense.amount }} {{ expense.currency }}</span> 
                paid by <span class="font-medium">{{ getFriendName(expense.paidBy) }}</span>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Split: {{ expense.participants.map(p => getFriendName(p)).join(', ') }}
              </div>
              <div class="text-xs text-emerald-600 mt-1">
                {{ (expense.amount / expense.participants.length).toFixed(2) }} {{ expense.currency }} per person
              </div>
            </div>
            <button
              @click="handleRemoveExpense(expense.id)"
              class="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors duration-200 ml-2"
              title="Remove expense"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'

const { friends, expenses, addExpense, removeExpense, getFriendName } = useExpenseSplitter()

const form = reactive({
  description: '',
  amount: 0,
  currency: 'PLN',
  paidBy: '',
  participants: [] as string[]
})

const canSubmit = computed(() => {
  return form.description.trim() && 
         form.amount > 0 && 
         form.paidBy && 
         form.participants.length > 0
})

const recentExpenses = computed(() => {
  return [...expenses.value].reverse().slice(0, 10)
})

const handleAddExpense = async () => {
  if (canSubmit.value) {
    addExpense(
      form.description,
      form.amount,
      form.currency,
      form.paidBy,
      form.participants
    )
    
    // Reset form but keep currency and paidBy for convenience
    const keepPaidBy = form.paidBy
    const keepCurrency = form.currency
    
    form.description = ''
    form.amount = 0
    form.paidBy = keepPaidBy
    form.currency = keepCurrency
    form.participants = keepPaidBy ? [keepPaidBy] : []
    
    await nextTick()
  }
}

const handleRemoveExpense = async (id: string) => {
  removeExpense(id)
  await nextTick()
}

// Auto-select payer as participant when payer is selected
watch(() => form.paidBy, (newPaidBy) => {
  if (newPaidBy && !form.participants.includes(newPaidBy)) {
    form.participants.push(newPaidBy)
  }
})

// Remove participants that are no longer friends
watch(friends, (newFriends) => {
  const friendIds = newFriends.map(f => f.id)
  form.participants = form.participants.filter(p => friendIds.includes(p))
  if (form.paidBy && !friendIds.includes(form.paidBy)) {
    form.paidBy = ''
  }
}, { deep: true })
</script>

<style scoped>
.expense-enter-active,
.expense-leave-active {
  transition: all 0.3s ease;
}
.expense-enter-from,
.expense-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>