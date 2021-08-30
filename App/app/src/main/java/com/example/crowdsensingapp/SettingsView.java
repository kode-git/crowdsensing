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
    private SeekBar seekNeigh;
    private SeekBar seekRange;
    private MyScript script;


    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {




        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        LayoutInflater inflater = getActivity().getLayoutInflater();
        final View view = inflater.inflate(R.layout.settings_view_l, null);
        Bundle bundle = getArguments();
        int actualRange = bundle.getInt("range",1000);
        System.out.println(actualRange + " AAAAA");
        int actualNeigh = bundle.getInt("neigh",1);
        script = new MyScript(actualNeigh,actualRange);



        neighText = (TextView) view.findViewById(R.id.titleNeigh);
        rangeText = (TextView) view.findViewById(R.id.titleRange);
        seekNeigh = (SeekBar) view.findViewById(R.id.seek);
        seekRange = (SeekBar) view.findViewById(R.id.seekRange);
        neighText.setText("Min. neigh: "+ actualNeigh+"+");
        seekNeigh.setProgress(script.getnNeighbour());
        rangeText.setText("Range in meters: "+ actualRange);
        seekRange.setProgress(script.getRange());

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