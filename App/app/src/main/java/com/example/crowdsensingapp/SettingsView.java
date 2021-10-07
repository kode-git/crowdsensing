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

/**
 * SettingsView is the class to manage the view of the settingsData inside the Android application UI
 */
public class SettingsView extends AppCompatDialogFragment {

    // instance variables
    private SettingsAdderViewListener listener;
    private TextView neighText;
    private TextView rangeText;
    private TextView timeText;
    private TextView tradeL;
    private SeekBar seekNeigh;
    private SeekBar seekRange;
    private SeekBar seekTime;
    private SeekBar seekTrade;
    private Switch privacyOnOff;
    private Switch defaultOnOff;
    private SettingData setting;


    /**
     * onCreateDialog has an invocation when we click on the "Settings" button and show SettingData in the UI
     * @param savedInstanceState is the bundle to save the current instance state
     * @return the dialog
     */
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
        int autoTO = bundle.getInt("to",50);
        setting = new SettingData(actualNeigh,actualRange,actualTime,actualPrivacy,actualDefPrivacy,autoTO);
        privacyOnOff = (Switch) view.findViewById(R.id.privacyOnOff);
        defaultOnOff = (Switch) view.findViewById(R.id.autoOnOff);
        neighText = (TextView) view.findViewById(R.id.titleNeigh);
        rangeText = (TextView) view.findViewById(R.id.titleRange);
        timeText = (TextView) view.findViewById(R.id.titleTime);
        tradeL = (TextView) view.findViewById(R.id.trdL);
        seekNeigh = (SeekBar) view.findViewById(R.id.seek);
        seekRange = (SeekBar) view.findViewById(R.id.seekRange);
        seekTime = (SeekBar) view.findViewById(R.id.seekTime);
        seekTrade = (SeekBar) view.findViewById(R.id.tradeBar);
        neighText.setText("Min. neigh: "+ (actualNeigh));
        seekNeigh.setProgress(setting.getnNeighbour()-1);
        rangeText.setText("Range in meters: "+ actualRange);
        seekRange.setProgress(setting.getRange());
        timeText.setText("Maximum minutes time: "+ actualTime);
        seekTime.setProgress(setting.getMinutesTime());
        privacyOnOff.setChecked(setting.isPrivacyOnOff());
        defaultOnOff.setChecked(setting.isDefaultOnOff());
        if(autoTO!=100) {
            tradeL.setText("Privacy auto tradeOff: " + "0." + autoTO);
        }else {
            tradeL.setText("Privacy auto tradeOff: 1" );
        }
        seekTrade.setProgress(setting.getTo());

        if (!privacyOnOff.isChecked()){
            defaultOnOff.setChecked(false);
            seekNeigh.setVisibility(View.GONE);
            seekRange.setVisibility(View.GONE);
            seekTime.setVisibility(View.GONE);
            neighText.setVisibility(View.GONE);
            rangeText.setVisibility(View.GONE);
            timeText.setVisibility(View.GONE);
        }
        if (defaultOnOff.isChecked()){
            seekNeigh.setVisibility(View.GONE);
            seekRange.setVisibility(View.GONE);
            seekTime.setVisibility(View.GONE);
            neighText.setVisibility(View.GONE);
            rangeText.setVisibility(View.GONE);
            timeText.setVisibility(View.GONE);
            seekTrade.setVisibility(View.VISIBLE);
            tradeL.setVisibility(View.VISIBLE);
        }

        seekNeigh.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int i, boolean b) {
                setting.setnNeighbour(i+1);
                neighText.setText("Min. neigh: "+ (i+1));
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

        //tradeoff bar
        seekTrade.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int i, boolean b) {
                setting.setTo(i);
                if(i!=100) {
                    tradeL.setText("Privacy auto tradeOff: " + "0." + i);
                }else tradeL.setText("Privacy auto tradeOff: 1");
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
                    seekNeigh.setVisibility(View.VISIBLE);
                    seekRange.setVisibility(View.VISIBLE);
                    seekTime.setVisibility(View.VISIBLE);
                    neighText.setVisibility(View.VISIBLE);
                    rangeText.setVisibility(View.VISIBLE);
                    timeText.setVisibility(View.VISIBLE);
                } else {
                    setting.setPrivacyOnOff(false);
                    defaultOnOff.setChecked(false);
                    seekNeigh.setVisibility(View.GONE);
                    seekRange.setVisibility(View.GONE);
                    seekTime.setVisibility(View.GONE);
                    neighText.setVisibility(View.GONE);
                    rangeText.setVisibility(View.GONE);
                    timeText.setVisibility(View.GONE);

                }
            }
        });
        defaultOnOff.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked) {
                    setting.setDefaultOnOff(true);
                    privacyOnOff.setChecked(true);
                    seekNeigh.setVisibility(View.GONE);
                    seekRange.setVisibility(View.GONE);
                    seekTime.setVisibility(View.GONE);
                    neighText.setVisibility(View.GONE);
                    rangeText.setVisibility(View.GONE);
                    timeText.setVisibility(View.GONE);
                    seekTrade.setVisibility(View.VISIBLE);
                    tradeL.setVisibility(View.VISIBLE);

                } else {
                    setting.setDefaultOnOff(false);
                    seekNeigh.setVisibility(View.VISIBLE);
                    seekRange.setVisibility(View.VISIBLE);
                    seekTime.setVisibility(View.VISIBLE);
                    neighText.setVisibility(View.VISIBLE);
                    rangeText.setVisibility(View.VISIBLE);
                    timeText.setVisibility(View.VISIBLE);
                    seekTrade.setVisibility(View.GONE);
                    tradeL.setVisibility(View.GONE);
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