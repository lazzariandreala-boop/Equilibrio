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
  },
  // Per avere parità completa con le API (riconoscimento foto, Withings),
  // l'app nativa può caricare direttamente il deploy invece dei file statici:
  // server: { url: "https://equilibrio.vercel.app", cleartext: false },
};

export default config;
