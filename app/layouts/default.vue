<template>
  <div class="max-sm:hidden flex w-full h-screen">
    <div class="border-r-2 border-accented p-2">
      <UNavigationMenu
        color="neutral"
        orientation="vertical"
        :items="items"
        class="w-48 h-full"
      />
    </div>
    <div class="grow w-full"><slot /></div>
  </div>
  <div class="sm:hidden flex justify-end">
    <UDropdownMenu :items="items">
      <UButton icon="i-lucide-menu" color="neutral" variant="outline" />
    </UDropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { NavigationMenuItem } from "@nuxt/ui";

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: "QSL Manager",
      type: "label",
    },
    {
      label: "所有卡片",
      icon: "i-heroicons-table-cells-20-solid",
      to: "/",
    },
    {
      label: "新增卡片",
      icon: "i-heroicons-plus-circle-20-solid",
      to: "/add-card",
    },
  ],
]);
</script>

<style scoped></style>
