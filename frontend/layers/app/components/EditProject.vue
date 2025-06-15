<template>
  <Form
    v-slot="{ handleSubmit }"
    as=""
    keep-values
    :validation-schema="formSchema"
    :initial-values="initialValues"
  >
    <Dialog>
      <DialogTrigger as-child>
        <Button variant="outline" :class="props.project ? '' : 'fixed bottom-6'">
          {{ props.project ? "Edit project" : "Create project" }}
        </Button>
      </DialogTrigger>
      <DialogScrollContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{
            props.project ? "Edit project" : "Create project"
          }}</DialogTitle>
        </DialogHeader>

        <form id="dialogForm" @submit="handleSubmit($event, onSubmit)">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="project name"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel>Project description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="project description"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="link">
            <FormItem>
              <FormLabel>Project link</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="project link"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            :model-value="selectedParticipants.map((i) => i.value)"
            name="fullname"
          >
            <FormItem>
              <FormLabel>Participants</FormLabel>
              <FormControl>
                <Combobox
                  v-model:open="participantOpen"
                  v-model="selectedParticipants"
                  :ignore-filter="true"
                >
                  <ComboboxAnchor as-child>
                    <TagsInput
                      v-model="selectedParticipants"
                      class="px-2 gap-2 w-80"
                    >
                      <div class="flex gap-2 flex-wrap items-center">
                        <TagsInputItem
                          v-for="{ value, label } in selectedParticipants"
                          :key="value"
                          :value="label"
                        >
                          <TagsInputItemText />
                          <TagsInputItemDelete
                            @click="handleDeleteParticipant(value)"
                          />
                        </TagsInputItem>
                      </div>

                      <ComboboxInput v-model="participantsSearchTerm" as-child>
                        <TagsInputInput
                          placeholder="Participants..."
                          class="min-w-[200px] w-full p-0 border-none focus-visible:ring-0 h-auto"
                          @keydown.enter.prevent
                        />
                      </ComboboxInput>
                    </TagsInput>

                    <ComboboxList class="w-[--reka-popper-anchor-width]">
                      <ComboboxEmpty />
                      <ComboboxGroup>
                        <ComboboxItem
                          v-for="participant in filteredParticipants"
                          :key="participant.value"
                          :value="participant.label"
                          @select.prevent="
                            (ev) => {
                              if (typeof ev.detail.value === 'string') {
                                participantsSearchTerm = '';
                                selectedParticipants.push({
                                  label: ev.detail.value,
                                  value: getParticipant(ev.detail.value),
                                });
                              }

                              if (filteredParticipants.length === 0) {
                                participantOpen = false;
                              }
                            }
                          "
                        >
                          {{ participant.label }}
                        </ComboboxItem>
                      </ComboboxGroup>
                    </ComboboxList>
                  </ComboboxAnchor>
                </Combobox>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            :model-value="selectedTechnos.map((i) => i.value)"
            name="techno_name"
          >
            <FormItem>
              <FormLabel>Technologies</FormLabel>
              <FormControl>
                <Combobox
                  v-model:open="technoOpen"
                  v-model="selectedTechnos"
                  :ignore-filter="true"
                >
                  <ComboboxAnchor as-child>
                    <TagsInput
                      v-model="selectedTechnos"
                      class="px-2 gap-2 w-80"
                    >
                      <div class="flex gap-2 flex-wrap items-center">
                        <TagsInputItem
                          v-for="{ value, label } in selectedTechnos"
                          :key="value"
                          :value="label"
                        >
                          <TagsInputItemText />
                          <TagsInputItemDelete
                            @click="handleDeleteTechno(value)"
                          />
                        </TagsInputItem>
                      </div>

                      <ComboboxInput v-model="technoSearchTerm" as-child>
                        <TagsInputInput
                          placeholder="Technologies..."
                          class="min-w-[200px] w-full p-0 border-none focus-visible:ring-0 h-auto"
                          @keydown.enter.prevent
                        />
                      </ComboboxInput>
                    </TagsInput>

                    <ComboboxList class="w-[--reka-popper-anchor-width]">
                      <ComboboxEmpty />
                      <ComboboxGroup>
                        <ComboboxItem
                          v-for="techno in filteredTechnos"
                          :key="techno.value"
                          :value="techno.label"
                          @select.prevent="
                            (ev) => {
                              if (typeof ev.detail.value === 'string') {
                                technoSearchTerm = '';
                                selectedTechnos.push({
                                  label: ev.detail.value,
                                  value: getTechno(ev.detail.value),
                                });
                              }

                              if (filteredTechnos.length === 0) {
                                technoOpen = false;
                              }
                            }
                          "
                        >
                          {{ techno.label }}
                        </ComboboxItem>
                      </ComboboxGroup>
                    </ComboboxList>
                  </ComboboxAnchor>
                </Combobox>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="image">
            <FormItem>
              <FormLabel>Project image</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="project image"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="year">
            <FormItem>
              <FormLabel>Project year</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="specialization">
            <FormItem>
              <FormLabel>Project specialization</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a specialization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="spec in specializations"
                      :key="spec.value"
                      :value="spec.value"
                    >
                      {{ spec.label }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="date">
            <FormItem>
              <FormLabel>Project date</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="project date"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="status">
            <FormItem>
              <FormLabel>Project status</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Displayed">Displayed</SelectItem>
                    <SelectItem value="Hidden">Hidden</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>

        <DialogFooter>
          <Button type="submit" form="dialogForm"> Save changes </Button>
        </DialogFooter>
      </DialogScrollContent>
    </Dialog>
  </Form>
</template>
<script setup lang="ts">
import { Button } from "@ui/components/button";
import {
  Dialog,
  DialogScrollContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/components/form";

import { Input } from "@ui/components/input";
import { toast } from "@ui/components/toast";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select";
import { Textarea } from "@ui/components/textarea";
import { TagsInput } from "@ui/components/tags-input";
import { Combobox, ComboboxAnchor, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList, ComboboxEmpty } from "@ui/components/combobox";
import { useFilter } from "reka-ui";
import { createProject, editProject } from "@/layers/app/api";

const props = defineProps({
  project: {
    type: Object,
    required: false,
    default: null,
  },
  participantList: {
    type: Array,
    required: true,
  },
  technoList: {
    type: Array,
    required: true,
  },
  specList: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["success"]);

const selectedTechnos = ref([]);
const selectedParticipants = ref([]);

const specializations = computed(() => {
  return props.specList.map((spec) => ({
    value: spec.id,
    label: spec.name,
  }));
});
const technos = computed(() => {
  return props.technoList.map((techno) => ({
    value: techno.id,
    label: techno.name,
  }));
});
const participants = computed(() => {
  return props.participantList.map((user) => ({
    value: user.id,
    label: user.fullname,
  }));
});

onMounted(() => {
  if (props.project) {
    selectedTechnos.value = props.project.techno_name.map((techno) => ({
      value: getTechno(techno),
      label: techno,
    }));
    selectedParticipants.value = props.project.fullname.map((participant) => {
      return {
        value: getParticipant(participant),
        label: participant,
      };
    });
  }
});

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2).max(50),
    link: z.string().url(),
    description: z.string().min(2).max(500),
    fullname: z.array(z.string()).min(1),
    image: z.string().url().optional(),
    techno_name: z.array(z.string()).min(1),
    year: z.string().min(1).max(1),
    specialization: z.string(),
    date: z.string(),
    status: z.enum(["Displayed", "Hidden"]),
  }),
);
const initialValues = props.project
  ? {
      ...props.project,
      specialization: props.project.specialization[0],
    }
  : null;

const technoOpen = ref(false);
const participantOpen = ref(false);
const technoSearchTerm = ref("");
const participantsSearchTerm = ref("");
const { contains } = useFilter({ sensitivity: "base" });
const filteredTechnos = computed(() => {
  const options = technos.value.filter(
    (i) => !selectedTechnos.value.map((item) => item.label).includes(i.label),
  );
  return technoSearchTerm.value
    ? options.filter((option) => contains(option.label, technoSearchTerm.value))
    : options;
});
const filteredParticipants = computed(() => {
  const options = participants.value.filter(
    (i) =>
      !selectedParticipants.value.map((item) => item.label).includes(i.label),
  );
  return participantsSearchTerm.value
    ? options.filter((option) =>
        contains(option.label, participantsSearchTerm.value),
      )
    : options;
});
async function onSubmit(values: Record<string, string | string[]>) {
  const projectData = {
    ...values,
    specialization: [values.specialization],
    assignee: selectedParticipants.value.map((item) => item.value),
    techno: selectedTechnos.value.map((item) => item.value),
  };
  if(props.project)
    await editProject(projectData, props.project.idAirTable).then(() => {
      emit("success");
      toast({
        title: "Project updated",
        description: "The project has been updated successfully.",
        variant: "success",
      });
    });
  else
    await createProject(projectData).then(() => {
      emit("success");
      toast({
        title: "Project created",
        description: "The project has been created successfully.",
        variant: "success",
      });
    });
}
function getParticipant(value: string) {
  const participant = participants.value.find((p) => p.label === value);
  return participant ? participant.value : null;
}
function getTechno(value: string) {
  const techno = technos.value.find((t) => t.label === value);
  return techno ? techno.value : null;
}
function handleDeleteParticipant(value: string) {
  selectedParticipants.value = selectedParticipants.value.filter(
    (item) => item.value !== value,
  );
}
function handleDeleteTechno(value: string) {
  selectedTechnos.value = selectedTechnos.value.filter(
    (item) => item !== value,
  );
}
</script>
