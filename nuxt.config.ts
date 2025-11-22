import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.NUXT_PUBLIC_SUPABASE_KEY
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/supabase', '@nuxt/icon', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  nitro: {
    externals: {
      inline: ['@supabase/supabase-js']
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  runtimeConfig: {
    supabase: {
      url: supabaseUrl,
      key: supabaseAnonKey,
      serviceKey: supabaseServiceRoleKey
    },
    public: {
      supabaseUrl,
      supabaseKey: supabaseAnonKey
    }
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/login-success',
      exclude: ['/api']
    },
    url: supabaseUrl,
    key: supabaseAnonKey,
    serviceKey: supabaseServiceRoleKey
  }
})