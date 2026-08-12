// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },

  // Nella build nativa il Service Worker va escluso: dentro Capacitor cachea
  // la shell e impedisce all'app di caricare (stesso problema già visto su GlicoLog).
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    ...(process.env.NATIVE_BUILD === "1" ? [] : ["@vite-pwa/nuxt"]),
  ],

  tailwindcss: { cssPath: "~/assets/css/main.css" },

  app: {
    head: {
      title: "Equilibrio",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { name: "theme-color", content: "#100E0D" },
        { name: "description", content: "Un passo per volta: idratazione, alcol, movimento e pasti." },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Outfit:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },

  // Variabili lette SOLO lato server (non finiscono nel bundle client).
  runtimeConfig: {
    anthropicApiKey: "", // NUXT_ANTHROPIC_API_KEY (non più usata: riconoscimento su Gemini)
    geminiApiKey: "", // NUXT_GEMINI_API_KEY (riconoscimento foto, tier gratuito)
    withingsClientId: "", // NUXT_WITHINGS_CLIENT_ID
    withingsClientSecret: "", // NUXT_WITHINGS_CLIENT_SECRET
    public: {
      // config Firebase (chiavi pubbliche lato client)
      // Marca della build: permette di capire a colpo d'occhio quale versione
      // è installata, invece di dedurlo dalle schermate.
      build: process.env.BUILD_STAMP || "dev",
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
      theme_color: "#100E0D",
      background_color: "#100E0D",
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
