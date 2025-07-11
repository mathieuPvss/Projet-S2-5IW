<template>
    <Modal
      v-model="modalOpen"
      v-bind="userModal.config.value"
      @ok="handleViewUserOk"
      @cancel="handleViewUserCancel"
      v-if="userModal"
    >
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="py-4">
      <div class="text-center text-red-600">
        <p class="font-medium">Error loading user details</p>
        <p class="text-sm text-gray-500">{{ error }}</p>
      </div>
    </div>

    <div v-else-if="user" class="space-y-4">
      <div class="grid grid-cols-1 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">User ID</label>
          <div class="p-3 bg-gray-50 rounded-md">
            <code class="text-sm">{{ user.id }}</code>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Email</label>
          <div class="p-3 bg-gray-50 rounded-md">
            <span class="text-sm">{{ user.email }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Role</label>
          <div class="p-3 bg-gray-50 rounded-md">
            <Badge :variant="user.role === 'admin' ? 'default' : 'secondary'">
              {{ user.role }}
            </Badge>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-4">
      <div class="text-center text-gray-500">
        <p>No user data available</p>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { Modal, useModal } from '@ui/components/modal';
import { Badge } from '@ui/components/badge';
import { Api } from './api';
import type { User } from '@/entities';

interface Props {
  userId: string
  isOpen?: boolean
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const userModal = useModal({
  title: 'User Details',
  okText: 'Close',
  showCancelButton: false,
  showOkButton: true
})

const modalOpen = computed({
  get: () => props.isOpen === true,
  set: (value: boolean) => {
    emit('update:isOpen', value)
  }
})

const user = ref<User | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

watch(() => modalOpen.value, (newValue) => {
  if (newValue !== userModal.isOpen.value) {
    userModal.isOpen.value = newValue
  }
  if (newValue && props.userId) {
    loadUserData()
  }
}, { immediate: true })

watch(() => userModal.isOpen.value, (newValue) => {
  if (newValue !== modalOpen.value) {
    modalOpen.value = newValue;
  }
})

const loadUserData = async () => {
  if (!props.userId) {
    return;
  }

  loading.value = true;
  error.value = null;
  user.value = null;

  try {
    user.value = await Api.getUser(props.userId);
  } catch (err) {
    console.error('Error loading user:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load user data';
  } finally {
    loading.value = false;
  }
}

const handleViewUserOk = () => {
  modalOpen.value = false;
}

const handleViewUserCancel = () => {
  modalOpen.value = false;
}
</script>
