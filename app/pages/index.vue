<template>
  <div class="py-8">
    <div class="max-w-[1000px] m-auto">
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        title="加载失败"
        :description="String(error)"
        class="mb-4"
      />
      <div class="mb-4 flex gap-4">
        <div>
          搜索 ToRadio:
          <UInput
            v-model="searchInputValue"
            placeholder="搜索 toRadio..."
            class="max-w-sm"
            :disabled="status === 'pending'"
            clearable
          />
        </div>
        <div>
          跳过前
          <UInput
            v-model="jumpToInputValue"
            placeholder="多少条"
            class="max-w-sm"
            :disabled="status === 'pending'"
            clearable
            type="number"
          />记录
        </div>
      </div>
      <UCard class="w-full">
        <UTable
          ref="table"
          :data="rows"
          :columns="columns"
          :loading="status === 'pending'"
          sticky
          class="h-[80vh]"
        />
      </UCard>
    </div>

    <UModal
      v-model:open="editOpen"
      :close="{
        color: 'primary',
        variant: 'ghost',
        class: 'rounded-full',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">编辑卡片</h3>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <UFormField label="卡片编号" name="cardNumber" required>
            <UInput v-model="editForm.cardNumber" type="number" />
          </UFormField>
          <UFormField label="样式" name="styleId" required>
            <USelectMenu
              v-model="editForm.style"
              :items="styleOptions"
              option-attribute="label"
              placeholder="选择样式"
              class="w-56 h-8"
            />
          </UFormField>
          <UFormField label="toRadio" name="toRadio" required>
            <UInput v-model="editForm.toRadio" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="editOpen = false">
            取消
          </UButton>
          <UButton color="primary" :loading="editLoading" @click="submitEdit">
            保存
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { useDebounceFn, useInfiniteScroll } from "@vueuse/core";
import type { Row } from "@tanstack/vue-table";
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

type Card = {
  id: number;
  card_number: number;
  style_id: number;
  to_radio: string;
  created_at: string;
  updated_at: string;
};

const search = ref("");
const searchInputValue = ref("");

const jumpToInputValue = ref(0);

const { data: stylesData } = await useAsyncData("styles", () =>
  $fetch("/api/styles")
);
const styleMap = computed(() => {
  const map = new Map<number, string>();
  (stylesData.value || []).forEach((s: any) => {
    map.set(s.id, s.style_name);
  });
  return map;
});

const styleOptions = computed(() => {
  const list = (stylesData.value as any[] | null) || [];
  return list
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((s) => ({
      id: String(s.id),
      label: `${s.id} - ${s.style_name}`,
    }));
});

const limit = 20;
const skip = ref(0);
const rows = ref<Card[]>([]);
const total = ref(0);
const editOpen = ref(false);
const editLoading = ref(false);
const editForm = reactive({
  cardNumber: "",
  style: { id: "", label: "" },
  toRadio: "",
});
const originalCardNumber = ref<number | null>(null);
const toast = useToast();

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
    header: "样式",
    cell: ({ row }) => {
      const id = row.getValue("style_id") as number;
      const name = styleMap.value.get(id);
      return h("div", { class: "pill" }, [
        h("i", { class: "i-lucide-palette text-sm" }),
        h("span", name || `#${id}`),
      ]);
    },
  },
  {
    accessorKey: "updated_at",
    header: "更新于",
    cell: ({ row }) => formatDate(row.getValue("updated_at") as string),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: {
              align: "end",
            },
            items: getRowItems(row),
            "aria-label": "Actions dropdown",
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
              "aria-label": "Actions dropdown",
            })
        )
      );
    },
  },
];

function getRowItems(row: Row<Card>) {
  return [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "Modify Card",
      onSelect() {
        openEditor(row.original);
      },
    },
  ];
}

const { data, status, error, execute } = await useFetch("/api/cards", {
  key: "cards-infinite",
  params: { q: search, limit, offset: skip },
  transform: (payload: any) => payload,
  lazy: true,
  immediate: false,
});

watch(
  data,
  (val) => {
    if (!val) return;
    const items = (val as any).items || [];
    total.value = (val as any).total || 0;
    if (skip.value === 0) {
      rows.value = items;
    } else {
      rows.value = [...rows.value, ...items];
    }
  },
  { immediate: false }
);

const triggerSearch = useDebounceFn(() => {
  rows.value = [];
  skip.value = 0;
  search.value = searchInputValue.value.trim();
}, 1000);

watch(
  () => searchInputValue.value,
  () => {
    triggerSearch();
  }
);

const triggerJump = useDebounceFn(() => {
  rows.value = [];
  skip.value = jumpToInputValue.value - 1;
}, 1000);

watch(
  () => jumpToInputValue.value,
  () => {
    triggerJump();
  }
);

const table = useTemplateRef("table");

const loadMore = () => {
  if (status.value === "pending") return;
  skip.value += limit;
  if (skip.value >= total.value) return;
  execute();
};

const openEditor = (card: Card) => {
  originalCardNumber.value = card.card_number;
  editForm.cardNumber = String(card.card_number);
  editForm.style.id = String(card.style_id);
  editForm.style.label = styleMap.value.get(card.style_id)
    ? String(card.style_id)
    : "";
  editForm.toRadio = card.to_radio;
  editOpen.value = true;
};

const submitEdit = async () => {
  if (!originalCardNumber.value) return;

  const cardNumber = Number.parseInt(editForm.cardNumber, 10);
  const styleId = Number.parseInt(editForm.style.id, 10);
  const toRadio = editForm.toRadio.trim();

  if (!Number.isInteger(cardNumber) || !Number.isInteger(styleId) || !toRadio) {
    toast.add({
      title: "请输入合法的卡片编号、样式 ID 和 toRadio",
      color: "error",
    });
    return;
  }

  try {
    editLoading.value = true;
    const updated = (await $fetch(`/api/cards/${originalCardNumber.value}`, {
      method: "PUT",
      body: { cardNumber, styleId, toRadio },
    })) as Card;

    const idx = rows.value.findIndex(
      (r) => r.card_number === originalCardNumber.value
    );
    if (idx !== -1) {
      rows.value[idx] = updated;
    }

    toast.add({
      title: "已更新卡片",
      description: `卡片 #${updated.card_number} 已保存`,
      color: "success",
    });
    editOpen.value = false;
  } catch (err: any) {
    toast.add({
      title: "更新失败",
      description:
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.message ||
        "更新失败",
      color: "error",
    });
  } finally {
    editLoading.value = false;
  }
};

onMounted(() => {
  execute();
  useInfiniteScroll(
    table.value?.$el,
    () => {
      loadMore();
    },
    {
      distance: 200,
      canLoadMore: () =>
        status.value !== "pending" && skip.value + limit < total.value,
    }
  );
});
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
