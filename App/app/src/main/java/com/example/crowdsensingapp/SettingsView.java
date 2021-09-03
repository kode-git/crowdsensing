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
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.TimePicker;
import android.widget.Toast;


import androidx.appcompat.app.AppCompatDialogFragment;

public class SettingsView extends AppCompatDialogFragment {
    private SettingsAdderViewListener listener;
    private TextView neighText;
    private TextView rangeText;
    private TextView timeText;
    private SeekBar seekNeigh;
    private SeekBar seekRange;
    private SeekBar seekTime;
    private MyScript script;


    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {




        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        LayoutInflater inflater = getActivity().getLayoutInflater();
        final View view = inflater.inflate(R.layout.settings_view_l, null);
        Bundle bundle = getArguments();
        int actualRange = bundle.getInt("range",1000);
        int actualNeigh = bundle.getInt("neigh",1);
        int actualTime = bundle.getInt("time",60);
        script = new MyScript(actualNeigh,actualRange,actualTime);



        neighText = (TextView) view.findViewById(R.id.titleNeigh);
        rangeText = (TextView) view.findViewById(R.id.titleRange);
        timeText = (TextView) view.findViewById(R.id.titleTime);
        seekNeigh = (SeekBar) view.findViewById(R.id.seek);
        seekRange = (SeekBar) view.findViewById(R.id.seekRange);
        seekTime = (SeekBar) view.findViewById(R.id.seekTime);
        neighText.setText("Min. neigh: "+ actualNeigh+"+");
        seekNeigh.setProgress(script.getnNeighbour());
        rangeText.setText("Range in meters: "+ actualRange);
        seekRange.setProgress(script.getRange());
        timeText.setText("Maximum minutes time: "+ actualTime);
        seekTime.setProgress(script.getMinutesTime());

        seekNeigh.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int i, boolean b) {
                script.setnNeighbour(i);
                neighText.setText("Min. neigh: "+ i+"+");
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });

        seekRange.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int i, boolean b) {
                script.setRange(i);
                rangeText.setText("Range in meters: "+ i);
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });


        seekTime.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int i, boolean b) {
                script.setMinutesTime(i);
                timeText.setText("Maximum minutes time: "+ i);
                if (i==1440) timeText.setText("Maximum minutes time: 1 day");
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });



        builder.setView(view).setTitle(getResources().getString(R.string.settingsP))
                .setNegativeButton("cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {

                    }
                })
                .setPositiveButton("ok", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        //MyScript script = new MyScript(1,1000);
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