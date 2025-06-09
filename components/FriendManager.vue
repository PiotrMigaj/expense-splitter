<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900">Friends</h2>
      <div class="text-sm text-gray-500">
        {{ friends.length }} friend{{ friends.length !== 1 ? 's' : '' }}
      </div>
    </div>
    
    <!-- Add Friend Form -->
    <div class="mb-6">
      <div class="flex gap-2">
        <input
          v-model="newFriendName"
          @keyup.enter="handleAddFriend"
          type="text"
          placeholder="Enter friend's name"
          class="input-field flex-1"
          maxlength="50"
        />
        <button
          @click="handleAddFriend"
          :disabled="!canAddFriend"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon class="w-5 h-5" />
        </button>
      </div>
      <div v-if="duplicateError" class="text-red-600 text-sm mt-1">
        A friend with this name already exists
      </div>
    </div>

    <!-- Friends List -->
    <div v-if="friends.length > 0" class="space-y-2">
      <TransitionGroup name="list" tag="div">
        <div
          v-for="friend in friends"
          :key="friend.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100"
        >
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <UserIcon class="w-4 h-4 text-emerald-600" />
            </div>
            <span class="font-medium text-gray-900">{{ friend.name }}</span>
          </div>
          <button
            @click="handleRemoveFriend(friend.id)"
            class="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
            :disabled="isRemovingFriend"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
    
    <div v-else class="text-center py-8 text-gray-500">
      <UserGroupIcon class="w-12 h-12 mx-auto mb-2 text-gray-300" />
      <p>No friends added yet</p>
      <p class="text-sm">Add friends to start splitting expenses</p>
    </div>

    <!-- Clear All Button -->
    <div v-if="friends.length > 0" class="mt-6 pt-4 border-t border-gray-200">
      <button
        @click="handleClearAll"
        class="w-full btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        Clear All Friends
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, TrashIcon, UserGroupIcon, UserIcon } from '@heroicons/vue/24/outline'

const { friends, addFriend, removeFriend, clearAllData } = useExpenseSplitter()
const newFriendName = ref('')
const duplicateError = ref(false)
const isRemovingFriend = ref(false)

const canAddFriend = computed(() => {
  return newFriendName.value.trim().length > 0 && !duplicateError.value
})

const handleAddFriend = () => {
  const trimmedName = newFriendName.value.trim()
  
  if (!trimmedName) return
  
  // Check for duplicates
  const isDuplicate = friends.value.some(friend => 
    friend.name.toLowerCase() === trimmedName.toLowerCase()
  )
  
  if (isDuplicate) {
    duplicateError.value = true
    return
  }
  
  addFriend(trimmedName)
  newFriendName.value = ''
  duplicateError.value = false
}

const handleRemoveFriend = async (id: string) => {
  isRemovingFriend.value = true
  await nextTick()
  removeFriend(id)
  isRemovingFriend.value = false
}

const handleClearAll = () => {
  if (confirm('Are you sure you want to clear all friends and expenses? This action cannot be undone.')) {
    clearAllData()
  }
}

// Clear duplicate error when user types
watch(newFriendName, () => {
  if (duplicateError.value) {
    duplicateError.value = false
  }
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>