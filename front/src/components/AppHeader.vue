<template>
  <header class="header">
    <div class="logo">
      <img src="@/assets/logo2.png" alt="Logo" />
    </div>
    <nav class="nav">
      <a href="#">À propos</a>
      <a href="#">Fonctionnalités</a>
      <a href="#">Contact</a>
      <router-link to="/register">S'inscrire</router-link>
      <router-link to="/login" class="btn-login">Se connecter</router-link>
      <button @click="toggleDarkMode" class="btn-darkmode" aria-label="Changer le thème">
        🌓
      </button>
    </nav>
  </header>
</template>

<script setup>
import { onMounted } from 'vue';

function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
}

onMounted(() => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
  }
}); 
</script>

<style>
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}

:root {
  --color-bg-light: #ffffff;
  --color-bg-dark: #1e1e1e;
  --color-text-light: #333333;
  --color-text-dark: #f0f0f0;
  --color-primary: #4285f4;
  --color-primary-hover: #3367d6;
}

.dark {
  background-color: var(--color-bg-dark);
  color: var(--color-text-dark);
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--color-bg-light);
  color: var(--color-text-light);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease, color 0.3s ease;
}

.dark .header {
  background: var(--color-bg-dark);
  color: var(--color-text-dark);
  transition: background 0.3s ease, color 0.3s ease;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--color-primary);
}

.logo img {
  width: 55px;
  height: 55px;
}

.nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
}

.nav a,
.nav router-link {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav a:hover,
.nav router-link:hover {
  color: var(--color-primary);
}

.btn-login,
.btn-darkmode {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.4rem 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-login:hover,
.btn-darkmode:hover {
  background: var(--color-primary-hover);
}

/* Responsive Desktop */
@media (min-width: 768px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
  }

  .nav {
    flex-direction: row;
    margin-top: 0;
  }
}
</style>
