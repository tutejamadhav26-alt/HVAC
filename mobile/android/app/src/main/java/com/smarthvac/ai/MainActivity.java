package com.smarthvac.ai;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends AppCompatActivity {

    private EditText editApiUrl;
    private Button btnSaveUrl, btnRefresh;
    private TextView tvHealthScore, tvFaultStatus, tvConfidence, tvSeverity;
    private TextView tvTemp, tvHumidity, tvPressure, tvCurrent, tvPower;
    private TextView tvAlerts;

    private String apiBaseUrl = "http://10.0.2.2:8000"; // Default emulator/local IP
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private boolean isPolling = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        editApiUrl = findViewById(R.id.editApiUrl);
        btnSaveUrl = findViewById(R.id.btnSaveUrl);
        btnRefresh = findViewById(R.id.btnRefresh);

        tvHealthScore = findViewById(R.id.tvHealthScore);
        tvFaultStatus = findViewById(R.id.tvFaultStatus);
        tvConfidence = findViewById(R.id.tvConfidence);
        tvSeverity = findViewById(R.id.tvSeverity);

        tvTemp = findViewById(R.id.tvTemp);
        tvHumidity = findViewById(R.id.tvHumidity);
        tvPressure = findViewById(R.id.tvPressure);
        tvCurrent = findViewById(R.id.tvCurrent);
        tvPower = findViewById(R.id.tvPower);
        tvAlerts = findViewById(R.id.tvAlerts);

        editApiUrl.setText(apiBaseUrl);

        btnSaveUrl.setOnClickListener(v -> {
            apiBaseUrl = editApiUrl.getText().toString().trim();
            Toast.makeText(this, "API URL updated: " + apiBaseUrl, Toast.LENGTH_SHORT).show();
            fetchLatestData();
        });

        btnRefresh.setOnClickListener(v -> fetchLatestData());

        startAutoRefresh();
    }

    private void startAutoRefresh() {
        mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (isPolling) {
                    fetchLatestData();
                    mainHandler.postDelayed(this, 3000);
                }
            }
        }, 1000);
    }

    private void fetchLatestData() {
        executor.execute(() -> {
            try {
                // 1. Fetch Latest Prediction
                String predUrl = apiBaseUrl + "/api/predictions/latest";
                String predJson = httpGet(predUrl);
                if (predJson != null) {
                    JSONObject pObj = new JSONObject(predJson);
                    double health = pObj.optDouble("health_score", 95.0);
                    String fault = pObj.optString("predicted_fault", "normal");
                    double conf = pObj.optDouble("confidence", 98.0);
                    String sev = pObj.optString("severity", "Low");

                    mainHandler.post(() -> {
                        tvHealthScore.setText(String.format("%.1f / 100", health));
                        tvFaultStatus.setText(fault.replace("_", " ").toUpperCase());
                        tvConfidence.setText(String.format("%.1f%%", conf));
                        tvSeverity.setText("Severity: " + sev);
                    });
                }

                // 2. Fetch Latest Sensor Reading
                String sensorUrl = apiBaseUrl + "/api/sensors/latest";
                String sensorJson = httpGet(sensorUrl);
                if (sensorJson != null) {
                    JSONObject sObj = new JSONObject(sensorJson);
                    double temp = sObj.optDouble("temperature", 24.0);
                    double hum = sObj.optDouble("humidity", 50.0);
                    double press = sObj.optDouble("pressure", 101.3);
                    double curr = sObj.optDouble("current", 4.8);
                    double pow = sObj.optDouble("power", 1050.0);

                    mainHandler.post(() -> {
                        tvTemp.setText(String.format("%.1f °C", temp));
                        tvHumidity.setText(String.format("%.1f %%", hum));
                        tvPressure.setText(String.format("%.1f kPa", press));
                        tvCurrent.setText(String.format("%.2f A", curr));
                        tvPower.setText(String.format("%.0f W", pow));
                    });
                }

                // 3. Fetch Active Alerts
                String alertUrl = apiBaseUrl + "/api/alerts";
                String alertJson = httpGet(alertUrl);
                if (alertJson != null) {
                    JSONArray arr = new JSONArray(alertJson);
                    StringBuilder sb = new StringBuilder();
                    int count = Math.min(arr.length(), 3);
                    for (int i = 0; i < count; i++) {
                        JSONObject a = arr.getJSONObject(i);
                        sb.append("• [").append(a.optString("severity")).append("] ")
                          .append(a.optString("message")).append("\n");
                    }
                    if (arr.length() == 0) {
                        sb.append("No active alerts. System healthy.");
                    }
                    String alertText = sb.toString();
                    mainHandler.post(() -> tvAlerts.setText(alertText));
                }

            } catch (Exception e) {
                // Server might be connecting
            }
        });
    }

    private String httpGet(String urlStr) {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(urlStr);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(4000);

            if (conn.getResponseCode() == 200) {
                BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                }
                br.close();
                return sb.toString();
            }
        } catch (Exception ignored) {
        } finally {
            if (conn != null) conn.disconnect();
        }
        return null;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        isPolling = false;
        executor.shutdown();
    }
}
