<template>
  <div class="cgu-page">
    <div class="cgu-container">
      <router-link to="/" class="back-home">← Retour à l’accueil</router-link>
      <h1>Conditions Générales d'Utilisation</h1>
      <section>
        <h2>1. Introduction</h2>
        <p>Bienvenue sur notre moteur de recherche. En utilisant notre service, vous acceptez nos conditions générales.</p>
      </section>
      <section>
        <h2>2. Utilisation du service</h2>
        <p>Vous vous engagez à utiliser notre site de manière légale et respectueuse.</p>
      </section>
      <section>
        <h2>3. Données personnelles</h2>
        <p>Vos données sont traitées conformément à notre politique de confidentialité.</p>
      </section>
      <section>
        <h2>4. Modifications</h2>
        <p>Nous nous réservons le droit de modifier ces conditions à tout moment.</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CguPage'
}
</script>

<style>
/* Zone principale */
.cgu-page {
  min-height: 100vh;
  padding: 2rem;
  background-color: #ffffff;
  color: #1a202c;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Dark mode */
body.dark-mode .cgu-page {
  background-color: #000000;
  color: #ffffff;
}

/* Conteneur */
.cgu-container {
  max-width: 800px;
  margin: auto;
  animation: fadeIn 0.5s ease-in-out;
}

/* Titres */
h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.25rem;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
}

/* Paragraphes */
p {
  margin-bottom: 1rem;
  line-height: 1.7;
}

/* Lien */
.back-home {
  display: inline-block;
  margin-bottom: 2rem;
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-home:hover {
  color: #5a67d8;
}

body.dark-mode .back-home {
  color: #90cdf4;
}

body.dark-mode .back-home:hover {
  color: #63b3ed;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .cgu-page {
    padding: 1rem;
  }
}
</style>
