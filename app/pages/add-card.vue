<template>
  <div class="max-w-md mx-auto space-y-4 py-8 px-2">
    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm text-gray-500 uppercase tracking-[0.08em]">
              QSL 卡片
            </p>
            <h1 class="text-xl font-semibold mt-1">新增卡片</h1>
            <p class="text-gray-500 text-sm">
              填写卡片编号、样式 ID 以及 toRadio
            </p>
          </div>
        </div>
      </template>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        title="提交失败"
        :description="error"
        class="mb-4"
      />

      <UForm
        :state="state"
        :validate="validate"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormField label="卡片编号 (cardNumber)" name="cardNumber" required>
          <UInput
            v-model="state.cardNumber"
            type="number"
            placeholder="例如：1001"
            class="w-32"
          />
        </UFormField>

        <UFormField label="样式 (style)" name="styleId" required>
          <USelectMenu
            v-model="state.style"
            :items="styleOptions"
            option-attribute="label"
            placeholder="选择样式"
            :disabled="stylesLoading"
            class="w-56 h-8"
          />
        </UFormField>

        <UFormField label="发给 (toRadio)" name="toRadio" required>
          <UInput v-model="state.toRadio" placeholder="对方呼号" />
        </UFormField>

        <div class="flex items-center justify-between gap-4 flex-wrap pt-2">
          <span class="text-sm text-gray-500">所有字段必填</span>
          <UButton color="primary" type="submit" :loading="pending">
            保存卡片
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";

type StyleOption = { id: string; label: string };

const state = reactive({
  cardNumber: "",
  style: { id: "", label: "" } as StyleOption,
  toRadio: "",
});

const error = ref("");
const pending = ref(false);
const toast = useToast();

const { data: stylesData, pending: stylesLoading } = await useAsyncData(
  "add-card-styles",
  () => $fetch("/api/styles")
);

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

const resetForm = () => {
  state.cardNumber = "";
  state.style = { id: "", label: "" } as StyleOption;
  state.toRadio = "";
};

type Schema = typeof state;

function validate(values: Partial<Schema>): FormError[] {
  const errors: FormError[] = [];
  if (!values.cardNumber) errors.push({ name: "cardNumber", message: "必填" });
  if (!values.style?.id) errors.push({ name: "styleId", message: "必填" });
  if (!values.toRadio) errors.push({ name: "toRadio", message: "必填" });
  return errors;
}

const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
  event.preventDefault();
  error.value = "";
  pending.value = true;

  const cardNumber = Number.parseInt(state.cardNumber, 10);
  const styleId = Number.parseInt(state.style.id ?? "", 10);
  const toRadio = state.toRadio.trim();

  if (!Number.isInteger(cardNumber)) {
    error.value = "请输入有效的卡片编号（整数）";
    pending.value = false;
    return;
  }

  if (!Number.isInteger(styleId)) {
    error.value = "请输入有效的样式 ID（整数）";
    pending.value = false;
    return;
  }

  if (!toRadio) {
    error.value = "toRadio 不能为空";
    pending.value = false;
    return;
  }

  try {
    await $fetch("/api/cards", {
      method: "POST",
      body: {
        cardNumber,
        styleId,
        toRadio,
      },
    });

    toast.add({
      title: "已保存卡片",
      description: `卡片 #${cardNumber} 已创建`,
      color: "success",
      icon: "i-lucide-circle-check",
    });

    resetForm();
  } catch (err: any) {
    error.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      "提交失败";
  } finally {
    pending.value = false;
  }
};
</script>
