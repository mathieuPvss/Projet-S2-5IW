<template>
  <p class="overflow-hidden whitespace-nowrap text-md lg:text-2xl text-muted-foreground"
     v-if="!hidden"
     ref="textContainer"
  >
    {{ displayedText }}
    <span :class="cn('inline-block w-3 bg-muted-foreground h-0.5',animation)"></span>
  </p>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { computed } from 'vue';
import { cn } from '@lib/utils';
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
const animation = computed(() => {
  return `animate-[cursor-blink_0.5s_ease-in-out_infinite]`;
});
onMounted(() => {
  typeText(props.text, props.speed, props.repeat, props.delay);
});
</script>
