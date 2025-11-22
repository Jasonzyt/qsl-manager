<template>
  <div class="py-8">
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="加载失败"
      :description="String(error)"
    />
    <UCard class="h-full max-w-[800px] m-auto">
      <UTable :data="rows" :columns="columns" :loading="pending" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import type { TableColumn } from "@nuxt/ui";

type Style = {
  id: number;
  style_name: string;
  created_at: string;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const columns: TableColumn<Style>[] = [
  {
    accessorKey: "id",
    header: "样式 ID",
    cell: ({ row }) =>
      h("div", { class: "pill" }, [
        h("i", { class: "i-lucide-tag text-sm" }),
        h("span", `#${row.getValue("id")}`),
      ]),
  },
  {
    accessorKey: "style_name",
    header: "样式名称",
    cell: ({ row }) => h("span", { class: "font-semibold" }, row.getValue("style_name")),
  },
  {
    accessorKey: "created_at",
    header: "创建于",
    cell: ({ row }) => formatDate(row.getValue("created_at") as string),
  },
];

const { data, pending, error } = await useAsyncData("styles-list", () =>
  $fetch("/api/styles")
);

const rows = computed(() => data.value || []);
</script>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #0f172a;
  font-weight: 600;
  font-size: 13px;
}
</style>
