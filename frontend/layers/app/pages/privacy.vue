<template>
  <div class="mx-auto w-full max-w-2xl space-y-4 p-4 py-10 text-sm text-muted-foreground">
    <button @click="$router.back()" class="text-primary underline hover:opacity-80">
      ← Retour
    </button>
    <h1 class="text-3xl font-bold text-primary">Politique de Confidentialité</h1>
    <p>Dernière mise à jour : 17 juin 2025</p>

    <p>
      Cette politique de confidentialité explique comment Gogole Inc. collecte, utilise et protège vos données personnelles lorsque vous utilisez notre service.
    </p>

    <h2 class="text-xl font-semibold text-primary">1. Données collectées</h2>
    <p>Nous collectons les données que vous nous fournissez lors de l'inscription, telles que votre nom, prénom et adresse e-mail.</p>

    <h2 class="text-xl font-semibold text-primary">2. Utilisation des données</h2>
    <p>Les données sont utilisées pour gérer votre compte, vous fournir les services et améliorer notre application.</p>

    <h2 class="text-xl font-semibold text-primary">3. Sécurité</h2>
    <p>Nous mettons en œuvre des mesures techniques pour protéger vos informations personnelles contre tout accès non autorisé.</p>

    <h2 class="text-xl font-semibold text-primary">4. Vos droits</h2>
    <p>Vous avez le droit de demander l'accès, la rectification ou la suppression de vos données personnelles.</p>

    <p>Pour toute question, veuillez nous contacter <a class="text-primary underline" href="mailto:support@gogole.inc">support@gogole.inc</a>.</p>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Politique de Confidentialité - Gogole Inc.',
  meta: [
    {
      name: 'description',
      content: 'Découvrez la politique de confidentialité de Gogole Inc. et comment vos données sont collectées, utilisées et protégées.',
    },
  ],
});
</script>
