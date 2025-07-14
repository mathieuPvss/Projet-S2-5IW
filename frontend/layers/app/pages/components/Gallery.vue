<template>
  <div class="w-full">
    <h2 class="text-2xl font-bold mb-6">Meilleurs résultats vidéos</h2>
    <div class="relative">
      <div
        ref="scrollContainer"
        class="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        @wheel="handleWheel"
      >
        <div
          v-for="result in props.results"
          :key="result.id"
          class="flex-shrink-0 w-80"
        >
          <Card class="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader class="pb-3">
              <CardTitle class="text-lg line-clamp-2">{{ result.title }}</CardTitle>
              <CardDescription class="flex items-center gap-2 text-sm">
                <Calendar class="w-4 h-4" />
                {{ result.published_at || 'N/A' }}
              </CardDescription>
            </CardHeader>

            <CardContent class="pt-0">
              <NuxtLink
                v-if="result.url"
                :to="result.url"
                target="_blank"
                class="relative group"
                >
                <CardThumbnail
                  v-if="result.thumbnail"
                  :src="result.thumbnail"
                  :alt="result.title"
                  class="w-full h-48 object-cover rounded-md mb-4"
                />
                <SquareArrowOutUpRight
                  v-if="result.thumbnail"
                  class="absolute top-0 bottom-0 left-0 right-0 m-auto opacity-0 transition-all ease-in-out duration-300
                         group-hover:opacity-100 group-hover:scale-110"
                />
              </NuxtLink>

              <p class="text-sm text-muted-foreground line-clamp-3 mb-4">
                {{ result.description }}
              </p>

              <div class="flex flex-wrap gap-1 mb-4">
                <Badge
                  v-for="tag in result.tags"
                  :key="tag"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ tag }}
                </Badge>
              </div>

              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>Source: {{ result.source }}</span>
                <span v-if="result.language">{{ result.language }}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Scroll indicators -->
      <div class="flex justify-center mt-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="scrollLeft"
          :disabled="!canScrollLeft"
        >
          <ArrowLeft/>
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="scrollRight"
          :disabled="!canScrollRight"
        >
          <ArrowRight/>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Calendar, ArrowLeft, ArrowRight, SquareArrowOutUpRight } from "lucide-vue-next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardThumbnail,
  CardFooter
} from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Badge } from "@ui/components/badge";
import type { SearchResult } from "@/dto";

const props = defineProps({
  results: {
    type: Array<SearchResult>,
    required: true
  }
});

const scrollContainer = ref<HTMLElement>();

// Scroll state
const canScrollLeft = ref(false);
const canScrollRight = ref(true);

// Handle horizontal scroll with mouse wheel
function handleWheel(event: WheelEvent) {
  event.preventDefault();
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += event.deltaY;
  }
}

// Scroll functions
function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -320, behavior: 'smooth' });
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 320, behavior: 'smooth' });
  }
}

// Update scroll state
function updateScrollState() {
  if (scrollContainer.value) {
    canScrollLeft.value = scrollContainer.value.scrollLeft > 0;
    canScrollRight.value =
      scrollContainer.value.scrollLeft <
      scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth;
  }
}

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', updateScrollState);
    updateScrollState();
  }
});
</script>

<style scoped>
/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
