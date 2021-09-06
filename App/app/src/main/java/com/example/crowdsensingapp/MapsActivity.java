package com.example.crowdsensingapp;

import static android.provider.CallLog.Locations.LATITUDE;
import static java.lang.Math.log10;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import java.io.UnsupportedEncodingException;
import java.lang.*;
import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;

import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.HttpHeaderParser;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.example.crowdsensingapp.databinding.ActivityMapsBinding;
import com.google.android.gms.tasks.OnSuccessListener;
import com.mapbox.geojson.Feature;
import com.mapbox.geojson.Point;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.prefs.Preferences;

public class MapsActivity extends FragmentActivity implements OnMapReadyCallback,SettingsView.SettingsAdderViewListener {

    private GoogleMap mMap;
    private ActivityMapsBinding binding;
    private Location actuaLocation = null;
    private MediaRecorder  mRecorder;
    private Button recordButton;
    private Button settingsButton;
    private MyScript actualSettings = new MyScript(1,1000,60);
    private SharedPreferences pref;
    private TextView meanDb;
    private Marker myPosition;
    private ImageButton playButton;
    private Boolean startRec = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

    //restoring privacy preferences
        pref = getPreferences(Context.MODE_PRIVATE);
        Map <String, ?> privacySett= (Map<String, Integer>) pref.getAll();
        for (Map.Entry<String, ?> entry : privacySett.entrySet()) {

            if(entry.getKey().equals("nNeighbour")) {
                actualSettings.setnNeighbour((int) entry.getValue());
            }else if (entry.getKey().equals("range")){
                actualSettings.setRange((int) entry.getValue());
            }else if(entry.getKey().equals("time")){
                actualSettings.setMinutesTime((int) entry.getValue());
            }
        }



        //binding the map fragment
        binding = ActivityMapsBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        recordButton = (Button) findViewById(R.id.record_btn);
        settingsButton = (Button) findViewById(R.id.settings);
        meanDb = (TextView) findViewById(R.id.mean);
        playButton = (ImageButton) findViewById(R.id.rec);

        playButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (startRec){
                    startRec=false;
                    playButton.setImageDrawable(getResources().getDrawable(R.drawable.rec));
                }else{
                    startRec=true;
                    playButton.setImageDrawable(getResources().getDrawable(R.drawable.stop));
                }

            }
        });


        settingsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                openSettings();

            }
        });


        recordButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                double powerDb = 10 * log10(getAmplitude());
                System.out.println(powerDb + " My actual DB recorded");
                sendRecordToServer(powerDb);

            }
        });



//permission request if the permissions are denied
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    1);
        }else{
            //using a localization based service
            FusedLocationProviderClient mFusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

            mFusedLocationClient.getLastLocation()
                    .addOnSuccessListener(this, new OnSuccessListener<Location>() {
                        @Override
                        public void onSuccess(Location location) {
                            if (location != null) {
                                actuaLocation = location;
                                if (mMap!=null){
                                    LatLng latLngLoc = new LatLng( actuaLocation.getLatitude(),actuaLocation.getLongitude());
                                    myPosition = mMap.addMarker(new MarkerOptions().position(latLngLoc).title("Your position"));
                                    mMap.moveCamera(CameraUpdateFactory.newLatLng(latLngLoc));
                                }

                            }
                        }

                    });

            //setting the location request
            LocationRequest mLocationRequest = LocationRequest.create();
            mLocationRequest.setInterval(10000);
            mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);



        //my location callback
           LocationCallback mLocationCallback = new LocationCallback() {
                @Override
                public void onLocationResult(LocationResult locationResult) {
                    for (Location location : locationResult.getLocations()) {
                            actuaLocation=location;
                        LatLng latLngLoc = new LatLng( actuaLocation.getLatitude(),actuaLocation.getLongitude());
                        myPosition.setPosition(latLngLoc);
                            //getMeanDbUpd();
                        if (startRec){
                            double powerDb = 10 * log10(getAmplitude());
                            System.out.println(powerDb + " My actual DB recorded");
                            sendRecordToServer(powerDb);
                        }
                    }
                } };
        //setting the location updates
            mFusedLocationClient.requestLocationUpdates(mLocationRequest,
                    mLocationCallback,
                    Looper.getMainLooper());
        }



        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.RECORD_AUDIO},
                    1);
        }else{
           mRecorder = new MediaRecorder();
            mRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            mRecorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);
            mRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);
            mRecorder.setOutputFile("/dev/null");
            try {
                mRecorder.prepare();
            } catch (IOException e) {
                e.printStackTrace();
            }
            mRecorder.start();


        }












        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);
    }

//get the db amplitude when mrecorder is on
    public double getAmplitude(){
        if (mRecorder != null)
            return  (mRecorder.getMaxAmplitude());
        else
            return 0;
    }

    public void getMeanDbUpd(){

        try {
            RequestQueue requestQueue = Volley.newRequestQueue(this);
            String URL = "http://10.0.2.2:3000/getMeanDb";


            Feature pointFeature = Feature.fromGeometry(Point.fromLngLat(actuaLocation.getLongitude(), actuaLocation.getLatitude()));
           // pointFeature.addNumberProperty("Range", actualSettings.getRange());


            final String requestBody = pointFeature.toJson();
            StringRequest stringRequest = new StringRequest(Request.Method.POST, URL, new Response.Listener<String>() {
                @Override
                public void onResponse(String response) {
                    Log.i("VOLLEY", response);
                    try {
                        JSONObject jsonObject = new JSONObject(response);
                        meanDb.setText("- DB mean");
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }

                }
            }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.e("VOLLEY", error.toString());
                }
            }) {
                @Override
                public String getBodyContentType() {
                    return "application/json; charset=utf-8";
                }

                @Override
                public byte[] getBody() throws AuthFailureError {
                    try {
                        return requestBody == null ? null : requestBody.getBytes("utf-8");
                    } catch (UnsupportedEncodingException uee) {
                        VolleyLog.wtf("Unsupported Encoding while trying to get the bytes of %s using %s", requestBody, "utf-8");
                        return null;
                    }
                }

                @Override
                protected Response<String> parseNetworkResponse(NetworkResponse response) {
                    String responseString = "";
                    if (response != null) {
                        responseString = String.valueOf(response.statusCode);
                        // can get more details such as response.headers
                    }
                    return Response.success(responseString, HttpHeaderParser.parseCacheHeaders(response));
                }
            };

            requestQueue.add(stringRequest);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void openSettings(){
        SettingsView settingsView = new SettingsView();
        Bundle bundle = new Bundle();
        bundle.putInt("range",actualSettings.getRange());
        bundle.putInt("neigh",actualSettings.getnNeighbour());
        bundle.putInt("time",actualSettings.getMinutesTime());
        settingsView.setArguments(bundle);
        settingsView.show(getSupportFragmentManager(), "settings");
    }
//interface between the dialog fragment and the main activity
    public void applyAdder(MyScript s){
        SharedPreferences.Editor editor = pref.edit();
        actualSettings.setnNeighbour(s.getnNeighbour());
        actualSettings.setRange(s.getRange());
        actualSettings.setMinutesTime(s.getMinutesTime());
        editor.putInt("nNeighbour", s.getnNeighbour());
        editor.putInt("range", s.getRange());
        editor.putInt("time", s.getMinutesTime());
        editor.commit();
    }

    /**
     * Manipulates the map once available.
     * This callback is triggered when the map is ready to be used.
     * This is where we can add markers or lines, add listeners or move the camera. In this case,
     * we just add a marker near Sydney, Australia.
     * If Google Play services is not installed on the device, the user will be prompted to install
     * it inside the SupportMapFragment. This method will only be triggered once the user has
     * installed Google Play services and returned to the app.
     */
    @Override
    public void onMapReady(GoogleMap googleMap) {
        this.mMap = googleMap;

    }

    public void sendRecordToServer(double myDB){

        try {
            RequestQueue requestQueue = Volley.newRequestQueue(this);
            String URL = "http://10.0.2.2:3000/createLocation";

            Feature pointFeature = Feature.fromGeometry(Point.fromLngLat(actuaLocation.getLongitude(), actuaLocation.getLatitude()));

            pointFeature.addNumberProperty("Neighbour", actualSettings.getnNeighbour());
            pointFeature.addNumberProperty("Range", actualSettings.getRange());
            pointFeature.addNumberProperty("time", actualSettings.getMinutesTime());
            pointFeature.addNumberProperty("Db", myDB);


            
            final String requestBody = pointFeature.toJson();





            StringRequest stringRequest = new StringRequest(Request.Method.POST, URL, new Response.Listener<String>() {
                @Override
                public void onResponse(String response) {
                    Log.i("VOLLEY", response);
                }
            }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.e("VOLLEY", error.toString());
                }
            }) {
                @Override
                public String getBodyContentType() {
                    return "application/json; charset=utf-8";
                }

                @Override
                public byte[] getBody() throws AuthFailureError {
                    try {
                        return requestBody == null ? null : requestBody.getBytes("utf-8");
                    } catch (UnsupportedEncodingException uee) {
                        VolleyLog.wtf("Unsupported Encoding while trying to get the bytes of %s using %s", requestBody, "utf-8");
                        return null;
                    }
                }

                @Override
                protected Response<String> parseNetworkResponse(NetworkResponse response) {
                    String responseString = "";
                    if (response != null) {
                        responseString = String.valueOf(response.statusCode);
                        // can get more details such as response.headers
                    }
                    return Response.success(responseString, HttpHeaderParser.parseCacheHeaders(response));
                }
            };

            requestQueue.add(stringRequest);
        } catch (Exception e) {
            e.printStackTrace();
        }






    }
}