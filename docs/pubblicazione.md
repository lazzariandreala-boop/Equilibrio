# Pubblicare Equilibrio

## 1. Creare la chiave di firma

La chiave serve a dimostrare che gli aggiornamenti vengono da te. **Se la perdi non
puoi più aggiornare l'app sul Play Store**: conservala in un posto sicuro, per
esempio un gestore di password, oltre che nei secret di GitHub.

Sul tuo computer, con Java installato:

```bash
keytool -genkeypair -v \
  -keystore equilibrio-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias equilibrio \
  -dname "CN=Andrea Lazzari, O=Equilibrio, C=IT"
```

Ti chiederà una password: usane una lunga e annotala.

## 2. Caricare i secret su GitHub

In `Settings → Secrets and variables → Actions → New repository secret`:

| Nome | Valore |
| --- | --- |
| `RELEASE_KEYSTORE_BASE64` | l'output di `base64 -w0 equilibrio-release.jks` |
| `RELEASE_STORE_PASSWORD` | la password del keystore |
| `RELEASE_KEY_ALIAS` | `equilibrio` |
| `RELEASE_KEY_PASSWORD` | la password della chiave (di solito la stessa) |
| `GOOGLE_SERVICES_JSON` | il contenuto di `google-services.json` |

Il file `.jks` non va mai messo nel repository.

## 3. Generare i pacchetti

Dal tab **Actions → Release firmata → Run workflow**, indicando:

- **versionName**: la versione visibile, per esempio `1.0.0`
- **versionCode**: un numero che **deve crescere** a ogni pubblicazione (1, 2, 3…).
  Il Play Store rifiuta un caricamento con un numero già usato.

In alternativa basta creare un tag: `git tag v1.0.0 && git push --tags`.

Il workflow produce due file:

- `.apk` — per l'installazione diretta, da mandare a chi vuoi
- `.aab` — il formato richiesto dal Play Store

Se i secret mancano, il workflow si ferma subito invece di produrre un pacchetto
non firmato che nessuno potrebbe installare.

## 4. Play Store

Serve un account sviluppatore (25 dollari una tantum) e, prima della
pubblicazione:

- una **privacy policy** raggiungibile da un indirizzo pubblico
- il modulo **Data safety**, dichiarando quali dati raccogli e perché
- la **dichiarazione per Health Connect**: trattando dati sanitari, Google
  richiede di spiegare l'uso dei permessi e la revisione è più severa del solito

Conviene partire da un canale di **test interno**, che si attiva in poche ore,
prima di affrontare la revisione per la pubblicazione aperta.

## 5. Chiave Gemini degli utenti

Il riconoscimento dei pasti usa la chiave configurata sul server, quindi le
richieste di tutti pesano su quell'account. Ogni utente può inserire la
propria in `Profilo → Riconoscimento dei pasti`: in quel caso le sue richieste
usano il suo account. Senza chiave l'app funziona comunque, con la stima locale
e la ricerca alimenti che non hanno costi.
