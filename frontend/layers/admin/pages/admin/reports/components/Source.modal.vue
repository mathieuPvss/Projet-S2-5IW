<template>
  <Modal
    v-model="modalOpen"
    v-bind="sourceModal.config.value"
    @ok="handleViewSourceOk"
    @cancel="handleViewSourceCancel"
    v-if="sourceModal"
  >
    <div v-if="loading" class="flex items-center justify-center py-8">
      <LoaderCircle class="animate-spin h-8 w-8 mr-4"/>Chargement...
    </div>

    <div v-else-if="error" class="py-4">
      <div class="text-center text-red-600">
        <p class="font-medium">Erreur lors du chargement de la source</p>
        <p class="text-sm text-gray-500">{{ error }}</p>
      </div>
    </div>

    <div v-else-if="content" class="space-y-4">
      <div class="grid grid-cols-1 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Source ID</label>
          <div class="p-3 bg-gray-50 rounded-md">
            <code class="text-sm">{{ content.source_id }}</code>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">URL</label>
          <div class="p-3 bg-gray-50 rounded-md">
            <a
              v-if="content.url"
              :href="content.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {{ content.url }}
            </a>
            <span v-else class="text-sm text-gray-500">No URL available</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Title</label>
          <div class="p-3 bg-gray-50 rounded-md">
            <span class="text-sm font-medium">{{ content.title }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <div class="p-3 bg-gray-50 rounded-md">
            <span class="text-sm">{{ content.description || 'No description available' }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Origin Question</label>
          <div class="p-3 bg-gray-50 rounded-md">
            <span class="text-sm">{{ content.origin_question || 'No origin question available' }}</span>
          </div>
        </div>

        <div v-if="content.created_at" class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Created At</label>
          <div class="p-3 bg-gray-50 rounded-md">
            <span class="text-sm">{{ formatDate(content.created_at) }}</span>
          </div>
        </div>

        <Button
          variant="default"
          class="mt-4"
          @click="handleTreatReport(ReportStatus.APPROVED)"
        >
          Accepter
        </Button>
        <Button
          variant="destructive"
          class="mt-4 ml-2"
          @click="handleTreatReport(ReportStatus.REJECTED)"
        >
          Rejeter
        </Button>
      </div>
    </div>

    <div v-else class="py-4">
      <div class="text-center text-gray-500">
        <p>No source data available</p>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { Modal, useModal } from '@ui/components/modal';
import { Api } from './api';
import {LoaderCircle} from "lucide-vue-next";
import {ReportStatus} from "@/enums";

interface Content {
  source_id: string
  title: string
  description?: string
  origin_question?: string
  url: string
  created_at?: string
  published_at?: string
  tags?: string[]
  thumbnail?: string
  channel?: string
}

interface Props {
  id: string;
  sourceId: string
  isOpen?: boolean
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'treatReport', payload: { id: string, status: ReportStatus }): void
}>()

// Modal state
const sourceModal = useModal({
  title: 'Détails de la source',
  okText: 'Fermer',
  showCancelButton: false,
  showOkButton: true
})

const modalOpen = computed({
  get: () => props.isOpen === true,
  set: (value: boolean) => {
    emit('update:isOpen', value)
  }
})

const content = ref<Content | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

watch(() => modalOpen.value, (newValue) => {
  if (newValue !== sourceModal.isOpen.value) {
    sourceModal.isOpen.value = newValue;
  }
  if (newValue && props.sourceId) {
    loadSourceData();
  }
}, { immediate: true })

watch(() => sourceModal.isOpen.value, (newValue) => {
  if (newValue !== modalOpen.value) {
    modalOpen.value = newValue;
  }
})

// Load source data
const loadSourceData = async () => {
  if (!props.sourceId) {
    return;
  }

  loading.value = true;
  error.value = null;
  content.value = null;

  try {
    content.value = await Api.getSource(props.sourceId);
  } catch (err) {
    console.error('Error loading source:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load source data';
  } finally {
    loading.value = false;
  }
}

const handleViewSourceOk = () => {
  modalOpen.value = false;
}

const handleViewSourceCancel = () => {
  modalOpen.value = false;
}

function handleTreatReport (status: ReportStatus) {
  emit('treatReport', {
    id: props.id,
    status
  })
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
}
</script>
