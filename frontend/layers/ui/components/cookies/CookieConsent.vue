<template>
  <div v-if="!hasConsent" class="fixed bottom-4 left-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 border border-gray-300">
    <p class="text-gray-700 mb-2">
      Nous utilisons des cookies pour améliorer votre expérience. Acceptez-vous les cookies ?
    </p>
    <div class="flex gap-2 justify-end">
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
const cookieConsent = useCookie('cookie-consent', {
  maxAge: 60 * 60 * 24 * 365, // 1 an
});

const hasConsent = ref(!!cookieConsent.value);

function acceptCookies() {
  cookieConsent.value = 'accepted';
  hasConsent.value = true;
}

function declineCookies() {
  cookieConsent.value = 'declined';
  hasConsent.value = true;
}
</script>
