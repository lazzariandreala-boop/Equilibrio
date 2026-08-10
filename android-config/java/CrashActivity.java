package it.equilibrio.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

/**
 * Schermata di diagnosi: senza cavo USB non si può leggere il logcat, quindi
 * l'ultimo crash viene salvato su file e mostrato al riavvio.
 * È la prima activity ad aprirsi: se non c'è nulla da mostrare passa subito
 * la mano a MainActivity e l'utente non la vede nemmeno.
 */
public class CrashActivity extends Activity {

    private static final String FILE = "ultimo-crash.txt";

    public static void install(final Activity activity) {
        final Thread.UncaughtExceptionHandler previous = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, error) -> {
            try {
                StringWriter sw = new StringWriter();
                PrintWriter pw = new PrintWriter(sw);
                pw.println("Thread: " + thread.getName());
                pw.println("Errore: " + error);
                pw.println();
                error.printStackTrace(pw);

                Throwable cause = error.getCause();
                int depth = 0;
                while (cause != null && depth++ < 5) {
                    pw.println();
                    pw.println("Causato da: " + cause);
                    cause.printStackTrace(pw);
                    cause = cause.getCause();
                }

                pw.flush(); // senza questo lo StringWriter resta vuoto
                String text = sw.toString();
                if (text.trim().isEmpty()) text = "Eccezione senza stack trace: " + error;

                File f = new File(activity.getFilesDir(), FILE);
                try (FileOutputStream out = new FileOutputStream(f)) {
                    out.write(text.getBytes(StandardCharsets.UTF_8));
                    out.flush();
                }
            } catch (Throwable ignored) {
            }
            if (previous != null) previous.uncaughtException(thread, error);
        });
    }

    /** Un'app può leggere il proprio logcat: utile se il gestore non scatta. */
    private static String readLogcat() {
        StringBuilder sb = new StringBuilder();
        try {
            Process p = Runtime.getRuntime().exec(new String[]{"logcat", "-d", "-t", "260", "-v", "brief"});
            try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                String line;
                while ((line = r.readLine()) != null) {
                    if (line.contains("AndroidRuntime") || line.contains("equilibrio")
                            || line.contains("Capacitor") || line.contains("CapHealth")
                            || line.contains("FATAL") || line.startsWith("E/")) {
                        sb.append(line).append('\n');
                    }
                }
            }
        } catch (Throwable t) {
            sb.append("logcat non leggibile: ").append(t);
        }
        return sb.toString();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        File f = new File(getFilesDir(), FILE);
        if (!f.exists()) {
            startActivity(new Intent(this, MainActivity.class));
            finish();
            return;
        }

        String trace;
        try {
            trace = new String(Files.readAllBytes(f.toPath()), StandardCharsets.UTF_8);
        } catch (Exception e) {
            trace = "";
        }
        if (trace.trim().isEmpty()) {
            trace = "(nessuno stack trace salvato)\n\n--- LOGCAT ---\n" + readLogcat();
        }

        final int BG = Color.parseColor("#100E0D");

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);
        root.setPadding(32, 64, 32, 32);

        TextView title = new TextView(this);
        title.setText("Equilibrio si è chiuso");
        title.setTextColor(Color.WHITE);
        title.setTextSize(20);
        root.addView(title);

        TextView hint = new TextView(this);
        hint.setText("Fotografa questo testo (scorri fino in fondo) e mandalo a chi segue lo sviluppo.");
        hint.setTextColor(Color.parseColor("#AB9E94"));
        hint.setTextSize(12);
        hint.setPadding(0, 10, 0, 16);
        root.addView(hint);

        TextView body = new TextView(this);
        body.setText(trace);
        body.setTextColor(Color.parseColor("#FFB07A"));
        body.setBackgroundColor(BG);
        body.setTextSize(9);
        body.setTextIsSelectable(true);
        body.setPadding(8, 8, 8, 8);

        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(BG);
        scroll.addView(body);
        root.addView(scroll, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));

        Button retry = new Button(this);
        retry.setText("Cancella e riprova");
        retry.setOnClickListener(v -> {
            f.delete();
            startActivity(new Intent(this, MainActivity.class));
            finish();
        });
        root.addView(retry);

        setContentView(root);
    }
}
