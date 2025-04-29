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
  }
}
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #4285F4, #34A853);
  margin: 0;
}

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
</style>
