<template>
  <div v-if="auth.token === null" class="flex min-h-svh w-full flex-col items-center gap-6 p-6 md:p-10">
    <a class="flex items-center gap-2 self-center font-medium" href="#">
      <div class="flex h-8 w-8 p-1 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <SiteIcon color="white"/>
      </div>
      Gogole Inc.
    </a>
    <Tabs class="w-[400px]" :model-value="activeTab">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="login" @click="handleChangeTab('login')">
          Connexion
        </TabsTrigger>
        <TabsTrigger value="register" @click="handleChangeTab('register')">
          Inscription
        </TabsTrigger>
      </TabsList>
      <TabsContent value="login" class="animate-fade-left">
        <Login @change-tab="handleChangeTab('register')" @submit="handleLogin"/>
      </TabsContent>
      <TabsContent value="register" class="animate-fade-left">
        <Register @change-tab="handleChangeTab('login')" @submit="handleRegister" />
      </TabsContent>
      <div
        class="mt-6 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <NuxtLink to="/terms">Terms of Service</NuxtLink>
        and <NuxtLink to="/privacy">Privacy Policy</NuxtLink>.
      </div>
    </Tabs>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import {Login, Register} from '@ui/components/auth';
import {toast} from "@ui/components/toast";
import { useAuthStore} from "@/stores/auth";

const activeTab = ref<string>('login');
const baseUrl = useRuntimeConfig().public.apiBaseUrl

const auth = useAuthStore();
onMounted(async () => {
  if(auth.token)
    await navigateTo({path: '/'});
});

const handleChangeTab = (tab: string) => {
  activeTab.value = tab;
};

const handleRegister = async (values: Record<string, string>) => {
  try {
    const response = await fetch(baseUrl + '/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: values.lastname,
        firstname: values.firstname,
        email: values.email,
        password: values.password,
      }),
    });

    const data: Record<string, string>[] = await response.json();

    if (!response.ok) {
      toast({
        title: 'Erreur',
        description: data.message || 'Une erreur est survenue lors de l\'inscription.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Inscription réussie !',
      description: 'Vous pouvez maintenant vous connecter.',
    });

    handleChangeTab('login');

  } catch (error) {
    toast({
      title: 'Erreur',
      description: error.message || 'Une erreur est survenue.',
      variant: 'destructive',
    });
  }
};

const handleLogin = async (values: Record<string, string>) => {
  try {
    const response = await fetch(baseUrl + '/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    });

    const data: Record<string, string>[] = await response.json();

    if (!response.ok) {
      if(response.status === 401) {
        toast({
          title: 'Erreur',
          description: 'Le mot de passe et/ou l\'email sont incorrects.',
          variant: 'destructive',
        });
        return;
      }
      if (response.status === 400) {
        toast({
          title: 'Erreur',
          description: 'Tous les champs sont obligatoires.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Erreur',
        description: data.message || 'Une erreur est survenue lors de la connexion.',
        variant: 'destructive',
      });
      return;
    }
    auth.login(data.token);

    toast({
      title: 'Connexion réussie !',
      description: 'Bienvenue !',
    });
    await navigateTo('/');
  } catch (error) {
    toast({
      title: 'Erreur',
      description: error.message || 'Une erreur est survenue.',
      variant: 'destructive',
    });
  }
};
</script>
