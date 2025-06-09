<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900">Import Data</h2>
      <ArrowDownTrayIcon class="w-6 h-6 text-gray-400" />
    </div>
    
    <div class="space-y-4">
      <p class="text-gray-600 text-sm">
        Import expense data from a shareable link. This will replace your current data.
      </p>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Paste Shareable Link or Token:
          </label>
          <textarea
            v-model="importInput"
            placeholder="Paste the full shareable link or just the token part here..."
            class="input-field h-24 resize-none"
            @paste="handlePaste"
          />
        </div>
        
        <button
          @click="handleImport"
          :disabled="!canImport || isImporting"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDownTrayIcon class="w-5 h-5 mr-2" />
          {{ isImporting ? 'Importing...' : 'Import Data' }}
        </button>
      </div>
      
      <div v-if="importError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center text-red-700">
          <ExclamationTriangleIcon class="w-5 h-5 mr-2" />
          <span class="text-sm font-medium">{{ importError }}</span>
        </div>
      </div>
      
      <div v-if="importSuccess" class="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center text-green-700">
          <CheckCircleIcon class="w-5 h-5 mr-2" />
          <span class="text-sm font-medium">Data imported successfully!</span>
        </div>
        <div class="text-xs text-green-600 mt-1">
          Imported {{ importedData.friends }} friends and {{ importedData.expenses }} expenses
        </div>
      </div>
      
      <div class="text-xs text-gray-500 space-y-1">
        <p>• You can paste either the full URL or just the token part</p>
        <p>• This will replace all your current friends and expenses</p>
        <p>• Make sure to generate a backup link first if needed</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ArrowDownTrayIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/vue/24/outline'

const { loadDataFromToken, friends, expenses } = useExpenseSplitter()

const importInput = ref('')
const isImporting = ref(false)
const importError = ref('')
const importSuccess = ref(false)
const importedData = ref({ friends: 0, expenses: 0 })

const canImport = computed(() => {
  return importInput.value.trim().length > 0
})

const extractToken = (input: string): string => {
  const trimmed = input.trim()
  
  // If it looks like a URL, extract the token parameter
  if (trimmed.includes('token=')) {
    const url = new URL(trimmed)
    return url.searchParams.get('token') || ''
  }
  
  // Otherwise, assume it's just the token
  return trimmed
}

const handlePaste = async (event: ClipboardEvent) => {
  // Let the default paste happen first
  await nextTick()
  
  // Clear previous messages
  importError.value = ''
  importSuccess.value = false
}

const handleImport = async () => {
  if (!canImport.value) return
  
  isImporting.value = true
  importError.value = ''
  importSuccess.value = false
  
  try {
    const token = extractToken(importInput.value)
    
    if (!token) {
      importError.value = 'No valid token found in the input'
      return
    }
    
    // Store current counts for comparison
    const beforeFriends = friends.value.length
    const beforeExpenses = expenses.value.length
    
    const success = loadDataFromToken(token)
    
    if (success) {
      importedData.value = {
        friends: friends.value.length,
        expenses: expenses.value.length
      }
      
      importSuccess.value = true
      importInput.value = ''
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        importSuccess.value = false
      }, 5000)
    } else {
      importError.value = 'Failed to import data. Please check the token format.'
    }
  } catch (error) {
    console.error('Import error:', error)
    importError.value = 'Invalid token format or corrupted data'
  } finally {
    isImporting.value = false
  }
}

// Clear messages when input changes
watch(importInput, () => {
  importError.value = ''
  importSuccess.value = false
})
</script>