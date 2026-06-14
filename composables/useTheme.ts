const isDark = ref(true);

export function useTheme() {
  function apply() {
    if (import.meta.client) {
      document.documentElement.classList.toggle("dark", isDark.value);
      localStorage.setItem("equilibrio:theme", isDark.value ? "dark" : "light");
    }
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
