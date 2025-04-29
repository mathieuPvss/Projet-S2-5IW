<template>
  <div id="app">
    <AppHeader />

    <div v-if="isLoading" class="loading-screen">
      <p>Chargement...</p>
    </div>

    <main v-else class="main-content">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      isLoading: true,
    }
  },
  mounted() {
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  },
  methods: {
    // Toggle pour activer/désactiver le dark mode
    toggleDarkMode() {
      document.body.classList.toggle('dark');
    }
  }
}
</script>

<style scoped>
.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.loading-screen {
  position: absolute;
  inset: 0;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #4285F4;
  font-size: 1.5rem;
  z-index: 1000;
}

/* Styles pour le dark mode */
body.dark {
  background-color: #121212;
  color: #ffffff;
}

body.dark .main-content {
  background-color: #1e1e1e;
}

/* Styles de base pour le mode clair */
body {
  background-color: #ffffff;
  color: #333;
}
</style>
