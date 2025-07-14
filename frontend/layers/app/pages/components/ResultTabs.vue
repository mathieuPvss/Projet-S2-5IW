<template>
  <div class="w-full">
    <nav class="mb-6">
      <ul class="flex gap-2">
        <li>
          <Button
            variant="ghost"
            :class="tab === 'all' ? 'bg-primary text-primary-foreground' : ''"
            @click="tab = 'all'"
          >
            <List class="mr-2 h-4 w-4"/> Tout
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            :class="tab === 'videos' ? 'bg-primary text-primary-foreground' : ''"
            @click="tab = 'videos'"
          >
            <PlaySquareIcon class="mr-2 h-4 w-4"/> Vidéos
          </Button>
        </li>
      </ul>
    </nav>

    <div class="space-y-4">
      <Gallery :results="topVideoResults" v-if="topVideoResults.length > 0"/>
      <!-- Show all results when tab is 'all' -->
      <template v-if="tab === 'all'">
        <Result v-for="result in sortedTextResults" :key="result.id" :result="result"/>
        <Result v-for="video in slicedVideoResults" :key="video.id" :result="video"/>
      </template>

      <!-- Show only video results when tab is 'videos' -->
      <template v-else-if="tab === 'videos'">
        <Result v-for="video in slicedVideoResults" :key="video.id" :result="video"/>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import Result from "@/layers/app/pages/components/Result.vue";
import type {SearchResult} from "@/dto";
import { List, PlaySquareIcon } from "lucide-vue-next";
import { ref, computed } from 'vue';
import { Button } from "@ui/components/button";
import Gallery from './Gallery.vue';

const props = defineProps({
  textResults: {
    type: Array<SearchResult>,
    required: true
  },
  videoResults: {
    type: Array<SearchResult>,
    required: true
  }
})

const tab = ref('all');

// Computed properties to sort results by score (highest first)
const sortedTextResults = computed(() => {
  return [...props.textResults].sort((a, b) => b.score - a.score);
});

const sortedVideoResults = computed(() => {
  return [...props.videoResults].sort((a, b) => b.score - a.score);
});

const topVideoResults = computed(() => {
  return sortedVideoResults.value.slice(0, 5);
});
const slicedVideoResults = computed(() => {
  return sortedVideoResults.value.slice(5);
});
</script>
