<template>
  <div class="flex flex-col items-center justify-center px-8" style="min-height: 80vh">
    <div class="text-ink" style="font-size: 30px; font-weight: 700; letter-spacing: -1px">Equilibrio</div>
    <p class="text-dim text-center mt-2 mb-10" style="font-size: 15px">Un passo per volta.<br />Acqua, alcol, movimento, pasti — con calma.</p>

    <button
      class="bg-card border border-line text-ink w-full max-w-xs py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-soft"
      @click="login">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.9 2.4 30.3 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.1C12.3 13.2 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-3.9 6.7-9.7 6.7-17.4z"/><path fill="#FBBC05" d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.6l-7.3-5.7c-2 1.4-4.7 2.3-8.2 2.3-6.4 0-11.7-3.7-13.6-9.4l-7.9 6.1C6.4 42.6 14.6 48 24 48z"/></svg>
      Accedi con Google
    </button>

    <p class="text-faint mt-6" style="font-size: 12px; text-align: center; max-width: 280px">
      I tuoi dati restano tuoi. La sincronizzazione cloud è opzionale.
    </p>
  </div>
</template>

<script setup lang="ts">
const { signInWithGoogle } = useAuth();
async function login() {
  await signInWithGoogle();
  await navigateTo("/");
}
</script>
