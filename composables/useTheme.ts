// Il valore di partenza viene letto dalla classe già impostata sul documento
// dallo script eseguito prima del disegno: così l'interfaccia non parte da
// un'ipotesi diversa da quella che l'utente sta guardando.
const isDark = ref(
  import.meta.client ? document.documentElement.classList.contains("dark") : true,
);

export function useTheme() {
  function apply() {
    if (!import.meta.client) return;
    const el = document.documentElement;
    el.classList.toggle("dark", isDark.value);
    el.style.colorScheme = isDark.value ? "dark" : "light";
    localStorage.setItem("equilibrio:theme", isDark.value ? "dark" : "light");

    // La barra di sistema segue il tema, altrimenti resta di un colore
    // che stona con la pagina.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark.value ? "#0D0F14" : "#F1ECE4");
  }

  function init() {
    if (!import.meta.client) return;
    const saved = localStorage.getItem("equilibrio:theme");
    if (saved) isDark.value = saved === "dark";
    else isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    apply();
  }

  function toggle() {
    isDark.value = !isDark.value;
    apply();
  }

  return { isDark, init, toggle };
}
