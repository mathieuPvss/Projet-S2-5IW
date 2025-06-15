<template>
  <p class="overflow-hidden whitespace-nowrap text-md lg:text-2xl text-muted-foreground px-4"
     v-if="!hidden"
     ref="textContainer"
  >
    <template v-for="(char, index) in displayedText" :key="index">
      {{ char }}
    </template>
    <span class="inline-block w-2 animate-pulse">|</span>
  </p>
</template>
<script lang="ts" setup>
const props = defineProps(
  {
    text: {
      type: Array<string>,
      required: true,
    },
    speed: {
      type: Number,
      default: 50,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    repeat: {
      type: Boolean,
      default: false,
    },
    delay: {
      type: Number,
      default: 0,
    },
  }
);
import { ref, onMounted } from 'vue';
const displayedText: Ref<string> = ref('');
const textContainer = ref<HTMLElement | null>(null);
const typeText = (text: string[], speed: number, repeat: boolean, delay: number) => {
  let index = 0;
  let charIndex = 0;
  let currentText = '';
  const typeNextChar = () => {
    if (charIndex < text[index].length) {
      currentText += text[index][charIndex];
      charIndex++;
      displayedText.value = currentText;
      if (textContainer.value) {
        textContainer.value.scrollLeft = textContainer.value.scrollWidth;
      }
      setTimeout(typeNextChar, speed);
    } else {
      if (index < text.length - 1) {
        index++;
        charIndex = 0;
        currentText = '';
        setTimeout(typeNextChar, delay);
      } else if (repeat) {
        index = 0;
        charIndex = 0;
        currentText = '';
        setTimeout(typeNextChar, delay);
      }
    }
  };
  typeNextChar();
};
onMounted(() => {
  typeText(props.text, props.speed, props.repeat, props.delay);
});
</script>
