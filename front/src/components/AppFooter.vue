<template>
  <footer class="footer">
    <p>
      © 2025 SearchFlow. Tous droits réservés.
      <router-link to="/cgu" class="footer-link">Conditions Générales d'Utilisation</router-link>
    </p>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style>
.footer {
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  background-color: var(--footer-bg, #f5f5f5);
  color: var(--text-color, #555);
  transition: background-color 0.3s, color 0.3s;
}

.dark .footer {
  background-color: var(--footer-bg-dark, #2c2c2c);
  color: var(--text-color-dark, #e0e0e0);
}

.footer-link {
  color: #4285f4;
  margin-left: 5px;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>
