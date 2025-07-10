// https://nuxt.com/docs/api/configuration/nuxt-config

import { dirname, join } from "path";
import { fileURLToPath } from "url";

const currentDir = dirname(fileURLToPath(import.meta.url));
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: "",
    },
  },
  devtools: { enabled: true },

  extends: [
    "./layers/base",
    "./layers/ui",
    "./layers/api",
    "./layers/home",
    "./layers/app",
    "./layers",
  ],

  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "shadcn-nuxt",
    "@pinia/nuxt",
    "@vueuse/nuxt",
  ],

  colorMode: {
    preference: "light", // default value of $colorMode.preference
    fallback: "light", // fallback value if not system preference found
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "",
    storage: "localStorage", // or 'sessionStorage' or 'cookie'
    storageKey: "nuxt-color-mode",
  },

  //css: ['./layers/app/public/output.css'],
  css: ["./layers/base/assets/scss/input.scss"],

  tailwindcss: {
    configPath: "./tailwind.config.ts",
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     */
    componentDir: "./layers/ui/components",
  },
  components: [
    {
      path: join(currentDir, "./layers/ui"),
      // this is required else Nuxt will autoImport `.ts` file
      extensions: [".vue"],
    },
  ],
  // plugins: [
  //   './plugins/v-scroll.ts'
  // ],
  alias: {
    "@": fileURLToPath(new URL("./", import.meta.url)),
    "@lib": fileURLToPath(new URL("./layers/base/lib", import.meta.url)),
    "@ui": fileURLToPath(new URL("./layers/ui", import.meta.url)),
    "@plugins": fileURLToPath(new URL("./plugins", import.meta.url)),
  },

  compatibilityDate: "2025-04-07",
});
