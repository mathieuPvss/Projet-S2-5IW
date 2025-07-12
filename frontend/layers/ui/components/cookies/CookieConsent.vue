<template>
  <div v-if="showBanner" class="fixed bottom-4 left-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 border border-gray-300">
    <p class="text-gray-700 mb-2">
      Nous utilisons des cookies pour le bon fonctionnement du site. En continuant, vous acceptez leur usage.
    </p>
    <div class="flex justify-end gap-2">
      <button @click="acceptCookies" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Accepter
      </button>
      <button @click="declineCookies" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        Refuser
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const showBanner = ref(false)

const COOKIE_KEY = 'cookieConsent'
const EXPIRY_KEY = 'cookieConsentExpiry'
const EXPIRY_DAYS = 30

// Vérifie à l'entrée
onMounted(() => {
  const consent = localStorage.getItem(COOKIE_KEY)
  const expiry = localStorage.getItem(EXPIRY_KEY)

  if (!consent || !expiry || new Date().getTime() > parseInt(expiry)) {
    showBanner.value = true
  }
})

function acceptCookies() {
  const expiryTime = new Date().getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000 // 30 jours
  localStorage.setItem(COOKIE_KEY, 'accepted')
  localStorage.setItem(EXPIRY_KEY, expiryTime.toString())
  showBanner.value = false
}

function declineCookies() {
  localStorage.setItem(COOKIE_KEY, 'declined')
  window.location.href = 'https://www.google.com'
}
</script>
