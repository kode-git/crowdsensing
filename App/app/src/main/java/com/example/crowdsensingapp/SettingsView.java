package com.example.crowdsensingapp;


import android.app.AlertDialog;
import android.app.Dialog;
import android.app.NotificationManager;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageButton;
import android.widget.TimePicker;
import android.widget.Toast;


import androidx.appcompat.app.AppCompatDialogFragment;

public class SettingsView extends AppCompatDialogFragment {
    private SettingsAdderViewListener listener;
    private int ButtonSoundStat = 0;
    private int ButtonBlueStat = 0;
    private int ButtonWiFiStat = 0;
    private ImageButton ButtonSound;
    private ImageButton ButtonBlue;
    private ImageButton ButtonWiFi;
    private TimePicker myTime;
    NotificationManager mNotificationManager;

    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        LayoutInflater inflater = getActivity().getLayoutInflater();
        final View view = inflater.inflate(R.layout.settings_view_l, null);






        builder.setView(view).setTitle(getResources().getString(R.string.settingsP))
                .setNegativeButton("cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {

                    }
                })
                .setPositiveButton("ok", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        MyScript script = new MyScript(1,1000);
                        listener.applyAdder(script);
                    }
                });
        return builder.create();
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        listener = (SettingsAdderViewListener) context;
    }

    public interface SettingsAdderViewListener {
        void applyAdder(MyScript script);
    }




}