/**
 * Verifica che ogni identificatore usato nel template esista davvero nello
 * script del componente. Serve a intercettare i casi in cui una modifica
 * rimuove una variabile lasciando il binding orfano: il componente smette
 * di comparire senza che nulla segnali l'errore.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";

// Nomi forniti da Vue, Nuxt o dal ciclo di vita del template.
const GLOBALS = new Set([
  "true", "false", "null", "undefined", "Math", "Number", "String", "Object", "Array",
  "JSON", "Date", "console", "window", "document", "item", "index", "key", "value",
  "$event", "$slots", "$emit", "computed", "ref", "props", "NaN", "Boolean", "parseInt",
  "parseFloat", "isNaN", "new", "typeof", "in", "of", "return", "if", "else", "toLocaleString",
]);

function identifiers(expr) {
  // Le stringhe non contengono riferimenti: vanno tolte, altrimenti ogni
  // parola di un testo verrebbe scambiata per una variabile.
  const clean = expr.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, " ");

  return [...clean.matchAll(/(^|[^.\w$])([a-zA-Z_$][a-zA-Z0-9_$]*)/g)]
    .map((m) => m[2])
    .filter((n) => !GLOBALS.has(n));
}

const files = [];
for (const dir of ["pages", "components"]) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) if (f.endsWith(".vue")) files.push(`${dir}/${f}`);
}

let problems = 0;
for (const file of files) {
  const src = readFileSync(file, "utf8");
  const tpl = src.slice(src.indexOf("<template>"), src.indexOf("</template>"));
  const script = src.slice(src.indexOf("<script"));
  if (!tpl || !script) continue;

  // Espressioni nei binding, negli eventi e nelle interpolazioni.
  const exprs = [
    ...[...tpl.matchAll(/(?::|@|v-if=|v-else-if=|v-show=|v-for=|v-model[.\w]*=)["']([^"']+)["']/g)].map((m) => m[1]),
    ...[...tpl.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]),
  ];

  const seen = new Set();
  for (const expr of exprs) {
    for (const name of identifiers(expr)) {
      if (seen.has(name)) continue;
      seen.add(name);
      // Le variabili di v-for sono dichiarate nel template stesso.
      if (new RegExp(`v-for=["'][^"']*\\b${name}\\b[^"']*\\bin\\b`).test(tpl)) continue;
      if (new RegExp(`\\b${name}\\b`).test(script)) continue;
      console.log(`MANCANTE  ${file}: "${name}" usato nel template ma assente nello script`);
      problems++;
    }
  }
}

console.log(problems ? `\n${problems} riferimenti orfani` : "\nNessun riferimento orfano nei template");
process.exit(problems ? 1 : 0);
