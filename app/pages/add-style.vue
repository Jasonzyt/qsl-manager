<template>
  <div class="max-w-2xl mx-auto space-y-4 py-8 px-2">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <p class="text-sm text-gray-500 uppercase tracking-[0.08em]">
            QSL 卡片
          </p>
          <h1 class="text-xl font-semibold">新增样式</h1>
          <p class="text-gray-500 text-sm">可自定义样式 ID（整数）与名称</p>
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
        <UFormField label="样式名称 (styleName)" name="styleName" required>
          <UInput
            v-model="state.styleName"
            placeholder="例如：纪念版 A"
            class="w-full"
          />
        </UFormField>

        <div class="flex items-center justify-between gap-4 flex-wrap pt-2">
          <UButton color="primary" type="submit" :loading="pending">
            保存样式
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";

const state = reactive({
  styleName: "",
});

type Schema = typeof state;

const error = ref("");
const pending = ref(false);
const toast = useToast();

function validate(values: Partial<Schema>): FormError[] {
  const errors: FormError[] = [];
  if (!values.styleName) errors.push({ name: "styleName", message: "必填" });
  return errors;
}

const resetForm = () => {
  state.styleName = "";
};

const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
  event.preventDefault();
  error.value = "";
  pending.value = true;

  try {
    const result = await $fetch("/api/styles", {
      method: "POST",
      body: {
        styleName: state.styleName.trim(),
      },
    });

    toast.add({
      title: "已保存样式",
      description: `样式「${result.style_name}」已创建`,
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
