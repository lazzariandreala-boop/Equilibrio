import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "it.equilibrio.app",
  appName: "Equilibrio",
  // Build statica generata da `nuxt generate`
  webDir: ".output/public",
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#5FB0C4",
    },
    FirebaseAuthentication: {
      // login Google nativo; poi accediamo al JS SDK con la credenziale (per Firestore)
      skipNativeAuth: true,
      providers: ["google.com"],
    },
  },
  // Se APP_SERVER_URL è impostata, l'app installata carica direttamente il
  // deploy invece dei file impacchettati: così si aggiorna da sola a ogni
  // push, senza reinstallare l'APK. Richiede connessione a internet.
  server: {
    // Senza queste voci la WebView spedirebbe il consenso Withings al browser
    // di sistema: i cookie con i token finirebbero lì e l'app non li vedrebbe.
    allowNavigation: [
      "equilibrio-ebpu.vercel.app",
      "*.vercel.app",
      "account.withings.com",
      "*.withings.com",
    ],
    ...(process.env.APP_SERVER_URL ? { url: process.env.APP_SERVER_URL, cleartext: false } : {}),
  },
};

export default config;
