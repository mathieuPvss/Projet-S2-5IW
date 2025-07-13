<template>
</template>
<script setup lang="ts">
import {Heart, Calendar, MessageCircle, Users} from "lucide-vue-next";
import { CardThumbnail } from "@ui/components/card";
import { useAuthStore} from "@/stores/auth";

const props = defineProps({
  admin: {
    type: Boolean,
    default: false,
  },
});
const auth = useAuthStore();
</script>
