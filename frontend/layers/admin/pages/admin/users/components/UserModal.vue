<template>
  <Dialog v-model:open="modalOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {{ isEdit ? "Modifier l'utilisateur" : "Créer un utilisateur" }}
        </DialogTitle>
        <DialogDescription>
          {{
            isEdit
              ? "Modifiez les informations de l'utilisateur ci-dessous."
              : "Créez un nouvel utilisateur en remplissant les informations ci-dessous."
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!isEdit" class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="example@email.com"
            required
          />
        </div>

        <div v-if="!isEdit" class="space-y-2">
          <Label for="password">Mot de passe</Label>
          <Input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="isEdit" class="space-y-2">
          <Label for="new-password">Nouveau mot de passe (optionnel)</Label>
          <Input
            id="new-password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
          />
        </div>

        <div class="space-y-2">
          <Label for="role">Rôle</Label>
          <Select v-model="form.role">
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Utilisateur</SelectItem>
              <SelectItem value="admin">Administrateur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="isEdit" class="flex items-center space-x-2">
          <Checkbox id="verified" v-model:checked="form.verified" />
          <Label for="verified">Compte vérifié</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="closeModal">
            Annuler
          </Button>
          <Button type="submit" :disabled="loading">
            {{ loading ? "Enregistrement..." : isEdit ? "Modifier" : "Créer" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select";
import { Checkbox } from "@ui/components/checkbox";
import { toast } from "@ui/components/toast";
import type { User } from "@/entities";
import { Api, type CreateUserDto, type AdminUpdateUserDto } from "./api";

interface Props {
  isOpen: boolean;
  user?: User | null;
}

interface Emits {
  (e: "update:isOpen", value: boolean): void;
  (e: "userSaved"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);
const isEdit = computed(() => !!props.user);

const form = reactive({
  email: "",
  password: "",
  role: "user" as "user" | "admin",
  verified: false,
});

const modalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => emit("update:isOpen", value),
});

// Reset form when modal opens/closes or user changes
watch([() => props.isOpen, () => props.user], () => {
  if (props.isOpen) {
    if (props.user) {
      // Edit mode
      form.email = props.user.email;
      form.password = "";
      form.role = props.user.role;
      form.verified = props.user.verified ?? false;
    } else {
      // Create mode
      form.email = "";
      form.password = "";
      form.role = "user";
      form.verified = false;
    }
  }
});

const handleSubmit = async () => {
  loading.value = true;

  try {
    if (isEdit.value && props.user) {
      // Edit mode
      const updateData: AdminUpdateUserDto = {
        role: form.role,
        verified: form.verified,
      };

      if (form.password) {
        updateData.password = form.password;
      }

      await Api.updateUser(props.user.id, updateData);
      toast({
        title: "Succès",
        description: "Utilisateur modifié avec succès",
      });
    } else {
      // Create mode
      const createData: CreateUserDto = {
        email: form.email,
        password: form.password,
        role: form.role,
      };

      await Api.createUser(createData);
      toast({
        title: "Succès",
        description: "Utilisateur créé avec succès",
      });
    }

    emit("userSaved");
    closeModal();
  } catch (error) {
    console.error("Error saving user:", error);
    toast({
      title: "Erreur",
      description: `Erreur lors de ${isEdit.value ? "la modification" : "la création"} de l'utilisateur`,
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit("update:isOpen", false);
};
</script>
