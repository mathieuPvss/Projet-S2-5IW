<template>
  <div class="p-6 md:p-10 max-w-3xl mx-auto text-justify space-y-4">
    <button
      @click="goBack"
      class="underline underline-offset-4 hover:text-primary transition-colors"
      >
    
      ← Retour
    </button>
    <h1 class="text-3xl font-bold mb-4">Conditions d'utilisation</h1>
    <p>
      Bienvenue chez Gogole Inc. En utilisant notre application, vous acceptez les présentes conditions...
    </p>
    <p>
      Ces conditions peuvent être modifiées à tout moment sans préavis. Il est de votre responsabilité...
    </p>
    <ul class="list-disc list-inside">
      <li>Ne pas abuser du service</li>
      <li>Respecter les autres utilisateurs</li>
      <li>Respecter la législation en vigueur</li>
    </ul>
    <p>
      Pour toute question, contactez-nous à <a class="text-primary underline" href="mailto:support@gogole.inc">support@gogole.inc</a>.
    </p>
  </div>
</template>

<script setup lang="ts">
const goBack = () => {
  history.length > 1 ? window.history.back() : navigateTo('/');
};

useHead({
  title: 'Conditions d’utilisation | Gogole Inc.',
  meta: [
    {
      name: 'description',
      content: 'Découvrez les conditions générales d’utilisation de Gogole Inc. et les règles régissant l’utilisation de notre plateforme.'
    },
    {
      name: 'robots',
      content: 'index, follow'
    },
    {
      property: 'og:title',
      content: 'Conditions d’utilisation | Gogole Inc.'
    },
    {
      property: 'og:description',
      content: 'Conditions générales d’utilisation de notre service. Lisez-les attentivement avant d’utiliser notre plateforme.'
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
});
</script>
