export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;
  const { $firebase } = useNuxtApp();
  // Modalità demo (Firebase non configurato): nessun login richiesto.
  if (!$firebase) return;

  const { user, ready } = useAuth();
  if (!ready.value) return; // attende l'init in app.vue
  if (!user.value && to.path !== "/login") return navigateTo("/login");
  if (user.value && to.path === "/login") return navigateTo("/");
});
