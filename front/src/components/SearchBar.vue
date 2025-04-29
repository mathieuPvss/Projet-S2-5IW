<template>
    <div class="search-bar">
      <input v-model="query" @keyup.enter="search" type="text" placeholder="Entrez votre recherche..." class="search-input" />
      <button @click="search" class="search-button">
        <i class="fas fa-search"></i>
      </button>
    </div>
  </template>
  
  <script>
  export default {
    props: ['query'],
    methods: {
      search() {
        this.$emit('search', this.query);
      }
    }
  }
  </script>
  