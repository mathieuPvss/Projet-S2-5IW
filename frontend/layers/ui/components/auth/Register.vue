<template>
  <Card class="mx-auto">
    <CardHeader>
      <CardTitle class="text-xl">
        Inscription
      </CardTitle>
      <CardDescription>
        Créez un compte pour accéder à toutes les fonctionnalités de notre application.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="grid gap-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                id="email"
                placeholder="m@example.com"
                type="email"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password">
          <FormItem v-auto-animate class="grid gap-2">
            <FormLabel for="password">Mot de passe</FormLabel>
            <FormControl>
              <Input id="password" placeholder="****" type="password" v-bind="componentField"/>
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>
        <Button class="w-full" type="submit">
          S'inscrire
        </Button>
      </form>
      <div class="mt-4 text-center text-sm">
        Déjà un compte ?
        <a class="underline" href="#" @click.prevent="changeTab">
          Se connecter
        </a>
      </div>
    </CardContent>
  </Card>

</template>
<script setup lang="ts">

import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@ui/components/form";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@ui/components/card";
import {Input} from "@ui/components/input";
import {Button} from "@ui/components/button";
import {vAutoAnimate} from '@formkit/auto-animate/vue';
import {toTypedSchema} from "@vee-validate/zod";
import * as z from "zod";
import {useForm} from "vee-validate";

const emit = defineEmits(["changeTab", "submit"]);

const formSchema = toTypedSchema(z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.'),
}))

const {handleSubmit} = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit((values) => {
  emit('submit', values);
})

const changeTab = () => {
  emit('changeTab');
}
</script>
