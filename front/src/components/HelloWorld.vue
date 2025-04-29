<template>
  <div class="home">
    <div class="search-container">
      <h1 class="title">Moteur de Recherche</h1>

      <div class="search-bar">
        <input
          v-model="query"
          @keyup.enter="search"
          type="text"
          placeholder="Entrez votre recherche..."
          aria-label="Champ de recherche"
          class="search-input"
        />
        <button @click="search" class="search-button" aria-label="Lancer la recherche">
          🔍
        </button>
      </div>

      <button @click="toggleAdvancedSearch" class="advanced-search-button">
        Recherche avancée
      </button>

      <div v-if="showAdvancedSearch" class="advanced-search-form">
        <div class="form-group">
          <label for="category">Catégorie :</label>
          <select v-model="advancedFilters.category" id="category" class="input-field">
            <option value="">-- Sélectionnez une catégorie --</option>
            <option value="tech">Technologie</option>
            <option value="health">Santé</option>
            <option value="science">Science</option>
            <option value="entertainment">Divertissement</option>
          </select>
        </div>

        <div class="form-group">
          <label for="date">Date :</label>
          <input
            v-model="advancedFilters.date"
            type="date"
            id="date"
            class="input-field"
          />
        </div>

        <button @click="searchAdvanced" class="search-button">Lancer la recherche</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data() {
    return {
      query: '',
      showAdvancedSearch: false,
      advancedFilters: {
        category: '',
        date: '',
      },
    };
  },
  methods: {
    search() {
      if (this.query.trim()) {
        axios
          .get(`/api/search?q=${this.query}`)
          .then(response => {
            console.log('Résultats de la recherche:', response.data);
          })
          .catch(error => {
            console.error('Erreur lors de la recherche:', error);
          });
      }
    },
    toggleAdvancedSearch() {
      this.showAdvancedSearch = !this.showAdvancedSearch;
    },
    searchAdvanced() {
      console.log('Recherche avancée avec:', this.advancedFilters);
    },
  },
};
</script>

<style scoped>
:root {
  --bg-light: #ffffff;
  --bg-dark: #121212;
  --text-light: #202124;
  --text-dark: #f1f1f1;
  --primary: #4285F4;
  --primary-hover: #357ae8;
  --input-bg: #f9f9f9;
}

.dark {
  background-color: var(--bg-dark);
  color: var(--text-dark);
}

.home {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #4285F4, #34A853);
  transition: background 0.3s ease;
}

.search-container {
  width: 100%;
  max-width: 600px;
  background-color: var(--bg-light);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: fadeIn 0.8s ease;
}

.dark .search-container {
  background-color: var(--bg-dark);
  color: var(--text-dark);
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border-radius: 50px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: box-shadow 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 8px rgba(66, 133, 244, 0.4);
}

.search-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.8rem 1rem;
  border-radius: 50px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.search-button:hover {
  background-color: var(--primary-hover);
  transform: scale(1.05);
}

.advanced-search-button {
  background: transparent;
  border: 1px solid var(--primary);
  padding: 0.5rem 1rem;
  color: var(--primary);
  border-radius: 12px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.advanced-search-button:hover {
  background: rgba(66, 133, 244, 0.1);
}

.advanced-search-form {
  margin-top: 1.5rem;
  text-align: left;
  background: var(--input-bg);
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.dark .advanced-search-form {
  background: #1f1f1f;
}

.form-group {
  margin-bottom: 1rem;
}

.input-field {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.input-field:focus {
  border-color: var(--primary);
  outline: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .search-bar {
    flex-direction: column;
  }

  .search-input,
  .search-button {
    width: 100%;
    border-radius: 10px;
  }

  .search-button {
    margin-top: 0.5rem;
  }
}
</style>
