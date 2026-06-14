# Equilibrio

Companion calmo per quattro fronti che si tengono insieme: **idratazione, alcol, movimento, pasti**. Nuxt 3 + PWA, pronto per Capacitor (Android/iOS), Firebase (Google login + Firestore) e riconoscimento foto dei pasti via API Claude (server-side).

Pensato per essere usato da PC (browser/PWA) e da telefono (stessa PWA o app nativa).

---

## Avvio rapido

```bash
npm install
cp .env.example .env   # compila quello che ti serve (vedi sotto)
npm run dev            # http://localhost:3000
```

Senza alcuna chiave parte comunque in **modalità demo**: dati salvati solo in locale (localStorage), niente login richiesto. Tutto navigabile subito.

---

## Configurazione (per i pezzi "veri")

Tutto via `.env` (vedi `.env.example`). Le chiavi `NUXT_PUBLIC_*` finiscono nel bundle client; le altre restano solo lato server.

### 1. Riconoscimento foto (Claude)
```
NUXT_ANTHROPIC_API_KEY=sk-ant-...
```
La chiamata avviene in `server/api/recognize.post.ts`, quindi la key **non** è mai esposta al client. Il client manda solo l'immagine in base64 e riceve la lista alimenti già pronta da correggere.

### 2. Firebase (login Google + sync cloud)
Crea un progetto su console.firebase.google.com, attiva **Authentication → Google** e **Firestore**, poi compila i `NUXT_PUBLIC_FIREBASE_*`. Con Firebase configurato:
- `/login` mostra l'accesso Google;
- i dati si sincronizzano in `users/{uid}` (vedi `composables/useCloudSync.ts`).

Regola Firestore minima:
```
match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

### 3. Withings (opzionale)
Registra un'app su developer.withings.com, poi:
```
NUXT_WITHINGS_CLIENT_ID=...
NUXT_WITHINGS_CLIENT_SECRET=...
NUXT_PUBLIC_WITHINGS_REDIRECT_URI=http://localhost:3000/api/withings/callback
```
Flusso OAuth in `server/api/withings/login.get.ts` e `callback.get.ts`. **Verifica endpoint e scope sulla doc attuale** — sono scaffold con i TODO segnati (persistenza token + chiamata `measure?action=getmeas` per peso/composizione).

---

## App nativa (Capacitor)

```bash
npm run generate          # build statica in .output/public
npx cap add android       # (o ios)
npm run cap:sync
npx cap open android
```

Note:
- `capacitor.config.ts` usa `webDir: ".output/public"`. In alternativa puoi puntare l'app al deploy live scommentando `server.url` (così funzionano anche le API senza ribuild).
- Notifiche: `composables/useNotifications.ts` usa `@capacitor/local-notifications` su nativo. Nel browser hai un fallback con Notification API (solo a finestra aperta).
- Login Google su nativo richiede il plugin di auth nativo di Google/Firebase (il `signInWithPopup` web non funziona dentro la WebView). È il principale TODO per la build nativa.

---

## Struttura

```
pages/            Oggi (index) · pasti · movimento · profilo · login
components/       BalanceRing (anello firma) · MealCapture · UrgeSurf · BottomSheet · nav/header/card
stores/           day (acqua, streak alcol, pasti, movimento) · settings (obiettivi, promemoria)
composables/      useTheme · useAuth · useCloudSync · useRecognition · useNotifications · useWithings*
server/api/       recognize.post.ts · withings/{login,callback}
plugins/          firebase.client · persist.client (localStorage)
assets/css/       main.css (palette light/dark via CSS variables)
```

## Design
Tema caldo e calmo (non un'app fitness "urlata"). Palette via CSS variables in `main.css`, light + dark. L'elemento firma è l'**anello dell'equilibrio**: i quattro fronti in un solo cerchio invece di quattro barre separate.

## Sull'alcol
Il modulo è pensato per ridurre, non per "contare per giustificare": streak di giorni puliti, *urge surfing*, e registrazione delle ricadute **senza colpa** (la vergogna fa ricadere di più). Per un percorso serio di riduzione, l'app è un supporto: il medico resta l'alleato principale.

## TODO principali
- [ ] Login Google nativo (Capacitor) oltre al popup web
- [ ] Persistenza token Withings per utente + fetch misure
- [ ] Refinement guardia auth dopo il resolve di onAuthStateChanged
- [ ] Storico/grafici sui giorni passati (i dati sono già salvati per data)
- [ ] Icona maskable rifinita
```
