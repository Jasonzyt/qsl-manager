<template>
  <div class="py-8">
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="加载失败"
      :description="String(error)"
    />
    <div
      class="max-h-screen max-w-[1000px] m-auto rounded-2xl border-2 border-accented"
    >
      <UTable :data="rows" :columns="columns" :loading="pending" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import type { TableColumn } from "@nuxt/ui";

type Card = {
  id: number;
  card_number: number;
  style_id: number;
  to_radio: string;
  created_at: string;
  updated_at: string;
};

const search = ref("");

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const columns: TableColumn<Card>[] = [
  {
    accessorKey: "card_number",
    header: "卡片编号",
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-semibold" },
        String(row.getValue("card_number"))
      ),
  },
  {
    accessorKey: "to_radio",
    header: "发给 (toRadio)",
    cell: ({ row }) =>
      h("span", { class: "mono" }, row.getValue("to_radio") as string),
  },
  {
    accessorKey: "style_id",
    header: "样式 ID",
    cell: ({ row }) =>
      h("div", { class: "pill" }, [
        h("i", { class: "i-lucide-palette text-sm" }),
        h("span", `#${row.getValue("style_id")}`),
      ]),
  },
  {
    accessorKey: "updated_at",
    header: "更新于",
    cell: ({ row }) => formatDate(row.getValue("updated_at") as string),
  },
  {
    accessorKey: "created_at",
    header: "创建于",
    cell: ({ row }) => formatDate(row.getValue("created_at") as string),
  },
];

const {
  data: cards,
  pending,
  error,
  refresh,
} = await useAsyncData(
  "cards",
  () =>
    $fetch("/api/cards", {
      params: { q: search.value || undefined },
    }),
  { watch: [search] }
);

const rows = computed(() => cards.value || []);
</script>

<style scoped>
.cards-page {
  margin: 0 auto;
  color: #0b1220;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #667085;
  font-size: 12px;
}

h1 {
  margin: 4px 0 0 0;
  font-size: 24px;
  color: #111827;
}

.mono {
  font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}

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

.meta {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #475569;
}

@media (max-width: 640px) {
  .cards-page {
    max-width: 100%;
  }

  h1 {
    font-size: 20px;
  }
}
</style>
