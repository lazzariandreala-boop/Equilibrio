// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@vite-pwa/nuxt"],

  tailwindcss: { cssPath: "~/assets/css/main.css" },

  app: {
    head: {
      title: "Equilibrio",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { name: "theme-color", content: "#14110F" },
        { name: "description", content: "Un passo per volta: idratazione, alcol, movimento e pasti." },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
      ],
    },
  },

  // Variabili lette SOLO lato server (non finiscono nel bundle client).
  runtimeConfig: {
    anthropicApiKey: "", // NUXT_ANTHROPIC_API_KEY
    withingsClientId: "", // NUXT_WITHINGS_CLIENT_ID
    withingsClientSecret: "", // NUXT_WITHINGS_CLIENT_SECRET
    public: {
      // config Firebase (chiavi pubbliche lato client)
      firebase: {
        apiKey: "", // NUXT_PUBLIC_FIREBASE_API_KEY
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
      },
      // base URL delle API (utile per l'app nativa Capacitor che punta al deploy)
      apiBase: "", // NUXT_PUBLIC_API_BASE  (es. https://equilibrio.vercel.app)
      withingsRedirectUri: "", // NUXT_PUBLIC_WITHINGS_REDIRECT_URI
    },
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Equilibrio",
      short_name: "Equilibrio",
      description: "Un passo per volta.",
      lang: "it",
      theme_color: "#14110F",
      background_color: "#14110F",
      display: "standalone",
      start_url: "/",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    workbox: { navigateFallback: "/" },
    devOptions: { enabled: false },
  },

  typescript: { strict: true },
});
