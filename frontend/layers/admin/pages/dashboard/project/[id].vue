<template>
  <Card v-if="project" class="mb-4 break-inside-avoid-column">
    <CardThumbnail
      :src="project?.image ? project.image : 'https://placehold.co/300x150'"
      alt="Project Image"
      class="m-auto"
    >
      <div class="flex flex-col gap-2 pt-6">
        <div class="flex justify-start flex-wrap items-center gap-2">
          <Badge
            v-for="tech in project.techno_name"
            :key="tech"
          >
            {{ tech }}
          </Badge>
          <Badge
            v-for="spec in project.specialization"
            :key="spec"
            variant="night"
          >
            {{ project.year }}{{ project.spec_name[0] }}
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
          <div class="flex gap-1 items-center">
            <MessageCircle class="w-4 h-4" />
            <span>{{ project.comment?.length || 0 }}</span>
          </div>
          <div class="flex gap-1 items-center">
            <Heart class="h-4 w-4"/>
            <span>{{ project.totalLikes }}</span>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter class="w-full">
      <div class="flex justify-between items-center w-full">
        <Badge variant="outline" class="text-sm">
          {{ project.status }}
        </Badge>
      </div>
    </CardFooter>
  </Card>
  <div v-if="comments" class="min-w-[400px]">
    <div v-for="comment in comments" :key="comment.id" class="mb-4 p-4 bg-muted rounded-md flex flex-col items-start justify-start gap-2  w-full">
      <p>
        @{{ comment.fullname[0] }}
      </p>
      <p>{{ comment.comment }}</p>
    </div>
  </div>

</template>
<script setup lang="ts">
import type {ProjectDto} from "@/dto/project.dto";
import {fetchProject, fetchProjectComments} from "@/layers/admin/api";
import {Calendar, Heart, MessageCircle, Users} from "lucide-vue-next";
import {CardThumbnail} from "@ui/components/card";
import { toast } from "@ui/components/toast";

const route = useRoute();
const { id } = route.params;

const project: Ref<ProjectDto> = ref();
const comments: Ref<Record<string, never>[]> = ref([]);

onMounted(async () => {
  await loadProject(id);
});

async function loadProject(id: string) {
  const response = await fetchProject(id);
  const data: ProjectDto = await response.json();
  if(!response.ok) {
    toast({
      title: `Error ${response.status}`,
      description: "Une erreur est survenue lors de la récupération du projet.",
      variant: "destructive",
    });
    return;
  }
  project.value = data;
  if(project.value.comment) {
    await loadComments(project.value.comment);
  }
}
async function loadComments(ids: string) {
  const response = await fetchProjectComments(ids);
  const data = await response.json();
  if(!response.ok) {
    toast({
      title: `Error ${response.status}`,
      description: "Une erreur est survenue lors de la récupération des commentaires.",
      variant: "destructive",
    });
    return;
  }
  comments.value = data;
}
</script>
