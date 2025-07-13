<template>
  <Card :key="result.id" class="w-full max-w-4xl">
    <CardHeader class="relative">
      <CardTitle class="text-lg font-bold pr-8">{{ result.title }}</CardTitle>
      <CardDescription class="flex items-center justify-start flex-wrap gap-2">
        <Badge variant="default" v-for="tag in result.tags" :key="tag" class="text-sm">
          {{ tag }}
        </Badge>
      </CardDescription>
      <DropdownMenu>
        <DropdownMenuTrigger class="absolute top-6 right-6">
          <MoreVertical/>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Button variant="ghost" class="hover:fill-foreground/20">
              Enregistrer<BookmarkPlus class="w-5 h-5" />
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button variant="ghost" class="hover:fill-foreground/20" @click="openReportModal">
              Signaler<Flag class="w-5 h-5"/>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardDescription>

    </CardDescription>
    <CardContent class="relative">
      <CardThumbnail v-if="result.thumbnail" :src="result.thumbnail" alt="Thumbnail"/>
      <p v-if="result.channel">Chaîne : {{ result.channel }}</p>
      <p class="text-gray-600 dark:text-gray-300 mt-2 text-sm">{{ result.description }}</p>
    </CardContent>
    <CardFooter>
      <div class="grid grid-cols-2 text-xs text-foreground-muted w-full">
        <span>Source : <a :href="result.url" class="underline" target="_blank">{{ result.source }}</a></span>
        <span v-if="result.published_at">Publié le : <time :datetime="result.published_at"> {{ result.published_at }}</time></span>
      </div>
    </CardFooter>
  </Card>

  <!-- Report Modal -->
  <Modal
    v-model="modal.isOpen.value"
    :title="modal.config.value.title"
    :show-footer="modal.config.value.showFooter"
    :show-cancel-button="modal.config.value.showCancelButton"
    :show-ok-button="modal.config.value.showOkButton"
    :cancel-text="modal.config.value.cancelText"
    :ok-text="modal.config.value.okText"
    @cancel="handleModalCancel"
    @ok="handleReport"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        Décrivez le problème rencontré avec ce document :
      </p>
      <Textarea
        placeholder="Décrivez le problème rencontré avec ce document"
        class="w-full h-32"
        v-model="reportDescription"
      />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardThumbnail,
  CardTitle
} from "@ui/components/card";
import {BookmarkPlus, Flag, MoreVertical} from "lucide-vue-next";
import {Badge} from "@ui/components/badge";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@ui/components/dropdown-menu";
import {Button} from "@ui/components/button";
import {Textarea} from "@ui/components/textarea";
import {createReport} from "@/layers/app/pages/api";
import type {CreateReportDto} from "@/dto";
import {useAuthStore} from "@/stores/auth";
import {ReportStatus} from "@/enums";
import {toast} from "@ui/components/toast";
import {Modal, useFormModal} from "@ui/components/modal";

const auth = useAuthStore();

const reportDescription = ref<string>('');

// Use the form modal composable
const modal = useFormModal();

const props = defineProps<{
  result: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    url: string;
    source: string;
    published_at?: string;
    thumbnail?: string;
    channel?: string;
  };
}>();

function openReportModal() {
  console.log('Opening report modal for document:', auth.user);
  modal.updateConfig({
    title: 'Signaler un document',
    okText: 'Envoyer le signalement',
    cancelText: 'Annuler'
  });
  modal.open();
}

function handleModalCancel() {
  modal.close();
  reportDescription.value = "";
}

async function handleReport() {
  if (!auth.user) {
    toast({
      title: 'Erreur',
      description: 'Vous devez être connecté pour signaler un document.',
      variant: 'destructive'
    });
    return;
  }

  if(!reportDescription.value.trim()) {
    toast({
      title: 'Erreur',
      description: 'Veuillez fournir une description pour le signalement.',
      variant: 'destructive'
    });
    return;
  }

  const params: CreateReportDto = {
    document_id: props.result.id,
    user_id: auth.user?.sub,
    description: reportDescription.value,
    status: ReportStatus.PENDING
  }

  try {
    const res = await createReport(params);
    if (res.status === 201) {
      toast({
        title: 'Signalement créé',
        description: 'Votre signalement a été envoyé avec succès.',
        variant: 'default'
      });
      modal.close();
      reportDescription.value = "";
    } else {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du signalement.',
        variant: 'destructive'
      });
    }
  } catch (error) {
    console.error('Error creating report:', error);
    toast({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la création du signalement.',
      variant: 'destructive'
    });
  }
}
</script>
