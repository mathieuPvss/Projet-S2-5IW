<template>
  <header
    :class="cn(
      'w-full p-4 bg-transparent sticky top-0 z-50 flex flex-row items-center justify-between transition-all duration-300 ease-in-out',
      headerScrollClass
    )"
  >
    <NuxtLink href="/" class="flex items-center">
      <SiteIcon height="24" width="48"/>
      <span class="ml-2 font-bold">Query Forge Dev</span>
    </NuxtLink>

    <div class="flex items-center gap-4">
      <!-- Backoffice si admin -->
      <NuxtLink
        v-if="auth.user?.role === 'admin'"
        href="/admin"
        class="flex items-center text-sm font-medium hover:underline text-red-500"
        aria-label="Accéder au Backoffice"
      >
        <Icon icon="mdi:view-dashboard" class="mr-1" />
        Backoffice
      </NuxtLink>

      <!-- Menu burger pour les tablettes et mobiles uniquement si connecté -->
      <Button
        v-if="auth.token && isTablet && !isToggled"
        variant="ghost"
        @click="handleToggleMenu"
        aria-label="Toggle menu"
        class="h-full p-4 [&_svg]:size-12"
      >
        <Icon icon="ic:round-menu" />
      </Button>

      <!-- Menu principal si connecté -->
      <MainMenu v-else-if="auth.token" />

      <!-- Bouton de connexion si NON connecté -->
      <NuxtLink
        v-if="!auth.token"
        href="/authentication"
        class="flex items-center text-sm font-medium hover:underline"
        aria-label="Se connecter"
      >
        <Icon icon="mdi:login" class="mr-1" />
        Connexion
      </NuxtLink>
    </div>
  </header>

  <!-- Menu mobile si connecté -->
  <MobileMenu
    v-if="auth.token && isTablet && isToggled"
    @toggle="handleToggleMenu"
  />
</template>

<script lang="ts" setup>
import { MainMenu, MobileMenu } from "@ui/components/menu";
import SiteIcon from "@/layers/base/components/SiteIcon.vue";
import { useMediaQuery } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { onMounted, ref } from "vue";
import { cn } from "@lib/utils";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const isTablet = useMediaQuery("(max-width: 1024px)");
const isToggled = ref(false);

const headerScrollClass = ref('');
const isScrolled = ref(false);

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

function handleScroll() {
  const scrollTop = window.scrollY;
  if (!isScrolled.value && scrollTop > 300) {
    isScrolled.value = true;
    headerScrollClass.value = ' py-0';
  } else if (isScrolled.value && scrollTop <= 200) {
    isScrolled.value = false;
    headerScrollClass.value = '';
  }
}

function handleToggleMenu() {
  isToggled.value = !isToggled.value;
  document.body.classList.toggle('fixed');
  document.body.classList.toggle('w-full');
}
</script>
