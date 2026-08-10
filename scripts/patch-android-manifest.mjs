/**
 * La cartella android/ è generata (e ignorata da git), quindi i permessi
 * Health Connect vanno riapplicati ogni volta che si rigenera la piattaforma.
 * Questo script è idempotente: eseguirlo due volte non duplica nulla.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const PATH = "android/app/src/main/AndroidManifest.xml";
const VARS = "android/variables.gradle";

// capacitor-health richiede minSdk 26 (Health Connect non esiste sotto Android 8):
// il template Capacitor parte da 22, quindi il merge del manifest fallirebbe.
if (existsSync(VARS)) {
  let vars = readFileSync(VARS, "utf8");
  if (/minSdkVersion\s*=\s*(\d+)/.test(vars)) {
    const current = Number(RegExp.$1);
    if (current < 26) {
      vars = vars.replace(/minSdkVersion\s*=\s*\d+/, "minSdkVersion = 26");
      writeFileSync(VARS, vars);
      console.log(`✓ minSdkVersion portato da ${current} a 26 (richiesto da Health Connect)`);
    } else {
      console.log("• minSdkVersion già sufficiente");
    }
  }
}

if (!existsSync(PATH)) {
  console.error(`✗ ${PATH} non trovato. Esegui prima: npx cap add android`);
  process.exit(1);
}

// ── Firma stabile ──────────────────────────────────────────────
// Il runner di GitHub genererebbe un debug keystore nuovo a ogni build:
// la SHA-1 cambierebbe e il login Google smetterebbe di funzionare.
// Usiamo quindi un keystore fisso versionato in android-config/.
const APP_GRADLE = "android/app/build.gradle";
if (existsSync(APP_GRADLE) && existsSync("android-config/debug.keystore")) {
  let g = readFileSync(APP_GRADLE, "utf8");
  if (!g.includes("equilibrioDebug")) {
    g = g.replace(
      "    buildTypes {",
      `    signingConfigs {
        equilibrioDebug {
            storeFile file('../../android-config/debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
            // v1 attiva: alcuni gestori di download e Android vecchi la vogliono
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.equilibrioDebug
        }`,
    );
    writeFileSync(APP_GRADLE, g);
    console.log("✓ Firma di debug stabile configurata");
  } else {
    console.log("• Firma di debug già configurata");
  }
}

let xml = readFileSync(PATH, "utf8");

const RATIONALE = `
            <!-- Health Connect: schermata che spiega perché servono i permessi (Android 13 e precedenti) -->
            <intent-filter>
                <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
            </intent-filter>
`;

const ALIAS = `
        <!-- Health Connect: stessa schermata su Android 14+ -->
        <activity-alias
            android:name="ViewPermissionUsageActivity"
            android:exported="true"
            android:targetActivity=".MainActivity"
            android:permission="android.permission.START_VIEW_PERMISSION_USAGE">
            <intent-filter>
                <action android:name="android.intent.action.VIEW_PERMISSION_USAGE" />
                <category android:name="android.intent.category.HEALTH_PERMISSIONS" />
            </intent-filter>
        </activity-alias>
`;

const PERMISSIONS = `
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Health Connect: lettura di passi e allenamenti. Qui confluiscono anche
         Samsung Health, Huawei Health, Garmin Connect e Google Health. -->
    <uses-permission android:name="android.permission.health.READ_STEPS" />
    <uses-permission android:name="android.permission.health.READ_EXERCISE" />
    <uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED" />
    <uses-permission android:name="android.permission.health.READ_TOTAL_CALORIES_BURNED" />
    <uses-permission android:name="android.permission.health.READ_DISTANCE" />
    <uses-permission android:name="android.permission.health.READ_HEART_RATE" />

    <queries>
        <package android:name="com.google.android.apps.healthdata" />
    </queries>
`;

let changed = false;

if (!xml.includes("ACTION_SHOW_PERMISSIONS_RATIONALE")) {
  xml = xml.replace("        </activity>", `${RATIONALE}\n        </activity>\n${ALIAS}`);
  changed = true;
}

if (!xml.includes("permission.health.READ_STEPS")) {
  xml = xml.replace(
    '<uses-permission android:name="android.permission.INTERNET" />',
    `<uses-permission android:name="android.permission.INTERNET" />\n${PERMISSIONS}`,
  );
  changed = true;
}

if (changed) {
  writeFileSync(PATH, xml);
  console.log("✓ Manifest aggiornato con i permessi Health Connect");
} else {
  console.log("• Manifest già a posto, nessuna modifica");
}

// ── Branding: icona dell'app ────────────────────────────────
import { cpSync, mkdirSync, readdirSync } from "node:fs";

const BRAND = "android-config/branding/generated";
if (existsSync(BRAND)) {
  for (const dir of readdirSync(BRAND).filter((d) => d.startsWith("mipmap-"))) {
    cpSync(`${BRAND}/${dir}`, `android/app/src/main/res/${dir}`, { recursive: true });
  }
  // Il fondo dell'adaptive icon segue la tinta scura del logo.
  const colors = "android/app/src/main/res/values/ic_launcher_background.xml";
  writeFileSync(
    colors,
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#100E0D</color>\n</resources>\n`,
  );
  console.log("✓ Icona dell'app aggiornata");
}

// ── Diagnostica: schermata che mostra l'ultimo crash ────────
const JAVA_DIR = "android/app/src/main/java/it/equilibrio/app";
if (existsSync("android-config/java/CrashActivity.java") && existsSync(JAVA_DIR)) {
  mkdirSync(JAVA_DIR, { recursive: true });
  cpSync("android-config/java/CrashActivity.java", `${JAVA_DIR}/CrashActivity.java`);

  // MainActivity installa il gestore prima che il bridge si avvii.
  writeFileSync(
    `${JAVA_DIR}/MainActivity.java`,
    `package it.equilibrio.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Registrato prima di super.onCreate(): così cattura anche i crash
        // che avvengono durante l'inizializzazione dei plugin.
        CrashActivity.install(this);
        super.onCreate(savedInstanceState);
    }
}
`,
  );

  // CrashActivity diventa il punto d'ingresso: se non c'è nessun crash
  // salvato, passa immediatamente a MainActivity.
  let m = readFileSync(PATH, "utf8");
  if (!m.includes("CrashActivity")) {
    m = m.replace(
      `            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>`,
      "",
    );
    m = m.replace(
      "        <provider",
      `        <activity
            android:name=".CrashActivity"
            android:exported="true"
            android:theme="@android:style/Theme.DeviceDefault.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <provider`,
    );
    writeFileSync(PATH, m);
    console.log("✓ Schermata di diagnosi crash installata");
  }
}
