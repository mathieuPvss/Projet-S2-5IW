<template>
  <header
    :class="cn('w-full p-4 backdrop-blur bg-gray-400/30 sticky top-0 z-50 flex flex-row items-center justify-between transition-all durantion-300 ease-in-out' + headerScrollClass)"
  >
    <NuxtLink href="/" class="flex items-center">
      <SiteIcon height="24" width="48"/>
      <span class="ml-2 font-bold">Gogole</span>
    </NuxtLink>

    <Button v-if="isTablet && !isToggled" variant="ghost" @click="handleToggleMenu" aria-label="Toggle menu" class="h-full p-4 [&_svg]:size-12">
      <Icon icon="ic:round-menu"/>
    </Button>
    <MainMenu v-else/>
  </header>
  <MobileMenu v-if="isTablet && isToggled" @toggle="handleToggleMenu"/>
</template>

<script lang="ts" setup>
import { MainMenu } from "@ui/components/menu";
import SiteIcon from "@/layers/base/components/SiteIcon.vue";
import { useMediaQuery } from "@vueuse/core";
import { MobileMenu } from "@ui/components/menu";
import {Icon} from "@iconify/vue";
import { onMounted } from "vue";
import { cn } from "@lib/utils";

const isTablet = useMediaQuery("(max-width: 1024px)");
const isToggled = ref(false);

const headerScrollClass = ref('');

onMounted(() => {
  window.onscroll = () => {
    if (window.scrollY > 0) {
      headerScrollClass.value = ' bg-transparent backdrop-blur-none py-0';
    } else {
      headerScrollClass.value = '';
    }
  };
})

function handleToggleMenu() {
  isToggled.value = !isToggled.value;
  document.body.classList.toggle('fixed');
  document.body.classList.toggle('w-full');
}
</script>
