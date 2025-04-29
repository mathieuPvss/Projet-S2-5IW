<template>
  <footer class="footer">
    <p>© 2025 SearchFlow. Tous droits réservés. | 
      <router-link to="/cgu" class="footer-link">Conditions Générales d'Utilisation</router-link>
    </p>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 1rem;
  background: #f5f5f5;
  font-size: 0.9rem;
  color: #555;
}

.footer-link {
  color: #4285f4;
  text-decoration: none;
  margin-left: 5px;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>
