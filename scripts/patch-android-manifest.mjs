/**
 * La cartella android/ è generata (e ignorata da git), quindi i permessi
 * Health Connect vanno riapplicati ogni volta che si rigenera la piattaforma.
 * Questo script è idempotente: eseguirlo due volte non duplica nulla.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const PATH = "android/app/src/main/AndroidManifest.xml";

if (!existsSync(PATH)) {
  console.error(`✗ ${PATH} non trovato. Esegui prima: npx cap add android`);
  process.exit(1);
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
