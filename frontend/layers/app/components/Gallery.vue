<template>
  <div class="flex flex-col items-center justify-center h-full w-full relative gap-4">
    <p v-if="projects.length === 0" class="text-center w-full h-[100vh] flex-1 text-muted-foreground text-2xl flex items-center justify-center">
      <span class="">Aucun projet trouvé</span>
    </p>
    <div class="xl:columns-4 lg:columns-3 md:columns-2 sm:columns-1 gap-4">
      <template v-for="project in projects" :key="project.id">
        <Card
          v-if="project.status[0] !== 'Hidden' || props.admin"
          class="mb-4 break-inside-avoid-column"
        >
          <CardThumbnail
            :src="
              !!project.image ? project.image : 'https://placehold.co/300x150'
            "
            alt="Project Image"
            class="m-auto"
          >
            <div class="flex flex-col gap-2 pt-6">
              <div class="flex justify-start flex-wrap items-center gap-2">
                <Badge
                  v-for="tech in project.techno"
                  :key="tech"
                  @click="handleFilterChange({ techno_name: getTechno(tech) })"
                >
                  {{ getTechno(tech) }}
                </Badge>
                <Badge
                  v-for="spec in project.specialization"
                  :key="spec"
                  variant="night"
                  @click="handleFilterChange({spec_name: getSpecName(spec), year: project.year})"
                >
                  {{ project.year }}{{ getSpecName(spec) }}
                </Badge>
              </div>
            </div>
          </CardThumbnail>
          <CardHeader class="w-full">
            <CardTitle class="hover:underline">
              <NuxtLink :href="project.link">
                {{ project.name }}
              </NuxtLink>
            </CardTitle>
            <CardDescription>
              <p>{{ project.description }}</p>
            </CardDescription>
          </CardHeader>
          <CardContent class="w-full">
            <div class="flex flex-wrap justify-start gap-2 items-center mb-2">
              <Users class="h-4 w-4" />
              <Badge
                v-for="name in project.fullname"
                :key="name"
                class="mr-2"
                variant="secondary"
              >
                {{ name }}
              </Badge>
            </div>
            <div class="flex justify-between items-center">
              <div class="flex gap-2 items-center">
                <Calendar class="h-4 w-4" /><Badge variant="outline">{{
                  project.date
                }}</Badge>
              </div>
              <div class="flex items-center justify-end gap-2">
                <div>
                  <NuxtLink
                      v-if="auth.user.isAdmin"
                      :href="'/dashboard/project/'+project.idAirTable"
                      class="cursor-pointer flex gap-1 items-center"
                  >
                    <MessageCircle class="w-4 h-4" />
                    <span>{{ project.comment?.length || 0 }}</span>
                  </NuxtLink>
                </div>
                <div class="flex gap-1 items-center">
                  <Heart class="h-4 w-4" :class="{ 'fill-black': project.usersWhoLiked?.includes(auth.user?.id), 'cursor-pointer': !props.admin }" @click="handleLikeChange({ projectId: project.idAirTable })"/>
                  <span>{{ project.totalLikes }}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter v-if="admin" class="w-full">
            <div class="flex justify-between items-center w-full">
              <EditProject
                v-if="users.length && technos.length && specializations.length"
                :project="project" :participant-list="users" :techno-list="technos" :spec-list="specializations"
                @success="handleSuccess"
              />
              <Badge variant="outline" class="text-sm">
                {{ project.status }}
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </template>
    </div>
    <EditProject
        v-if="users.length > 0 && technos.length > 0 && specializations.length > 0"
        :project="null" :participant-list="users" :techno-list="technos" :spec-list="specializations"
        @success="handleSuccess"
    />
  </div>
</template>
<script setup lang="ts">
import {Heart, Calendar, MessageCircle, Users} from "lucide-vue-next";
import { CardThumbnail } from "@ui/components/card";
import type { ProjectDto } from "@/dto/project.dto";
import { getProjects, getAllUsers, getAllSpecializations, getAllTechnos } from "@/layers/app/api";
import { toast } from "@ui/components/toast";
import { filterParams } from "@lib/utils";
import { useAuthStore} from "@/stores/auth";

const props = defineProps({
  admin: {
    type: Boolean,
    default: false,
  },
});
const auth = useAuthStore();
const projects: Ref<ProjectDto[]> = ref([]);
const technos: Ref<Record<string,string>[]> = ref([]);
const specializations: Ref<Record<string,string>[]> = ref([]);
const users: Ref<Record<string,string>[]> = ref([]);

onMounted(async () => {
  await loadProjects(1);
  await loadUsers();
  await loadSpecializations();
  await loadTechnos();
});

const currentPage = ref(1);
const pageSize = ref(10);
const filters = ref({
  techno_name: [],
  spec_name: [],
  year: [],
});

async function loadProjects(page?: number) {
  const query = {
    page: page || currentPage.value,
    pageSize: pageSize.value,
    techno_name: filters.value.techno_name.length > 0 ? filters.value.techno_name : null,
    spec_name:
      filters.value.spec_name.length > 0 ? filters.value.spec_name : null,
    year: filters.value.year.length > 0 ? filters.value.year : null,
    email: props.admin ? auth.user?.email : null,
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

function handleFilterChange(filter: Record<string, string>) {
  for(const key in filter) {
    if (!Object.prototype.hasOwnProperty.call(filters.value, key)) {
      return;
    }
    if(!filters.value[key].includes(filter[key])) {
      filters.value[key] = filter[key];
    }
  }
  loadProjects(1);
}

async function handleLikeChange(projectId: number) {
  if(props.admin) {
    return;
  }
  if(!auth.user) {
    toast({
      title: "Erreur",
      description: "Vous devez être connecté pour aimer un projet.",
      variant: "destructive",
    });
    return;
  }

  const response = await addLikeOnProject(projectId);
  if (!response.ok) {
    toast({
      title: `Erreur ${response.status}`,
      description:
        "Une erreur est survenue lors de l'ajout du like au projet.",
      variant: "destructive",
    });
    return;
  }
  await loadProjects(1);
}

async function loadUsers() {
  const response = await getAllUsers();
  const data: Record<string, never> = await response.json();

  if (!response.ok) {
    toast({
      title: `Erreur ${response.status}`,
      description:
        "Une erreur est survenue lors de la récupération des utilisateurs.",
      variant: "destructive",
    });
    return;
  }
  users.value = data;
}
async function loadTechnos() {
  const response = await getAllTechnos();
  const data: Record<string, never> = await response.json();
  if (!response.ok) {
    toast({
      title: `Erreur ${response.status}`,
      description:
        "Une erreur est survenue lors de la récupération des technos.",
      variant: "destructive",
    });
    return;
  }
  technos.value = data;
}
async function loadSpecializations() {
  const response = await getAllSpecializations();
  const data: Record<string, never> = await response.json();
  if (!response.ok) {
    toast({
      title: `Erreur ${response.status}`,
      description:
        "Une erreur est survenue lors de la récupération des spécialisations.",
      variant: "destructive",
    });
    return;
  }
  specializations.value = data;
}

function getTechno(techno: string) {
  const technoName = technos.value.find((t) => t.id === techno);
  return technoName ? technoName.name : techno;
}

function getSpecName(spec: string) {
  const specName = specializations.value.find((s) => s.id === spec);
  return specName ? specName.name : spec;
}
async function handleSuccess() {
  await loadProjects(1);
  await loadUsers();
  await loadTechnos();
  await loadSpecializations();
}
</script>
