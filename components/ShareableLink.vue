<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900">Share Data</h2>
      <ShareIcon class="w-6 h-6 text-gray-400" />
    </div>
    
    <div v-if="friends.length > 0 || expenses.length > 0" class="space-y-4">
      <p class="text-gray-600 text-sm">
        Generate a shareable link to send your expense data to friends. 
        The link contains all your friends and expenses data.
      </p>
      
      <div class="space-y-3">
        <button
          @click="handleGenerateLink"
          :disabled="isGenerating"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LinkIcon class="w-5 h-5 mr-2" />
          {{ isGenerating ? 'Generating...' : 'Generate Shareable Link' }}
        </button>
        
        <div v-if="shareableLink" class="space-y-3">
          <div class="p-3 bg-gray-50 rounded-lg border">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Shareable Link:
            </label>
            <div class="flex gap-2">
              <input
                :value="shareableLink"
                readonly
                class="input-field flex-1 text-sm font-mono"
                @click="$event.target.select()"
              />
              <button
                @click="handleCopyLink"
                :disabled="isCopying"
                class="btn-secondary px-3 py-2 text-sm"
                :class="{ 'bg-green-50 text-green-700 border-green-300': copySuccess }"
              >
                <ClipboardDocumentIcon v-if="!copySuccess" class="w-4 h-4" />
                <CheckIcon v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div class="text-xs text-gray-500 space-y-1">
            <p>• This link contains all your current friends and expenses</p>
            <p>• Anyone with this link can view and import your data</p>
            <p>• The link is safe to share - no personal information is exposed</p>
          </div>
        </div>
      </div>
      
      <div v-if="copySuccess" class="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center text-green-700">
          <CheckCircleIcon class="w-5 h-5 mr-2" />
          <span class="text-sm font-medium">Link copied to clipboard!</span>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-8 text-gray-500">
      <ShareIcon class="w-12 h-12 mx-auto mb-2 text-gray-300" />
      <p class="font-medium">No data to share</p>
      <p class="text-sm">Add friends and expenses first</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ShareIcon, 
  LinkIcon, 
  ClipboardDocumentIcon, 
  CheckIcon,
  CheckCircleIcon 
} from '@heroicons/vue/24/outline'

const { friends, expenses, generateShareableLink, copyShareableLink } = useExpenseSplitter()

const shareableLink = ref('')
const isGenerating = ref(false)
const isCopying = ref(false)
const copySuccess = ref(false)

const handleGenerateLink = async () => {
  isGenerating.value = true
  
  try {
    await nextTick()
    shareableLink.value = generateShareableLink()
  } catch (error) {
    console.error('Failed to generate link:', error)
  } finally {
    isGenerating.value = false
  }
}

const handleCopyLink = async () => {
  isCopying.value = true
  copySuccess.value = false
  
  try {
    const success = await copyShareableLink()
    if (success) {
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 3000)
    }
  } catch (error) {
    console.error('Failed to copy link:', error)
  } finally {
    isCopying.value = false
  }
}

// Clear success message when link changes
watch(shareableLink, () => {
  copySuccess.value = false
})
</script>