<template>
  <div class="home">
    <div class="search-container">
      <h1 class="title">SearchFlow</h1>
      <input
        v-model="query"
        @keyup.enter="search"
        type="text"
        placeholder="Entrez votre recherche..."
        class="search-input"
      />
      <button @click="search" class="search-button">Rechercher</button>

      <router-link to="/register">
        <button class="register-button">Créer un compte</button>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      query: '',
    };
  },
  methods: {
    search() {
      if (this.query.trim()) {
        console.log('Recherche pour:', this.query);
      }
    },
  },
};
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

/* Dark mode */
:deep(.dark) .home {
  --home-bg: #1e1e1e;
}

.search-container {
  width: 100%;
  max-width: 400px;
  text-align: center;
  padding: 2rem;
  background-color: var(--box-bg, #ffffff);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

:deep(.dark) .search-container {
  --box-bg: #2a2a2a;
  color: #f0f0f0;
}

.title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--title-color, #333);
  transition: color 0.3s;
}

:deep(.dark) .title {
  --title-color: #f9f9f9;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.3s, transform 0.3s;
}

.search-input:focus {
  border-color: #4caf50;
  transform: scale(1.03);
  outline: none;
}

.search-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.3s, transform 0.3s;
}

.search-button:hover {
  background-color: #45a049;
  transform: scale(1.03);
}

.register-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4285f4;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.register-button:hover {
  background-color: #357ae8;
  transform: scale(1.03);
}

/* Responsive */
@media (max-width: 500px) {
  .title {
    font-size: 1.6rem;
  }

  .search-input,
  .search-button,
  .register-button {
    font-size: 0.95rem;
  }
}
</style>
