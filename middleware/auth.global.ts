export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;
  const { $firebase } = useNuxtApp();
  // Modalità demo (Firebase non configurato): nessun login richiesto.
  if (!$firebase) return;

  const { user, ready } = useAuth();
  if (!ready.value) return; // app.vue mostra la schermata di avvio finché non si sa
  if (!user.value && to.path !== "/login") return navigateTo("/login");
  if (user.value && to.path === "/login") return navigateTo("/");
});
