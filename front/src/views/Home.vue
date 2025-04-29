<template>
  <div class="home">
    <div class="search-container">
      <h1 class="title">Moteur de Recherche</h1>
      <input
        v-model="query"
        @keyup.enter="search"
        type="text"
        placeholder="Entrez votre recherche..."
        class="search-input"
      />
      <button @click="search" class="search-button">Rechercher</button>

      <!-- 🔥 Ajout du bouton pour aller sur /register -->
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
        query: '', // Le texte saisi dans le champ de recherche
      };
    },
    methods: {
      // Cette fonction sera utilisée pour simuler une recherche
      search() {
        if (this.query.trim()) {
          // Pour l'instant, nous allons simplement afficher la recherche dans la console
          console.log('Recherche pour:', this.query);
          // Vous pouvez ici appeler l'API pour obtenir les résultats
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Style de base pour la page d'accueil */
  .home {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f4f4f9;
  }
  
  .search-container {
    text-align: center;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #333;
  }
  
  .search-input {
    padding: 10px;
    width: 250px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 1rem;
  }
  
  .search-button {
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .search-button:hover {
    background-color: #45a049;
  }
  
  /* Animation de transition */
  .search-input,
  .search-button {
    transition: transform 0.3s ease;
  }
  
  .search-input:focus,
  .search-button:focus {
    transform: scale(1.05);
  }


.register-button {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.register-button:hover {
  background-color: #357ae8;
}
  </style>
  