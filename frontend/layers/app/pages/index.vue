<template>
  <section class="container overflow-hidden min-h-screen flex flex-col items-center justify-center gap-8">
    <form class="w-full">
      <FormField name="search">
        <FormItem class="flex flex-col items-center lg:flex-row justify-center gap-8 w-full">
          <FormLabel :class="cn('text-4xl md:text-6xl font-bold animate-fade-left transition-all ease-in-out duration-300 whitespace-nowrap')">
            <span class="bg-gradient-to-tl from-slate-300 via-emerald-400 to-slate-400 bg-clip-text text-transparent">Query Forge Dev</span>
            <br/>
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
                @update:model-value="handleSearchChange"
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
    <div v-if="searchText.length > 0" class="w-full mt-12 flex flex-col items-center gap-6">
      <!-- Résultats textuels -->
      <Result v-for="result in searchResults" :key="result.id" :result="result"/>
      <Result v-for="video in videoResults" :key="video.id" :result="video"/>
    </div>
  </section>
</template>
<script lang="ts" setup>
import {invokeAgent} from "@/layers/app/pages/api";
import { FormItem, FormLabel, FormControl, FormField } from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Search } from "lucide-vue-next";
import { Typewriter } from "@ui/components/typewriter";
import { cn } from "@lib/utils";
import { ref } from 'vue';
import type {SearchResult} from "@/dto/searchResult.dto";
import Result from './components/Result.vue'

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
const threadId = ref<string>();

async function handleSearchChange (value: string) {
  console.log('Search text changed:', value);
  console.log('Search text:', searchText.value, searchFocus.value);
  if (value.trim().length === 0) {
    searchResults.value = [];
    videoResults.value = [];
    return;
  }
  try {
    const res = await invokeAgent(value, threadId.value);
    const data = await res.json();
    const results:SearchResult[] = data.content.videos || [];
    videoResults.value = results.filter((video) => video.thumbnail || video.channel);
    videoResults.value.push(
      {
        "id": "p6zu-JcBSVkGGfy5K74Z",
        "score": 19.500927,
        "source": "stackoverflow",
        "title": "How to Measure Memory Usage Per Test Case in Jest?",
        "description": "I'm looking to track the memory consumption of each test case during execution, not just the overall heap size reported after the test run using the --logHeapUsage flag. Is there a reliable way to capture per-test memory metrics in Jest?\nI have tried using --logHeapUsage only I want to find out exact memory usage of test case, is there a way to do it?",
        "url": "https://stackoverflow.com/questions/79697877/how-to-measure-memory-usage-per-test-case-in-jest",
        "thumbnail": "https://i.stack.imgur.com/4b0d1.png",
        "channel": "Square Stack",
        "published_at": "2025-07-11 05:38:29Z",
        "language": "",
        "tags": [
          "ts-jest",
          "ts-jest"
        ]
      }
    )
    searchResults.value = results.filter((result) => !result.thumbnail && !result.channel !== null);
    threadId.value = data.content.threadId || undefined;
    console.log('Search results:', searchResults.value);
    console.log('Video results:', videoResults.value);
  } catch (e) {
    console.error("Erreur lors de la recherche :", e);
  }
}
</script>

<style scoped>
#search:hover + span .search-icon {
  @apply text-emerald-500 rotate-[360deg] transition duration-300 ease-in-out;
}
</style>
