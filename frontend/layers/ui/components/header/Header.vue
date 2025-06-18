<template>
  <header
    :class="cn(
      'w-full p-4 bg-transparent sticky top-0 z-50 flex flex-row items-center justify-between transition-all duration-300 ease-in-out',
       headerScrollClass
     )"
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
const isScrolled = ref(false);

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});
function handleScroll() {
  const scrollTop = window.scrollY;
  console.log('Scroll Top:', scrollTop);
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
