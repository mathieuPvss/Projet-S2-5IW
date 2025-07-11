<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent
      :class="[
        'max-h-[90vh] flex flex-col overflow-hidden',
        fullscreen ? 'w-screen h-screen max-w-none rounded-none' : 'max-w-lg',
        contentClass
      ]"
    >
      <!-- Header -->
      <div v-if="props.title || $slots.header" class="flex items-center justify-between space-x-2 flex-shrink-0">
        <div class="flex-1">
          <slot name="header">
            <DialogTitle v-if="title" class="text-lg font-semibold">
              {{ props.title }}
            </DialogTitle>
          </slot>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto min-h-0 pr-5 w-full box-content">
        <slot />
      </div>

      <!-- Footer -->
      <DialogFooter v-if="showFooter || $slots.footer" class="mt-4 flex-shrink-0">
        <slot name="footer">
          <div v-if="showFooter" class="flex gap-2">
            <Button
              v-if="showCancelButton"
              variant="outline"
              @click="handleCancel"
            >
              {{ cancelText }}
            </Button>
            <Button
              v-if="showOkButton"
              :variant="isUpdate ? 'default' : 'default'"
              @click="handleOk"
            >
              {{ okText }}
            </Button>
          </div>
        </slot>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '../dialog';
import { Button } from '../button';

interface ModalProps {
  modelValue?: boolean
  title?: string
  fullscreen?: boolean
  isUpdate?: boolean
  showFooter?: boolean
  showCancelButton?: boolean
  showOkButton?: boolean
  cancelText?: string
  okText?: string
  contentClass?: string
}

interface ModalEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'cancel'): void
  (e: 'ok'): void
}

const props = defineProps<ModalProps>();

const emit = defineEmits<ModalEmits>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const handleOpenChange = (open: boolean) => {
  isOpen.value = open;
}

const handleCancel = () => {
  emit('cancel');
  isOpen.value = false;
}

const handleOk = () => {
  emit('ok');
  isOpen.value = false;
}
</script>
