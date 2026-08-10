package it.equilibrio.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

/**
 * Schermata di diagnosi: senza un cavo USB non c'è modo di leggere il logcat,
 * quindi l'ultimo crash viene salvato su file e mostrato qui al riavvio.
 * È il primo activity ad aprirsi: se non c'è nessun crash, passa subito
 * la mano a MainActivity e l'utente non la vede nemmeno.
 */
public class CrashActivity extends Activity {

    private static final String FILE = "ultimo-crash.txt";

    /** Da chiamare all'avvio: registra il gestore che salva lo stack trace. */
    public static void install(final Activity activity) {
        final Thread.UncaughtExceptionHandler previous = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, error) -> {
            try {
                StringWriter sw = new StringWriter();
                error.printStackTrace(new PrintWriter(sw));
                File f = new File(activity.getFilesDir(), FILE);
                try (FileOutputStream out = new FileOutputStream(f)) {
                    out.write(sw.toString().getBytes(StandardCharsets.UTF_8));
                }
            } catch (Throwable ignored) {
            }
            if (previous != null) previous.uncaughtException(thread, error);
        });
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
            trace = "Impossibile leggere il file di crash: " + e;
        }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#100E0D"));
        root.setPadding(36, 72, 36, 36);

        TextView title = new TextView(this);
        title.setText("Equilibrio si è chiuso");
        title.setTextColor(Color.parseColor("#F5EFE9"));
        title.setTextSize(22);
        root.addView(title);

        TextView hint = new TextView(this);
        hint.setText("Fotografa questo testo e mandalo a chi segue lo sviluppo.");
        hint.setTextColor(Color.parseColor("#AB9E94"));
        hint.setTextSize(13);
        hint.setPadding(0, 12, 0, 20);
        root.addView(hint);

        TextView body = new TextView(this);
        body.setText(trace);
        body.setTextColor(Color.parseColor("#FF8F45"));
        body.setTextSize(10);
        body.setTextIsSelectable(true);

        ScrollView scroll = new ScrollView(this);
        scroll.addView(body);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f);
        root.addView(scroll, lp);

        Button retry = new Button(this);
        retry.setText("Cancella e riprova");
        retry.setOnClickListener((View v) -> {
            f.delete();
            startActivity(new Intent(this, MainActivity.class));
            finish();
        });
        root.addView(retry);

        setContentView(root);
    }
}
