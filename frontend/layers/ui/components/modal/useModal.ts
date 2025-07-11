import { ref } from 'vue'

export interface ModalConfig {
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

export interface UseModalReturn {
  isOpen: Ref<boolean>
  config: Ref<ModalConfig>
  open: (config?: ModalConfig) => void
  close: () => void
  toggle: () => void
  updateConfig: (newConfig: Partial<ModalConfig>) => void
}

export function useModal(initialConfig: ModalConfig = {}): UseModalReturn {
  const isOpen = ref(false)
  const config = ref<ModalConfig>({
    title: '',
    fullscreen: false,
    isUpdate: false,
    showFooter: true,
    showCancelButton: true,
    showOkButton: true,
    cancelText: 'Cancel',
    okText: 'OK',
    contentClass: '',
    ...initialConfig
  })

  const open = (newConfig?: ModalConfig) => {
    if (newConfig) {
      config.value = { ...config.value, ...newConfig }
    }
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const updateConfig = (newConfig: Partial<ModalConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  return {
    isOpen,
    config,
    open,
    close,
    toggle,
    updateConfig
  }
}

export function useConfirmModal() {
  const modal = useModal({
    title: 'Confirm Action',
    showCancelButton: true,
    showOkButton: true,
    cancelText: 'Cancel',
    okText: 'Confirm'
  })

  return {
    ...modal,
    confirm: (title?: string, okText?: string) => {
      return new Promise<boolean>((resolve) => {
        modal.updateConfig({
          title: title || 'Confirm Action',
          okText: okText || 'Confirm'
        })

        const handleOk = () => {
          modal.close()
          resolve(true)
        }

        const handleCancel = () => {
          modal.close()
          resolve(false)
        }

        modal.open()

        return { handleOk, handleCancel }
      })
    }
  }
}

export function useFormModal() {
  const modal = useModal({
    title: 'Form',
    showCancelButton: true,
    showOkButton: true,
    cancelText: 'Cancel',
    okText: 'Save'
  })

  return {
    ...modal,
    openForCreate: () => {
      modal.updateConfig({
        title: 'Create New',
        okText: 'Create',
        isUpdate: false
      })
      modal.open()
    },
    openForUpdate: () => {
      modal.updateConfig({
        title: 'Update',
        okText: 'Update',
        isUpdate: true
      })
      modal.open()
    }
  }
}
