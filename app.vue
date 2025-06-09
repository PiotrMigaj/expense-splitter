<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <CurrencyDollarIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Expense Splitter</h1>
              <p class="text-gray-600 text-sm">Split expenses easily with your friends</p>
            </div>
          </div>
          <div v-if="friends.length > 0" class="text-right">
            <div class="text-sm text-gray-500">{{ friends.length }} friends</div>
            <div class="text-sm text-gray-500">{{ expenses.length }} expenses</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <!-- Left Column - Friends and Expenses -->
        <div class="space-y-8">
          <FriendManager />
          <ExpenseManager v-if="friends.length > 0" />
          <div v-else class="card text-center py-12">
            <UserGroupIcon class="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Add friends first</h3>
            <p class="text-gray-600 mb-4">You need to add at least one friend before creating expenses.</p>
            <p class="text-sm text-gray-500">Start by adding friends like Peter, Max, Krisz...</p>
          </div>
        </div>

        <!-- Right Column - Balance, Share, and Import -->
        <div class="space-y-8">
          <div class="xl:sticky xl:top-24 xl:self-start space-y-8">
            <BalanceDisplay />
            <ShareableLink />
            <DataImport />
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        <p>Built with Nuxt 3 • Data persisted with cookies • Fully reactive • Shareable links</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { CurrencyDollarIcon, UserGroupIcon } from '@heroicons/vue/24/outline'

const { friends, expenses } = useExpenseSplitter()

// Set page meta
useHead({
  title: 'Expense Splitter - Split expenses with friends',
  meta: [
    { name: 'description', content: 'Easily split expenses with friends and calculate who owes what to whom. Fully reactive with persistent data storage and shareable links.' }
  ]
})
</script>