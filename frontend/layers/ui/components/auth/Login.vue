<template>
  <div class="flex w-full flex-col gap-6">
    <div class="flex flex-col gap-6">
      <Card>
        <CardHeader class="text-center">
          <CardTitle class="text-xl"> Bienvenue </CardTitle>
        </CardHeader>
        <CardContent>
          <form class="grid gap-6" @submit="onSubmit">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem v-auto-animate class="grid gap-2">
                <FormLabel html-for="email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    placeholder="m@example.com"
                    required
                    type="email"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage/>
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="password">
              <FormItem v-auto-animate class="grid gap-2">
                <div class="flex items-center">
                  <FormLabel html-for="password">Password</FormLabel>
                  <a
                    class="ml-auto text-sm underline-offset-4 hover:underline"
                    href="#"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
                <FormControl>
                  <Input
                    id="password"
                    required
                    type="password"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage/>
              </FormItem>
            </FormField>
            <Button class="w-full" type="submit">
              Login
            </Button>
          </form>
          <div class="text-center text-sm mt-6">
            Pas encore de compte ?
            <a class="underline underline-offset-4" href="#" @click.prevent="handleChangeTab"> Créez un compte </a>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Input } from "@ui/components/input";
import { Button } from "@ui/components/button";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import {FormMessage, FormField, FormControl, FormLabel, FormItem} from "@ui/components/form";

const emit = defineEmits(["changeTab", "submit"]);

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email(),
    password: z.string(),
  }).required(),
);

const {handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit((values) => {
  emit('submit', values);
});

const handleChangeTab = () => {
  emit("changeTab");
};
</script>
