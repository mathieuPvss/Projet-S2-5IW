<template>
  <section class="container min-h-screen flex flex-col items-center justify-start p-6">
    <h1 class="text-3xl font-bold mb-6">
      Résultats pour "{{ route.query.q }}"
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      <div
        v-for="item in results"
        :key="item.id"
        class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition"
      >
        <h2 class="text-xl font-semibold mb-2">
          {{ item.title }}
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-3">
          {{ item.description }}
        </p>
        <NuxtLink :to="item.url" class="text-emerald-600 hover:underline">
          Voir plus
        </NuxtLink>
      </div>
    </div>

    <div v-if="results.length === 0" class="text-center mt-12 text-gray-500 text-lg">
      Aucun résultat trouvé pour "{{ route.query.q }}"
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const results = ref<any[]>([])

onMounted(() => {
  const q = route.query.q?.toString() || ''

  // Résultats fictifs (à remplacer plus tard avec le backend)
  results.value = q
    ? Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        title: `Résultat ${i + 1} pour "${q}"`,
        description: `Voici une description fictive pour le terme "${q}".`,
        url: `/details/${i}`
      }))
    : []
})
</script>
