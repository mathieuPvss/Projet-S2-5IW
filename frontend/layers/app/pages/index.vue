<template>
  <section class="container overflow-hidden min-h-screen flex flex-col items-center justify-center">
    <form class="w-full">
      <FormField name="search">
        <FormItem class="flex flex-col items-center lg:flex-row justify-center gap-8 w-full">
          <FormLabel :class="cn('text-6xl font-bold animate-fade-left transition-all ease-in-out duration-300 whitespace-nowrap')">
            <span class="bg-gradient-to-tl from-slate-300 via-emerald-400 to-slate-400 bg-clip-text text-transparent">Gogole</span>
            <br/>
            Search Engine
          </FormLabel>
          <FormControl>
            <div :class="cn('relative w-full items-center max-w-sm text-md lg:text-2xl transition-all duration-300 ease-in-out',
              searchFocus ? 'w-full max-w-full flex-1' : 'w-[500px]')">
              <Input
                id="search"
                type="text"
                class="relative pl-10 bg-transparent z-10 w-full
                text-md lg:text-2xl
                focus-visible:ring-0 focus-visible:border-0 focus:ring-0 focus:border-0 border-0
                shadow-[rgba(0,0,0,0.45)_0px_1px_1px_-1px] focus-visible:shadow-[rgba(0,0,0,0.45)_0px_50px_20px_-10px] hover:shadow-[rgba(0,0,0,0.45)_0px_50px_20px_-10px] focus:shadow-[rgba(0,0,0,0.45)_0px_50px_20px_-10px]
                transition duration-300 ease-in-out"
                autofocus
                @focus="searchFocus = true"
                @focusout="searchFocus = false"
                @input="handleSearchChange"
                v-model:model-value="searchText"
              />
              <span class="absolute start-0 inset-y-0 flex items-center justify-start w-full overflow-hidden px-2 z-0">
                <Search class="size-6 text-muted-foreground shrink-0 search-icon" />
                <Typewriter :text="displayedText" :speed="50" :delay="1000" :repeat="true" v-if="!searchFocus  && searchText.length === 0" class="ml-4 pr-4"/>
              </span>

            </div>
          </FormControl>
        </FormItem>
      </FormField>
    </form>
  </section>
</template>
<script lang="ts" setup>
import { FormItem, FormLabel } from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Search } from "lucide-vue-next";
import {Typewriter} from "@ui/components/typewriter";
import {cn} from "@lib/utils";

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
  "Deploying applications on cloud platforms"
]);
const searchText = ref("");
const searchFocus = ref(false);
function handleSearchChange(e: Event) {
  searchFocus.value = true;
}
</script>
<style scoped>
#search:hover + span .search-icon {
  @apply text-emerald-500 rotate-[360deg] transition duration-300 ease-in-out;
}
</style>
