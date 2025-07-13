<template>
  <section
    class="container overflow-hidden min-h-screen flex flex-col items-center justify-center"
  >
    <form class="w-full">
      <FormField name="search">
        <FormItem
          class="flex flex-col items-center lg:flex-row justify-center gap-8 w-full"
        >
          <FormLabel
            :class="
              cn(
                'text-6xl font-bold animate-fade-left transition-all ease-in-out duration-300 whitespace-nowrap',
              )
            "
          >
            <span
              class="bg-gradient-to-tl from-slate-300 via-emerald-400 to-slate-400 bg-clip-text text-transparent"
              >Query Forge Dev</span
            >
            <br />
            Search Engine
          </FormLabel>
          <FormControl>
            <div
              :class="
                cn(
                  'relative w-full items-center max-w-sm text-md lg:text-2xl transition-all duration-300 ease-in-out',
                  searchFocus ? 'w-full max-w-full flex-1' : 'w-[500px]',
                )
              "
            >
              <Input
                id="search"
                type="text"
                class="relative pl-10 bg-transparent z-10 w-full text-md lg:text-2xl focus-visible:ring-0 focus-visible:border-0 focus:ring-0 focus:border-0 border-0 shadow-[rgba(0,0,0,0.45)_0px_1px_1px_-1px] focus-visible:shadow-[rgba(0,0,0,0.45)_0px_50px_20px_-10px] hover:shadow-[rgba(0,0,0,0.45)_0px_50px_20px_-10px] focus:shadow-[rgba(0,0,0,0.45)_0px_50px_20px_-10px] transition duration-300 ease-in-out"
                autofocus
                @focus="searchFocus = true"
                @focusout="searchFocus = false"
                v-model:model-value="searchText"
              />
              <span
                class="absolute start-0 inset-y-0 flex items-center justify-start w-full overflow-hidden px-2 z-0"
              >
                <Search
                  class="size-6 text-muted-foreground shrink-0 search-icon"
                />
                <Typewriter
                  :text="displayedText"
                  :speed="50"
                  :delay="1000"
                  :repeat="true"
                  v-if="!searchFocus && searchText.length === 0"
                  class="ml-4 pr-4"
                />
              </span>
            </div>
          </FormControl>
        </FormItem>
      </FormField>
    </form>

    <!-- Résultats -->
    <div
      v-if="searchFocus && searchText.length > 0"
      class="w-full mt-12 flex flex-col items-center gap-6"
    >
      <!-- Résultats textuels -->
      <div
        v-for="result in searchResults"
        :key="result.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ result.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mt-2 text-sm">
              {{ result.description }}
            </p>
            <div
              class="mt-4 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-4"
            >
              <span
                >Source :
                <a :href="result.link" class="underline" target="_blank">{{
                  result.link
                }}</a></span
              >
              <span
                >Dernière mise à jour : {{ result.updatedAt || "N/A" }}</span
              >
              <span v-if="result.tags"
                >Tags : {{ result.tags.join(", ") }}</span
              >
            </div>
          </div>
          <div class="flex flex-col items-center gap-2 ml-4">
            <span
              class="text-yellow-500 font-semibold border border-yellow-500 px-2 py-0.5 rounded-full text-xs"
              >Vérifié</span
            >
            <div class="flex flex-col gap-1">
              <button class="text-green-500 hover:text-green-600">
                <ThumbsUp class="text-green-500 w-5 h-5" />
              </button>
              <button class="text-red-500 hover:text-red-600">
                <ThumbsDown class="text-red-500 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Résultats vidéos -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div
          v-for="video in videoResults"
          :key="video.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center"
        >
          <img
            :src="video.thumbnail"
            alt="thumbnail"
            class="w-full h-40 object-cover rounded mb-4"
          />
          <h4 class="text-md font-semibold text-gray-800 dark:text-white">
            {{ video.title }}
          </h4>
          <p class="text-sm text-gray-500">{{ video.source }}</p>
        </div>
      </div>
    </div>
  </section>

  <div
    class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
  >
    <p>© 2025 Query Forge Dev. Tous droits réservés.</p>
    <div class="flex items-center gap-4">
      <NuxtLink to="/privacy" class="flex items-center gap-1 hover:underline">
        <ShieldCheck class="w-4 h-4" />
        Politique de confidentialité
      </NuxtLink>
      <NuxtLink to="/terms" class="flex items-center gap-1 hover:underline">
        <FileText class="w-4 h-4" />
        Conditions d’utilisation
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});

import { ShieldCheck, FileText } from "lucide-vue-next";
import { FormItem, FormLabel } from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Search } from "lucide-vue-next";
import { Typewriter } from "@ui/components/typewriter";
import { cn } from "@lib/utils";
import { ThumbsUp, ThumbsDown } from "lucide-vue-next";
import { ref, watch } from "vue";

const displayedText = ref([
  "How to make a loop in Golang",
  "How to use Vue.js with TypeScript",
  "Understanding Promises in JavaScript",
  "Building REST APIs with Node.js",
  "Exploring the latest features of React",
  "Creating responsive designs with Tailwind CSS",
  "Optimizing performance in web applications",
  "Implementing authentication in web apps",
  "Testing strategies for modern web development",
  "Deploying applications on cloud platforms",
]);

const searchText = ref("");
const searchFocus = ref(false);
const searchResults = ref<any[]>([]);
const videoResults = ref<any[]>([]);

watch(searchText, async (val) => {
  if (val.trim().length === 0) {
    searchResults.value = [];
    videoResults.value = [];
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:3000/api/search?q=${encodeURIComponent(val)}`,
    );
    const data = await res.json();
    searchResults.value = data.texts || [];
    videoResults.value = data.videos || [];
  } catch (e) {
    console.error("Erreur lors de la recherche :", e);
  }
});
</script>

<style scoped>
#search:hover + span .search-icon {
  @apply text-emerald-500 rotate-[360deg] transition duration-300 ease-in-out;
}
</style>
