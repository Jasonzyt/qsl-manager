<template>
  <div class="max-sm:hidden flex w-full h-screen">
    <div class="border-r-2 border-accented p-2 flex flex-col gap-3">
      <UNavigationMenu
        color="neutral"
        orientation="vertical"
        :items="items"
        class="w-48 h-full"
      />
      <UCard
        :ui="{ body: 'px-3 sm:px-3 pt-3 sm:pt-3 pb-4 flex flex-col gap-2' }"
      >
        <div class="flex items-center gap-2">
          <Icon name="lucide:user" size="16" />
          <p class="font-semibold text-ellipsis">
            {{ user?.email || "未登录" }}
          </p>
        </div>
        <div>
          <UButton
            v-if="user"
            size="xs"
            color="neutral"
            variant="soft"
            block
            @click="signOut"
          >
            退出
          </UButton>
          <UButton
            v-else
            size="xs"
            color="primary"
            variant="soft"
            block
            to="/login"
          >
            去登录
          </UButton>
        </div>
      </UCard>
    </div>
    <div class="grow w-full"><slot /></div>
  </div>
  <div class="sm:hidden flex justify-end">
    <UDropdownMenu :items="itemsMobile" class="absolute m-4">
      <UButton icon="i-lucide-menu" color="neutral" variant="outline" />
    </UDropdownMenu>
    <div class="grow w-full px-2"><slot /></div>
  </div>
</template>

<script setup lang="ts">
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
    {
      label: "样式管理",
      type: "label",
    },
    {
      label: "样式列表",
      icon: "i-heroicons-rectangle-stack-20-solid",
      to: "/styles",
    },
    {
      label: "新增样式",
      icon: "i-heroicons-plus-20-solid",
      to: "/add-style",
    },
  ],
]);

const user = useSupabaseUser();
const supabase = useSupabaseClient();

const signOut = async () => {
  await supabase.auth.signOut();
};

const itemsMobile = items.value.concat([
  [
    {
      label: "用户",
      type: "label",
    },
    {
      label: user?.value?.email || "未登录",
      icon: "i-lucide:user",
      to: "/profile",
    },
    {
      label: user ? "退出登录" : "去登录",
      icon: user ? "i-lucide:log-out" : "i-lucide:log-in",
      to: user ? undefined : "/login",
      action: user ? signOut : undefined,
    },
  ],
]);
</script>
