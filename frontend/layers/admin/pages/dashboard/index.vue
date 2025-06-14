<template>
    <div class="p-4 space-y-4">
        <h2 class="text-xl font-bold">
          Nombre total de projets : {{ totalProjects }}
        </h2>

        <h2 class="text-xl font-bold">
          Nombre total de likes : {{ totalLikes }}
        </h2>

        <BarChart
          :data="data"
          index="name"
          :categories="['projectsNumber']"
          :y-formatter="yFormatter"
        />
      </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BarChart } from '@ui/components/chart-bar'
import axios from 'axios'
import type { ProjectDto } from "@/dto/project.dto";
import { getProjects } from "@/layers/app/api";
import { filterParams } from "@lib/utils";

interface Technology {
  name: string
  projectsNumber: number
}

const data = ref<Technology[]>([])
const projects: Ref<ProjectDto[]> = ref([]);
const pageSize = ref(50);
const filters = ref({
  techno_name: [],
  spec_name: [],
  year: [],
});

onMounted(async () => {
    await loadProjects(1);
  try {
    const response = await axios.get<Technology[]>('http://localhost:3001/api/technos/technologies')
    data.value = response.data
  } catch (error) {
    console.error('Erreur lors du fetch des technologies', error)
  }
})

async function loadProjects(page?: number) {
  const query = {
    page: page || currentPage.value,
    pageSize: pageSize.value,
    techno_name: filters.value.techno_name.length > 0 ? filters.value.techno_name : null,
    spec_name:
      filters.value.spec_name.length > 0 ? filters.value.spec_name : null,
    year: filters.value.year.length > 0 ? filters.value.year : null,
    email: null,
  };
  const params = new URLSearchParams(filterParams(query));
  const response = await getProjects(params.toString());

  const data: Record<string, never> = await response.json();

  if (!response.ok) {
    toast({
      title: `Erreur ${response.status}`,
      description:
        "Une erreur est survenue lors de la récupération des projets.",
      variant: "destructive",
    });
    return;
  }
  projects.value = data;
}


const totalProjects = computed(() => {
  return data.value.reduce((sum, tech) => sum + (tech.projectsNumber || 0), 0)
})

const totalLikes = computed(() => {
  return projects.value.reduce((sum, project) => sum + (project.totalLikes || 0), 0)
})

const yFormatter = (tick: any) => {
  return typeof tick === 'number' ? `${tick} projets` : ''
}

definePageMeta(
  {
    layout: 'admin',
  }
)
</script>
