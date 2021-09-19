package com.example.crowdsensingapp;


import static java.lang.Math.log10;

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
import android.widget.CompoundButton;
import android.widget.ImageButton;
import android.widget.SeekBar;
import android.widget.Switch;
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
    private Switch privacyOnOff;
    private Switch defaultOnOff;
    private SettingData setting;


    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {

        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        LayoutInflater inflater = getActivity().getLayoutInflater();
        final View view = inflater.inflate(R.layout.settings_view_l, null);
        Bundle bundle = getArguments();
        int actualRange = bundle.getInt("range",1000);
        int actualNeigh = bundle.getInt("neigh",1);
        int actualTime = bundle.getInt("time",60);
        boolean actualPrivacy = bundle.getBoolean("prv",true);
        boolean actualDefPrivacy = bundle.getBoolean("def",false);
        setting = new SettingData(actualNeigh,actualRange,actualTime,actualPrivacy,actualDefPrivacy);
        privacyOnOff = (Switch) view.findViewById(R.id.privacyOnOff);
        defaultOnOff = (Switch) view.findViewById(R.id.autoOnOff);
        neighText = (TextView) view.findViewById(R.id.titleNeigh);
        rangeText = (TextView) view.findViewById(R.id.titleRange);
        timeText = (TextView) view.findViewById(R.id.titleTime);
        seekNeigh = (SeekBar) view.findViewById(R.id.seek);
        seekRange = (SeekBar) view.findViewById(R.id.seekRange);
        seekTime = (SeekBar) view.findViewById(R.id.seekTime);
        neighText.setText("Min. neigh: "+ actualNeigh+"+");
        seekNeigh.setProgress(setting.getnNeighbour());
        rangeText.setText("Range in meters: "+ actualRange);
        seekRange.setProgress(setting.getRange());
        timeText.setText("Maximum minutes time: "+ actualTime);
        seekTime.setProgress(setting.getMinutesTime());
        privacyOnOff.setChecked(setting.isPrivacyOnOff());
        defaultOnOff.setChecked(setting.isDefaultOnOff());

        seekNeigh.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int i, boolean b) {
                setting.setnNeighbour(i);
                neighText.setText("Min. neigh: "+ i+"+");
                defaultOnOff.setChecked(false);
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
                setting.setRange(i);
                rangeText.setText("Range in meters: "+ i);
                defaultOnOff.setChecked(false);
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });

        privacyOnOff.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked) {
                    setting.setPrivacyOnOff(true);
                } else {
                    setting.setPrivacyOnOff(false);
                    defaultOnOff.setChecked(false);
                }
            }
        });
        defaultOnOff.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked) {
                    setting.setDefaultOnOff(true);
                    privacyOnOff.setChecked(true);
                } else {
                    setting.setDefaultOnOff(false);
                }
            }
        });



        seekTime.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int i, boolean b) {
                setting.setMinutesTime(i);
                timeText.setText("Maximum minutes time: "+ i);
                if (i==1440) timeText.setText("Maximum minutes time: 1 day");
                defaultOnOff.setChecked(false);
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
                        listener.applyAdder(setting);
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
        void applyAdder(SettingData script);
    }




}