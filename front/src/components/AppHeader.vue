<template>
  <header class="header">
    <div class="logo">
      <img src="@/assets/logo.png" alt="Logo" />
      <span>SearchFlow</span>
    </div>
    <nav class="nav">
      <a href="#">À propos</a>
      <a href="#">Fonctionnalités</a>
      <a href="#">Contact</a>
      <router-link to="/register">S'inscrire</router-link>
      <button class="btn-login">Se connecter</button>
      <button @click="toggleDarkMode" class="btn-darkmode">
        🌓
      </button>
    </nav>
  </header>
</template>

<script>
export default {
  methods: {
    toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
    }
  }
};
</script>

  <style scoped>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: bold;
    font-size: 1.5rem;
    color: #4285f4;
  }
  
  .logo img {
    width: 32px;
    height: 32px;
  }
  
  .nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .nav a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
  }
  
  .btn-login {
    padding: 0.4rem 1rem;
    background: #4285f4;
    border: none;
    border-radius: 20px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .btn-login:hover {
    background: #3367d6;
  }
  </style>
  