<template>
    <div class="cgu-container">
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
  </template>
  
  <script>
  export default {
    name: 'CguPage'
  }
  </script>
  
  <style scoped>
  .cgu-container {
    padding: 2rem;
    max-width: 800px;
    margin: auto;
    line-height: 1.7;
  }
  
  h1, h2 {
    color: #333;
  }
  
  p {
    color: #555;
  }
  
  /* Responsive Mobile */
  @media (max-width: 600px) {
    .cgu-container {
      padding: 1rem;
    }
  }
  </style>
  