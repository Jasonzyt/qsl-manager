<template>
  <div class="max-w-md m-auto py-8">
    <UCard class="max-w-md">
      <template #header>
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.08em] text-gray-500">
            QSL Manager
          </p>
          <h1 class="text-xl font-semibold">
            {{ mode === "login" ? "登录" : "注册" }}
          </h1>
          <p class="text-gray-500 text-sm">第一个注册的用户会被标记为管理员</p>
        </div>
      </template>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        title="操作失败"
        :description="error"
        class="mb-4"
      />

      <UForm
        :state="state"
        :validate="validate"
        class="space-y-4"
        @submit="submit"
      >
        <UFormField label="邮箱" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            placeholder="you@example.com"
          />
        </UFormField>

        <UFormField label="密码" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="至少 6 位"
          />
        </UFormField>

        <div class="flex items-center justify-between gap-2 flex-wrap">
          <UButton
            color="primary"
            variant="ghost"
            type="button"
            @click="toggleMode"
          >
            {{ mode === "login" ? "去注册" : "已有账号？去登录" }}
          </UButton>
          <UButton color="primary" type="submit" :loading="pending">
            {{ mode === "login" ? "登录" : "注册并登录" }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "@nuxt/ui";

const supabase = useSupabaseClient();
const router = useRouter();
const mode = ref<"login" | "register">("login");
const error = ref("");
const pending = ref(false);

const state = reactive({
  email: "",
  password: "",
});

type Schema = typeof state;

const toggleMode = () => {
  mode.value = mode.value === "login" ? "register" : "login";
  error.value = "";
};

function validate(state: Partial<Schema>): FormError[] {
  const errors: FormError[] = [];
  if (!state.email) errors.push({ name: "email", message: "Required" });
  if (!state.password) errors.push({ name: "password", message: "Required" });
  return errors;
}

const submit = async (event: FormSubmitEvent<Schema>) => {
  event.preventDefault();
  error.value = "";
  pending.value = true;

  try {
    if (mode.value === "register") {
      await $fetch("/api/auth/register", {
        method: "POST",
        body: { email: state.email.trim(), password: state.password },
      });
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: state.email.trim(),
      password: state.password,
    });

    if (signInError) throw signInError;

    await router.push("/");
  } catch (err: any) {
    error.value = err?.message || err?.data?.statusMessage || "操作失败";
  } finally {
    pending.value = false;
  }
};
</script>
