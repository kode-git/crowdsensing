package com.example.crowdsensingapp;

import java.util.Objects;

/**
 * SettingData is a class which manage the data of the settingsView object inside the MapsActivity
 */
public class SettingData {

    // instance variables
    private int nNeighbour = 1;
    private int range;
    private int minutesTime;
    private int to;
    private boolean privacyOnOff;
    private boolean defaultOnOff;


    /**
     * Costructor of the SettingData objects with every instance variables
     * @param neigh is the k used for the spatial cloaking privacy algorithm
     * @param range is the actual circle ray to delimit the possible aggregations
     * @param minutesTime is the time in minutes which a sent location lives in the trusted backend (if it is not aggregated)
     * @param prvc is a flag to apply privacy policy or not
     * @param def is a flag to pass default data in the settingsView
     * @param to is the alpha for the automatic locations
     */
    public SettingData(int neigh, int range, int minutesTime, boolean prvc, boolean def, int to){
        this.nNeighbour=neigh;
        this.range=range;
        this.minutesTime=minutesTime;
        this.privacyOnOff = prvc;
        this.defaultOnOff = def;
        this.to=to;

    }

    // Getter and setter default methods

    public int getTo() {
        return to;
    }

    public void setTo(int to) {
        this.to = to;
    }

    public boolean isDefaultOnOff() {
        return defaultOnOff;
    }

    public void setDefaultOnOff(boolean defaultOnOff) {
        this.defaultOnOff = defaultOnOff;
    }

    public boolean isPrivacyOnOff() {
        return privacyOnOff;
    }

    public void setPrivacyOnOff(boolean privacyOnOff) {
        this.privacyOnOff = privacyOnOff;
    }

    public int getnNeighbour() {
        return nNeighbour;
    }

    public void setnNeighbour(int nNeighbour) {
        this.nNeighbour = nNeighbour;
    }

    public int getRange() {
        return range;
    }

    public void setRange(int range) {
        this.range = range;
    }

    public int getMinutesTime() {
        return minutesTime;
    }

    public void setMinutesTime(int minutesTime) {
        this.minutesTime = minutesTime;
    }

    // Equals, hashCode and toString methods
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SettingData that = (SettingData) o;
        return nNeighbour == that.nNeighbour && range == that.range && minutesTime == that.minutesTime;
    }

    @Override
    public int hashCode() {
        return Objects.hash(nNeighbour, range, minutesTime);
    }

    @Override
    public String toString() {
        return "SettingData{" +
                "nNeighbour=" + nNeighbour +
                ", range=" + range +
                ", minutesTime=" + minutesTime +
                '}';
    }
}
