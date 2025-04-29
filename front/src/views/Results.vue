<template>
    <div class="results">
      <h1>Résultats pour "{{ query }}"</h1>
      <div v-for="result in results" :key="result.id" class="result-item">
        {{ result.title }}
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';

  
  export default {
    name: 'ResultsPage',
    props: ['query'],
    data() {
      return {
        results: []
      };
    },
    watch: {
      query(newQuery) {
        this.fetchResults(newQuery);
      }
    },
    methods: {
      
      // Logique pour récupérer les résultats de l'API
      fetchResults(query) {
      axios.get(`https://api.moteur-recherche.com/search?q=${query}`)
        .then(response => {
          this.results = response.data;
        })
        .catch(error => {
          console.error("Erreur lors de la recherche:", error);
        });
    }
    }
    
  };
  </script>
  
  <style scoped>
  .result-item {
    transition: all 0.3s ease;
  }
  </style>
  