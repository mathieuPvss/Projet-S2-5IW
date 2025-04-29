<template>
  <div class="home">
    <div class="search-container">
      <h1 class="title">Moteur de Recherche</h1>
      
      <!-- Barre de recherche principale -->
      <div class="search-bar">
        <input
          v-model="query"
          @keyup.enter="search"
          type="text"
          placeholder="Entrez votre recherche..."
          class="search-input"
        />
        <button @click="search" class="search-button">
          <i class="fas fa-search"></i>
        </button>
      </div>
      
      <!-- Bouton de recherche avancée -->
      <button @click="toggleAdvancedSearch" class="advanced-search-button">
        Recherche avancée
      </button>

      <!-- Formulaire de Recherche Avancée -->
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
export default {
  name: 'HelloWorld',
  data() {
    return {
      query: '', // Texte de recherche
      showAdvancedSearch: false, // Afficher la recherche avancée
      advancedFilters: {
        category: '',
        date: '',
      }, // Paramètres pour la recherche avancée
    };
  },
  methods: {
    search() {
    if (this.query.trim()) {
      // Remplacer par un appel API, par exemple :
      this.isLoading = true;
      axios.get(`/api/search?q=${this.query}`)
        .then(response => {
          this.isLoading = false;
          console.log('Résultats de la recherche:', response.data);
        })
        .catch(error => {
          this.isLoading = false;
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
/* Design global */
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #4285F4, #34A853);
  font-family: 'Roboto', sans-serif;
}

/* Conteneur principal */
.search-container {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  animation: fadeIn 1s ease-out;
}

/* Titre de la page */
.title {
  font-size: 2rem;
  font-weight: 500;
  color: #202124;
  margin-bottom: 20px;
  text-transform: uppercase;
}

/* Barre de recherche */
.search-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

/* Champ de recherche */
.search-input {
  width: 80%;
  padding: 15px;
  font-size: 1.1rem;
  border: 1px solid #ccc;
  border-radius: 50px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #4285F4;
  box-shadow: 0 0 10px rgba(66, 133, 244, 0.3);
}

/* Bouton de recherche */
.search-button {
  padding: 12px;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 50%;
  margin-left: 10px;
  cursor: pointer;
  font-size: 1.5rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.search-button:hover {
  background-color: #357ae8;
  transform: scale(1.1);
}

.search-button:active {
  transform: scale(0.95);
}

/* Bouton de recherche avancée */
.advanced-search-form {
  margin-top: 20px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.advanced-search-form-enter-active, .advanced-search-form-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.advanced-search-form-enter, .advanced-search-form-leave-to {
  opacity: 0;
  transform: translateY(20px);
}


/* Champs du formulaire */
.form-group {
  margin-bottom: 15px;
}

.input-field {
  padding: 10px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.input-field:focus {
  border-color: #4285F4;
}

/* Animation de la page */
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
</style>
